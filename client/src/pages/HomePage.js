import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  
  // State for feed type: 'following' or 'global'
  // Default to 'following' if logged in, otherwise 'global'
  const [feedType, setFeedType] = useState(user ? 'following' : 'global');
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      // Choose the API endpoint based on feedType
      const endpoint = (feedType === 'following' && user) ? '/posts/feed' : '/posts';
      
      const response = await api.get(endpoint);
      
      setPosts(response.data);
      setError('');
    } catch (err)
 {
      console.error('Failed to fetch posts:', err);
      if (feedType === 'following' && err.response?.status === 500) {
        setError('Could not load your feed.');
      } else {
        setError('Failed to load the feed. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when the component loads OR when feedType changes
  useEffect(() => {
    fetchPosts();
  }, [feedType, user]); // Re-run if user logs in/out or feedType changes

  // This function will be passed to CreatePost
  // It adds the new post to the top of the list
  const handlePostCreated = (newPost) => {
    // Only add to the list if we're on the global feed
    // or if the new post is from the user (who is implicitly "following" themself for this)
    if (feedType === 'global') {
      setPosts([newPost, ...posts]);
    }
    // On the "following" feed, a new post won't show until refresh
    // (or we could add it, but this is simpler for now)
  };
  
  // Helper to render feed tabs
  const renderFeedTabs = () => {
    if (!user) return null; // Don't show tabs if not logged in

    return (
      <div className="mb-4 flex border-b">
        <button
          onClick={() => setFeedType('following')}
          className={`py-2 px-4 font-semibold ${
            feedType === 'following'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Following
        </button>
        <button
          onClick={() => setFeedType('global')}
          className={`py-2 px-4 font-semibold ${
            feedType === 'global'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Global
        </button>
      </div>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="text-center text-gray-500">
        <p>Loading feed...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Render feed
  return (
    <div className="max-w-2xl mx-auto">
      {/* 1. Show the CreatePost form (it's smart and will only show if logged in) */}
      <CreatePost onPostCreated={handlePostCreated} />

      {/* 2. Render the tabs */}
      {renderFeedTabs()}

      {/* 3. Show the list of posts */}
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            {feedType === 'following' ? (
              <p>Your feed is empty. Follow some users to see their posts!</p>
            ) : (
              <p>No posts yet. Be the first to post!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}