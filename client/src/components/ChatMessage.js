import React from 'react';
import { format } from 'date-fns';

export default function ChatMessage({ message, own }) {
  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end space-x-2 max-w-xs">
        {!own && (
          <img
            src={message.sender.profilePicture || `https.placehold.co/32x32/E2E8F0/718096?text=${message.sender.username[0]}`}
            alt={message.sender.username}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div>
          <div
            className={`p-3 rounded-lg ${
              own ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            <p>{message.text}</p>
          </div>
          <span className={`text-xs text-gray-400 mt-1 ${own ? 'text-right' : 'text-left'} block`}>
            {format(new Date(message.createdAt), 'h:mm a')}
          </span>
        </div>
      </div>
    </div>
  );
}