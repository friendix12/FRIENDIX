import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import FeedPage from './pages/Feed/FeedPage';
import ProfilePage from './pages/Profile/ProfilePage';
import MessengerPage from './pages/Messenger/MessengerPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AdminPanel from './pages/Admin/AdminPanel';
import WatchPage from './pages/Watch/WatchPage';
import MarketplacePage from './pages/Marketplace/MarketplacePage';
import GroupsPage from './pages/Groups/GroupsPage';
import FriendsPage from './pages/Friends/FriendsPage';
import SettingsPage from './pages/Settings/SettingsPage';
import GamingPage from './pages/Gaming/GamingPage';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', background: '#1877F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.3rem', margin: '0 auto 16px' }}>fx</div>
      <div style={{ width: '40px', height: '4px', background: '#E7F3FF', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '100%', background: '#1877F2', animation: 'loading 1s ease-in-out infinite', borderRadius: '2px' }} />
      </div>
    </div>
  </div>;
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route (redirect to home if logged in)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  return !currentUser ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/messenger" element={<ProtectedRoute><MessengerPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/watch" element={<ProtectedRoute><WatchPage /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
      <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* Fallbacks */}
      <Route path="/gaming" element={<ProtectedRoute><GamingPage /></ProtectedRoute>} />
      <Route path="/memories" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/pages" element={<ProtectedRoute><GroupsPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/feeds" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
