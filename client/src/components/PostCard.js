import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const location = useLocation();
  const [likes, setLikes] = useState(post.likes);

  const isLiked = user && likes.includes(user.id);
  const isSinglePostPage = location.pathname.startsWith('/post/');

  const handleLike = async () => {
    if (!user) {
      alert('You must be logged in to like a post');
      return;
    }
    
    try {
      const response = await api.put(`/posts/${post._id}/like`);
      setLikes(response.data.likes);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const PostBody = () => (
    <>
      <p className="text-gray-700 mb-4">{post.content}</p>
      
      {post.mediaUrl && (
        <img
          src={post.mediaUrl}
          alt="Post media"
          className="rounded-lg w-full max-w-lg mx-auto mb-4"
        />
      )}
    </>
  );

  return (
    <div className="bg-white p-5 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-3">
        <img
          src={post.user.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${post.user.username[0]}`}
          alt={post.user.username}
          className="w-10 h-10 rounded-full mr-3"
        />
        <div>
          <Link
            to={`/profile/${post.user.username}`}
            className="font-semibold text-gray-800 hover:text-blue-600"
          >
            {post.user.username}
          </Link>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt))} ago
          </p>
        </div>
      </div>

      {isSinglePostPage ? (
        <PostBody />
      ) : (
        <Link to={`/post/${post._id}`} className="block cursor-pointer">
          <PostBody />
        </Link>
      )}

      <div className="flex items-center justify-between text-gray-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 p-2 rounded-full ${
              isLiked
                ? 'text-red-500 bg-red-100 hover:bg-red-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clipRule="evenodd"
              />
            </svg>
            <span>{likes.length}</span>
          </button>
          
          <Link 
            to={`/post/${post._id}`} 
            className="flex items-center space-x-1 p-2 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 5.523-4.477 10-10 10S1 17.523 1 12S5.477 2 11 2s10 4.477 10 10z" />
            </svg>
            <span>{post.comments.length}</span>
          </Link>
        </div>
        
        {!isSinglePostPage && (
          <Link to={`/post/${post._id}`} className="text-sm font-medium text-blue-600 hover:underline">
            View Post
          </Link>
        )}
      </div>
    </div>
  );
}