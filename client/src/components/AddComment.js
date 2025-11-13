import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AddComment({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      onCommentAdded(response.data);
      setText('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p className="text-gray-500">You must be logged in to comment.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-3">
      <img
        src={user.profilePicture || `https://placehold.co/40x40/E2E8F0/718096?text=${user.username[0]}`}
        alt={user.username}
        className="w-10 h-10 rounded-full"
      />
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        type="submit"
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${loading ? 'opacity-50' : ''}`}
        disabled={loading}
      >
        {loading ? '...' : 'Post'}
      </button>
    </form>
  );
}