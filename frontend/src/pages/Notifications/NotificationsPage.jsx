import Navbar from '../../components/Navbar/Navbar';
import { mockNotifications, mockUsers, formatTime } from '../../data/mockData';
import { FiThumbsUp, FiMessageSquare, FiUserPlus, FiGift, FiShare2, FiMoreHorizontal } from 'react-icons/fi';
import './NotificationsPage.css';

const NOTIF_ICONS = {
  like: { icon: <FiThumbsUp size={12} />, bg: '#1877F2' },
  love: { icon: '❤️', bg: '#F33E58' },
  comment: { icon: <FiMessageSquare size={12} />, bg: '#1877F2' },
  friend_request: { icon: <FiUserPlus size={12} />, bg: '#42B72A' },
  birthday: { icon: <FiGift size={12} />, bg: '#F7B125' },
  share: { icon: <FiShare2 size={12} />, bg: '#1877F2' },
};

const NotificationsPage = () => {
  const newNotifs = mockNotifications.filter(n => !n.read);
  const oldNotifs = mockNotifications.filter(n => n.read);

  const renderNotif = (n) => {
    const user = mockUsers.find(u => u.id === n.fromUserId);
    const iconData = NOTIF_ICONS[n.type] || NOTIF_ICONS.like;
    return (
      <div key={n.id} className={`notif-page-item ${!n.read ? 'unread' : ''}`}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={user?.avatar} alt={user?.fullName} className="avatar avatar-lg" />
          <span className="notif-page-type-icon" style={{ background: iconData.bg }}>
            {iconData.icon}
          </span>
        </div>
        <div className="notif-page-content">
          <p className="notif-page-text">{n.messageEn || n.message}</p>
          <p className={`notif-page-time ${!n.read ? 'unread-time' : ''}`}>{formatTime(n.createdAt)}</p>
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
            <button className="btn btn-ghost btn-sm">Mark all as read</button>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
