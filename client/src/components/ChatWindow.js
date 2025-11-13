import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import ChatMessage from './ChatMessage';

// 1. Accept 'onBack' prop
export default function ChatWindow({ selectedConvo, onBack }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectedConvo) {
      const fetchMessages = async () => {
        try {
          const res = await api.get(`/messages/${selectedConvo._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error('Failed to fetch messages', err);
        }
      };
      fetchMessages();
    }
  }, [selectedConvo]);

  useEffect(() => {
    if (socket) {
      const messageListener = (message) => {
        if (message.conversationId === selectedConvo?._id) {
          setMessages((prev) => [...prev, message]);
        }
      };
      
      const typingListener = () => setIsTyping(true);
      const stopTypingListener = () => setIsTyping(false);

      socket.on('getMessage', messageListener);
      socket.on('isTyping', typingListener);
      socket.on('stopTyping', stopTypingListener);

      return () => {
        socket.off('getMessage', messageListener);
        socket.off('isTyping', typingListener);
        socket.off('stopTyping', stopTypingListener);
      };
    }
  }, [socket, selectedConvo]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleTyping = () => {
    if (socket && selectedConvo) {
      socket.emit('typing', { receiverId: selectedConvo.otherMember._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { receiverId: selectedConvo.otherMember._id });
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvo) return;

    const receiverId = selectedConvo.otherMember._id;

    socket.emit('sendMessage', {
      conversationId: selectedConvo._id,
      sender: user.id,
      receiverId,
      text: newMessage,
    });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.emit('stopTyping', { receiverId: selectedConvo.otherMember._id });

    setNewMessage('');
  };

  if (!selectedConvo) {
    return (
      <div className="h-full hidden md:flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Select a conversation to start chatting</p>
      </div>
    );
  }

  const isReceiverOnline = onlineUsers.includes(selectedConvo.otherMember._id);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* 2. Updated Header with Back Button */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-3">
        
        {/* 3. Back Button (Mobile Only) */}
        <button 
          onClick={onBack} 
          className="md:hidden p-1 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {/* --- End Back Button --- */}
        
        <div className="relative">
          <img
            src={selectedConvo.otherMember.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${selectedConvo.otherMember.username[0]}`}
            alt={selectedConvo.otherMember.username}
            className="w-10 h-10 rounded-full"
          />
          {isReceiverOnline && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
          )}
        </div>
        <h2 className="text-xl font-semibold dark:text-white">{selectedConvo.otherMember.username}</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
        {messages.map((msg) => (
          <div key={msg._id} ref={scrollRef}>
            <ChatMessage message={msg} own={msg.sender._id === user.id} />
          </div>
        ))}
        {isTyping && (
          <div ref={scrollRef}>
            <ChatMessage 
              message={{ 
                text: '...', 
                sender: selectedConvo.otherMember, 
                createdAt: new Date().toISOString() 
              }} 
              own={false} 
            />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 flex space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}