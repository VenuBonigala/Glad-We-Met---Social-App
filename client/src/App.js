import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import SinglePostPage from './pages/SinglePostPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // 1. IMPORT
import ResetPasswordPage from './pages/ResetPasswordPage'; // 2. IMPORT
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/" /> : <RegisterPage />} 
          />
          
          {/* 3. ADD NEW ROUTES */}
          <Route 
            path="/forgot-password" 
            element={isAuthenticated ? <Navigate to="/" /> : <ForgotPasswordPage />}
          />
          <Route 
            path="/reset-password/:token" 
            element={isAuthenticated ? <Navigate to="/" /> : <ResetPasswordPage />}
          />
          {/* --- END NEW --- */}

          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/post/:postId" element={<SinglePostPage />} />
          
          <Route 
            path="/chat" 
            element={!isAuthenticated ? <Navigate to="/login" /> : <ChatPage />} 
          />
          <Route 
            path="/notifications" 
            element={!isAuthenticated ? <Navigate to="/login" /> : <NotificationsPage />} 
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;