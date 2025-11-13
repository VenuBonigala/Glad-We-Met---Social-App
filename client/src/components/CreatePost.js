import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) {
      setError('Post must have content or an image.');
      return;
    }
    
    setLoading(true);

    const formData = new FormData();
    formData.append('content', content);
    if (media) {
      formData.append('media', media);
    }

    try {
      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onPostCreated(response.data);
      
      setContent('');
      setMedia(null);
      setPreview(null);
      setError('');
    } catch (err) {
      console.error('Failed to create post:', err);
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          rows="3"
          placeholder={`What's on your mind, ${user.username}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        ></textarea>
        
        {preview && (
          <div className="my-2 relative">
            <img src={preview} alt="Upload preview" className="rounded-lg w-full max-w-sm" />
            <button
              type="button"
              onClick={() => {
                setMedia(null);
                setPreview(null);
              }}
              className="absolute top-2 right-2 bg-gray-900 bg-opacity-50 text-white rounded-full p-1 leading-none"
            >
              &times;
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-between items-center mt-4">
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-blue-600 hover:text-blue-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L4 16" />
            </svg>
          </label>
          
          <button
            type="submit"
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}