import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To check initial auth status
  const navigate = useNavigate();

  // 3. Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Set token for all future API requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // 4. Login Function
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;

      // Store in state
      setUser(user);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set token for API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      // We should show this error to the user
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  // 5. Register Function
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      
      const { token, user } = response.data;

      // Store in state
      setUser(user);
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set token for API requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.message || 'Registration failed');
    }
  };


  // 6. Logout Function
  const logout = () => {
    // Clear state
    setUser(null);
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear token from API headers
    delete api.defaults.headers.common['Authorization'];
    
    // Navigate to login
    navigate('/login');
  };

  // --- NEW FUNCTION ---
  // 7. Function to update user in state and localStorage
  // We'll use this after following/unfollowing
  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };


  // 8. Value to be provided by the context
  const value = {
    user,
    login,
    logout,
    register,
    updateUser, // <-- Add new function to context
    isAuthenticated: !!user,
  };

  // 9. Return provider
  // We don't render children until we've checked for existing token
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 10. Create a custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};