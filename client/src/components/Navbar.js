import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications, setNotifications, unreadChats } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const bellRef = useRef(null);
  
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data);
        } catch (err) {
          console.error('Failed to fetch initial notifications', err);
        }
      };
      fetchNotifications();
    }
  }, [user, setNotifications]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowResults(true);
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchRef, bellRef]);
  
  const unreadNotiCount = notifications.filter(n => !n.read).length;
  const unreadChatCount = Object.keys(unreadChats).length;

  const handleBellClick = async () => {
    const newShowState = !showNotifications;
    setShowNotifications(newShowState);
    
    if (newShowState && unreadNotiCount > 0) {
      try {
        await api.put('/notifications/read');
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (err) {
        console.error('Failed to mark notifications as read', err);
      }
    }
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };


  return (
    <nav className="bg-white shadow-md dark:bg-gray-800 dark:shadow-lg">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-500">
            Glad We Met
          </Link>

          {/* --- 1. HIDE SEARCH ON MOBILE (xs) --- */}
          {user && (
            <div className="hidden sm:block relative w-full max-w-xs mx-4" ref={searchRef}>
              <input
                type="text"
                placeholder="Search for users..."
                className="w-full px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true);
                }}
              />
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-12 left-0 right-0 w-full bg-white rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto dark:bg-gray-700">
                  <ul>
                    {searchResults.map(u => (
                      <li key={u._id}>
                        <Link
                          to={`/profile/${u.username}`}
                          className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={clearSearch}
                        >
                          <img
                            src={u.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${u.username[0]}`}
                            alt={u.username}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <span className="dark:text-white">{u.username}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* --- END SEARCH --- */}


          {/* --- 2. REDUCE SPACING ON MOBILE --- */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <>
                <button
                  onClick={handleChatClick}
                  className="relative text-gray-600 hover:text-blue-600 p-2 rounded-full dark:text-gray-300 dark:hover:text-blue-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12S5.477 2 11 2s10 4.477 10 10z" />
                  </svg>
                  {unreadChatCount > 0 && (
                      <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadChatCount}
                      </span>
                    )}
                </button>
                
                <div className="relative" ref={bellRef}>
                  <button
                    onClick={handleBellClick}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded-full dark:text-gray-300 dark:hover:text-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341A6.002 6.002 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadNotiCount > 0 && (
                      <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadNotiCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown notifications={notifications} />
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-full dark:text-gray-300 dark:hover:text-blue-500"
                >
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>

                {/* --- 3. RESPONSIVE PROFILE LINK --- */}
                <Link
                  to={`/profile/${user.username}`}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-full dark:text-gray-300 dark:hover:text-blue-500 flex items-center"
                >
                  {/* Profile Icon (Mobile) */}
                  <svg className="h-6 w-6 sm:hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {/* Text (Desktop) */}
                  <span className="hidden sm:inline sm:ml-1 sm:px-2 text-sm font-medium">My Profile ({user.username})</span>
                </Link>
                {/* --- END RESPONSIVE LINK --- */}

                <button
                  onClick={logout}
                  className="bg-red-500 text-white hover:bg-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex-1"></div>
                <button
                  onClick={toggleTheme}
                  className="text-gray-600 hover:text-blue-600 p-2 rounded-full dark:text-gray-300 dark:hover:text-blue-500"
                >
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </button>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-blue-500"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}