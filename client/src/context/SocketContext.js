import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

const playNotificationSound = () => {
  const audio = new Audio('https://cdn.freesound.org/previews/387/387214_140737-lq.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.error("Could not play audio:", e));
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [unreadChats, setUnreadChats] = useState({});
  const currentChatIdRef = useRef(null);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('https://glad-we-met-backend.onrender.com');
      setSocket(newSocket);

      newSocket.emit('addUser', user.id);

      newSocket.on('getOnlineUsers', (users) => {
        setOnlineUsers(users);
      });
      
      newSocket.on('getNotification', (data) => {
        setNotifications((prev) => [data, ...prev]);
      });

      newSocket.on('getMessage', (message) => {
        if (message.conversationId !== currentChatIdRef.current) {
          playNotificationSound();
          setUnreadChats((prev) => ({
            ...prev,
            [message.conversationId]: (prev[message.conversationId] || 0) + 1,
          }));
        }
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user]);

  const setCurrentChat = (chatId) => {
    currentChatIdRef.current = chatId;
    if (chatId) {
      setUnreadChats((prev) => {
        const newUnread = { ...prev };
        delete newUnread[chatId];
        return newUnread;
      });
    }
  };

  const value = {
    socket,
    onlineUsers,
    notifications,
    setNotifications,
    unreadChats,
    setCurrentChat,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
