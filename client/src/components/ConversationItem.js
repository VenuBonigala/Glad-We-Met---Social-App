import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function ConversationItem({ convo, isSelected, onClick, unreadCount }) {
  const { onlineUsers } = useSocket();
  const { user } = useAuth(); // We don't need this, but good to have
  const otherMember = convo.otherMember;

  if (!otherMember) {
    return null;
  }

  const isOnline = onlineUsers.includes(otherMember._id);

  const getLastMessageText = () => {
    if (!convo.lastMessage) {
      return 'No messages yet';
    }
    const { text, sender } = convo.lastMessage;
    const prefix = sender.username === otherMember.username ? '' : 'You: ';
    return `${prefix}${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`;
  };

  return (
    <li
      onClick={onClick}
      className={`p-4 flex items-center space-x-3 cursor-pointer ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="relative">
        <img
          src={otherMember.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${otherMember.username[0]}`}
          alt={otherMember.username}
          className="w-10 h-10 rounded-full"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white"></span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold truncate">{otherMember.username}</h3>
          {convo.lastMessage && (
            <span className="text-xs text-gray-400">
              {format(new Date(convo.lastMessage.createdAt), 'h:mm a')}
            </span>
          )}
        </div>
        <div className="flex justify-between items-center">
          <p className={`text-sm truncate ${unreadCount > 0 ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            {getLastMessageText()}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}