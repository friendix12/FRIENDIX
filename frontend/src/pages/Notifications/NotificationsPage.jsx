import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { notificationsAPI } from '../../services/api';
import { FiThumbsUp, FiMessageSquare, FiUserPlus, FiGift, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
import './NotificationsPage.css';

const NOTIF_ICONS = {
  like: { icon: <FiThumbsUp size={12} />, bg: '#1877F2' },
  love: { icon: '❤️', bg: '#F33E58' },
  comment: { icon: <FiMessageSquare size={12} />, bg: '#1877F2' },
  friend_request: { icon: <FiUserPlus size={12} />, bg: '#42B72A' },
  friend_accepted: { icon: <FiUserPlus size={12} />, bg: '#1877F2' },
  birthday: { icon: <FiGift size={12} />, bg: '#F7B125' },
  share: { icon: <FiShare2 size={12} />, bg: '#1877F2' },
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationsAPI.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const newNotifs = notifications.filter(n => !n.read);
  const oldNotifs = notifications.filter(n => n.read);

  const renderNotif = (n) => {
    const notifId = n._id || n.id;
    const user = n.fromId || {};
    const iconData = NOTIF_ICONS[n.type] || NOTIF_ICONS.like;
    return (
      <div key={notifId} className={`notif-page-item ${!n.read ? 'unread' : ''}`}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.fullName} className="avatar avatar-lg" />
          ) : (
            <div className="avatar-placeholder avatar-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          <span className="notif-page-type-icon" style={{ background: iconData.bg }}>
            {iconData.icon}
          </span>
        </div>
        <div className="notif-page-content">
          <p className="notif-page-text">
            <strong>{user.fullName || 'Someone'}</strong> {n.message}
          </p>
          <p className={`notif-page-time ${!n.read ? 'unread-time' : ''}`}>Just now</p>
        </div>
        <button className="notif-page-menu"><FiMoreHorizontal /></button>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <Navbar activePage="notifications" />
      <div className="simple-layout">
        <div className="simple-content" style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Notifications</h1>
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>Mark all as read</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              Loading notifications...
            </div>
          ) : (
            <>
              {newNotifs.length > 0 && (
                <div className="card" style={{ marginBottom: '16px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px 4px' }}>
                    <h3 style={{ fontWeight: 700 }}>New</h3>
                  </div>
                  {newNotifs.map(renderNotif)}
                </div>
              )}

              {oldNotifs.length > 0 && (
                <div className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px 4px' }}>
                    <h3 style={{ fontWeight: 700 }}>Earlier</h3>
                  </div>
                  {oldNotifs.map(renderNotif)}
                </div>
              )}

              {notifications.length === 0 && (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No notifications yet.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
