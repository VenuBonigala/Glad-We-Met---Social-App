import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function Comment({ comment }) {
  return (
    <div className="flex space-x-3">
      <img
        src={comment.user.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${comment.user.username[0]}`}
        alt={comment.user.username}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 bg-gray-100 p-3 rounded-lg">
        <div className="flex items-center space-x-2">
          <Link 
            to={`/profile/${comment.user.username}`} 
            className="font-semibold hover:underline"
          >
            {comment.user.username}
          </Link>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.createdAt))} ago
          </span>
        </div>
        <p className="text-gray-800">{comment.text}</p>
      </div>
    </div>
  );
}