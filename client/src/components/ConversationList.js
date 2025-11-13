import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ConversationItem from './ConversationItem';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function ConversationList({ selectedConvo, setSelectedConvo }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { unreadChats } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get('/conversations');
        setConversations(res.data);
      } catch (err) {
        console.error('Failed to fetch conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [user]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading chats...</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <h2 className="text-xl font-semibold p-4 border-b">Messages</h2>
      {conversations.length === 0 ? (
        <p className="p-4 text-gray-500">No conversations yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {conversations.map((convo) => (
            <ConversationItem
              key={convo._id}
              convo={convo}
              isSelected={selectedConvo?._id === convo._id}
              onClick={() => setSelectedConvo(convo)}
              unreadCount={unreadChats[convo._id] || 0}
            />
          ))}
        </ul>
      )}
    </div>
  );
}