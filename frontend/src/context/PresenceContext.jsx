import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { presenceAPI } from '../services/api';
import { useAuth } from './AuthContext';

const PresenceContext = createContext();

export const PresenceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [onlineMap, setOnlineMap] = useState({});
  const trackedIdsRef = useRef(new Set());
  const intervalRef = useRef(null);

  // Send heartbeat every 30s
  useEffect(() => {
    if (!currentUser) return;

    const sendHeartbeat = async () => {
      try {
        await presenceAPI.heartbeat();
      } catch (err) {
        // silent
      }
    };

    sendHeartbeat();
    intervalRef.current = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(intervalRef.current);
  }, [currentUser]);

  // Fetch online status for tracked users — REPLACES values for queried IDs so offline users get false
  const fetchOnlineStatus = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return;
    const uniqueIds = [...new Set(ids.map(String))];
    try {
      const data = await presenceAPI.getOnline(uniqueIds);
      if (data.online) {
        // Replace ONLY the queried IDs so previously-online-now-offline users get false
        setOnlineMap(prev => {
          const updated = { ...prev };
          uniqueIds.forEach(id => {
            updated[id] = !!data.online[id]; // always set, even if false
          });
          return updated;
        });
      }
    } catch (err) {
      // silent
    }
  }, []);

  // Auto-refresh online status for tracked users every 15s
  useEffect(() => {
    if (!currentUser) return;

    const refresh = () => {
      const ids = Array.from(trackedIdsRef.current);
      if (ids.length > 0) {
        fetchOnlineStatus(ids);
      }
    };

    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [currentUser, fetchOnlineStatus]);

  // Track a set of user IDs to check
  const trackUsers = useCallback((ids) => {
    const strIds = ids.map(String);
    strIds.forEach(id => trackedIdsRef.current.add(id));
    fetchOnlineStatus(strIds);
  }, [fetchOnlineStatus]);

  const isOnline = useCallback((userId) => {
    if (!userId) return false;
    // Handle MongoDB ObjectId objects safely
    const id = typeof userId === 'object' ? (userId._id || userId.id || userId).toString() : String(userId);
    return !!onlineMap[id];
  }, [onlineMap]);

  return (
    <PresenceContext.Provider value={{ onlineMap, isOnline, trackUsers, fetchOnlineStatus }}>
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const ctx = useContext(PresenceContext);
  if (!ctx) throw new Error('usePresence must be used within PresenceProvider');
  return ctx;
};

export default PresenceContext;
