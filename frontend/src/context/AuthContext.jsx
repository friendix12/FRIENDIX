import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, usersAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  // On app start — restore session from token
  useEffect(() => {
    const savedTheme = localStorage.getItem('friendix_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const token = localStorage.getItem('friendix_token');
    if (token) {
      // Verify token with backend and get fresh user data
      authAPI.getMe()
        .then(({ user }) => {
          setCurrentUser({ ...user, id: user._id });
          localStorage.setItem('friendix_user', JSON.stringify({ ...user, id: user._id }));
        })
        .catch(() => {
          // Token expired or invalid — clear storage
          localStorage.removeItem('friendix_token');
          localStorage.removeItem('friendix_user');
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // LOGIN with real backend
  const login = async (email, password) => {
    try {
      const { token, user } = await authAPI.login(email, password);
      localStorage.setItem('friendix_token', token);
      const userData = { ...user, id: user._id };
      localStorage.setItem('friendix_user', JSON.stringify(userData));
      setCurrentUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // SIGNUP with real backend
  const signup = async (userData) => {
    try {
      const { token, user } = await authAPI.register(userData);
      localStorage.setItem('friendix_token', token);
      const fullUser = { ...user, id: user._id };
      localStorage.setItem('friendix_user', JSON.stringify(fullUser));
      setCurrentUser(fullUser);
      return { success: true, user: fullUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // LOGOUT
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('friendix_token');
    localStorage.removeItem('friendix_user');
  };

  // Toggle dark/light theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('friendix_theme', newTheme);
  };

  // Update profile locally and persist on database
  const updateProfile = async (updates) => {
    try {
      const res = await usersAPI.updateProfile(updates);
      if (res && res.user) {
        const updated = { ...res.user, id: res.user._id };
        setCurrentUser(updated);
        localStorage.setItem('friendix_user', JSON.stringify(updated));
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to update profile in database:', err);
    }
    // Fallback: update locally
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('friendix_user', JSON.stringify(updated));
  };

  const refreshUser = async () => {
    try {
      const { user } = await authAPI.getMe();
      const userData = { ...user, id: user._id };
      localStorage.setItem('friendix_user', JSON.stringify(userData));
      setCurrentUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to sync current user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      theme,
      login,
      signup,
      logout,
      toggleTheme,
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
