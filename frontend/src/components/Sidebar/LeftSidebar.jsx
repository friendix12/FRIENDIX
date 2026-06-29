import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mockUsers } from '../../data/mockData';
import {
  FiUsers, FiVideo, FiShoppingBag, FiZap, FiClock,
  FiBookmark, FiFileText, FiCalendar, FiRss, FiChevronDown,
  FiChevronUp, FiCheckCircle
} from 'react-icons/fi';
import './Sidebar.css';

const LeftSidebar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { Icon: FiUsers, label: 'Friends', path: '/friends' },
    { Icon: FiUsers, label: 'Groups', path: '/groups' },
    { Icon: FiVideo, label: 'Watch', path: '/watch' },
    { Icon: FiShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { Icon: FiBookmark, label: 'Saved', path: '/saved' },
    { Icon: FiClock, label: 'Memories', path: '/memories' },
    // Hidden until expanded
    { Icon: FiFileText, label: 'Pages', path: '/pages' },
    { Icon: FiCalendar, label: 'Events', path: '/events' },
    { Icon: FiRss, label: 'Feeds', path: '/feeds' },
    { Icon: FiZap, label: 'Gaming', path: '/gaming' },
  ];

  const defaultRequests = mockUsers.filter(u =>
    !currentUser?.friends?.includes(u.id) && u.id !== currentUser?.id
  ).slice(0, 3);

  const [friendRequests, setFriendRequests] = useState(defaultRequests);
  const [acceptedRequests, setAcceptedRequests] = useState({});

  const handleConfirm = (id) => {
    setAcceptedRequests(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setFriendRequests(prev => prev.filter(u => u.id !== id));
    }, 2000);
  };

  const handleDelete = (id) => {
    setFriendRequests(prev => prev.filter(u => u.id !== id));
  };

  const visibleItems = isExpanded ? menuItems : menuItems.slice(0, 5);

  return (
    <aside className="left-sidebar" id="left-sidebar">
      {/* Profile Link */}
      <div
        className="sidebar-profile"
        onClick={() => navigate(`/profile/${currentUser?.id}`)}
      >
        {currentUser?.avatar ? (
          <img src={currentUser.avatar} alt={currentUser?.fullName} className="avatar avatar-md" />
        ) : (
          <div className="avatar-placeholder avatar-md">
            {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
          </div>
        )}
        <span className="sidebar-profile-name">{currentUser?.fullName}</span>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        {visibleItems.map(item => (
          <Link key={item.path} to={item.path} className="sidebar-nav-item">
            <span className="sidebar-nav-icon">
              <item.Icon size={20} />
            </span>
            <span className="sidebar-nav-label">{item.label}</span>
          </Link>
        ))}
        
        <button
          className="sidebar-see-more"
          onClick={() => setIsExpanded(!isExpanded)}
          id="see-more-toggle"
        >
          <span className="sidebar-nav-icon">
            {isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </span>
          <span className="sidebar-nav-label">
            {isExpanded ? 'See less' : 'See more'}
          </span>
        </button>
      </nav>

      <div style={{ height: '1px', background: 'var(--border-light)', margin: '12px 0' }} />

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <div className="sidebar-section animate-fadeIn">
          <div className="sidebar-section-header">
            <h3 className="sidebar-section-title">Friend Requests</h3>
            <Link to="/friends" className="sidebar-section-link">See all</Link>
          </div>
          {friendRequests.map(user => {
            const isAccepted = acceptedRequests[user.id] || false;
            return (
              <div key={user.id} className="friend-request-item animate-fadeIn">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="avatar avatar-lg"
                  onClick={() => navigate(`/profile/${user.id}`)}
                  style={{ cursor: 'pointer' }}
                />
                <div className="friend-request-info">
                  <p
                    className="friend-request-name"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    {user.fullName}
                  </p>
                  <p className="friend-request-mutual">
                    {Math.floor(Math.random() * 20) + 2} mutual friends
                  </p>
                  
                  {isAccepted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                      <FiCheckCircle /> Friends confirmed
                    </div>
                  ) : (
                    <div className="friend-request-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleConfirm(user.id)}
                        id={`confirm-request-${user.id}`}
                      >
                        Confirm
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleDelete(user.id)}
                        id={`delete-request-${user.id}`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shortcuts */}
      <div style={{ height: '1px', background: 'var(--border-light)', margin: '12px 0' }} />
      <div className="sidebar-section">
        <h3 className="sidebar-section-title" style={{ marginBottom: '8px' }}>Your shortcuts</h3>
        {['Forgotten History', 'Tech Bangladesh', 'Travel BD'].map(name => (
          <div key={name} className="sidebar-nav-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            <span className="sidebar-nav-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700 }}>
              {name[0]}
            </span>
            <span className="sidebar-nav-label">{name}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-links">
          {['Privacy', 'Terms', 'Advertising', 'Cookies', 'More'].map(l => (
            <a key={l} href="#" className="sidebar-footer-link">{l}</a>
          ))}
        </div>
        <p className="sidebar-footer-copy">© 2026 FRIENDIX</p>
      </div>
    </aside>
  );
};

export default LeftSidebar;
