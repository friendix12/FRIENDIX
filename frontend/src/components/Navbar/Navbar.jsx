import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePresence } from '../../context/PresenceContext';
import { usersAPI, notificationsAPI, messagesAPI } from '../../services/api';
import ProfessionalModeModal from '../ProfessionalModeModal/ProfessionalModeModal';
import {
  FiHome, FiVideo, FiShoppingBag, FiUsers, FiZap,
  FiBell, FiMessageSquare, FiSearch, FiX, FiSettings,
  FiMoon, FiSun, FiHelpCircle, FiLogOut, FiShield, FiUser,
  FiChevronDown, FiMenu, FiArrowLeft, FiLock, FiActivity,
  FiGlobe, FiAlertTriangle, FiInbox, FiTrendingUp, FiBarChart2
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ activePage = 'home' }) => {
  const { currentUser, logout, toggleTheme, theme, refreshUser } = useAuth();
  const { isOnline, trackUsers, fetchOnlineStatus } = usePresence();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMessengerDrop, setShowMessengerDrop] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState(null); // 'settings', 'help', or null
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [showProModal, setShowProModal] = useState(false);
  const [proModalLoading, setProModalLoading] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const menuRef = useRef(null);
  const messengerRef = useRef(null);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (currentUser) {
      notificationsAPI.getAll()
        .then(data => setNotifications(data.notifications || []))
        .catch(err => console.error(err));
      messagesAPI.getConversations()
        .then(data => setConversations(data.conversations || []))
        .catch(err => console.error(err));
      messagesAPI.getUnreadCount()
        .then(data => setUnreadMsgCount(data.count || 0))
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  // Track online status for conversation users
  useEffect(() => {
    const ids = conversations.map(c => c.user?._id || c.user?.id).filter(Boolean);
    if (ids.length > 0) trackUsers(ids);
  }, [conversations, trackUsers]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setActiveSubMenu(null);
      }
      if (messengerRef.current && !messengerRef.current.contains(e.target)) setShowMessengerDrop(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = async (val) => {
    setSearch(val);
    if (val.trim()) {
      try {
        const res = await usersAPI.searchUsers(val);
        setSearchResults(res.users || []);
        setShowSearch(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  const handleOpenNotifications = () => {
    setShowNotif(!showNotif);
    if (!showNotif && unreadNotifCount > 0) {
      notificationsAPI.markAllRead()
        .then(() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        })
        .catch(err => console.error(err));
    }
  };

  const NAV_TABS = [
    { id: 'home', Icon: FiHome, label: 'Home', path: '/' },
    { id: 'watch', Icon: FiVideo, label: 'Watch', path: '/watch' },
    { id: 'marketplace', Icon: FiShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { id: 'groups', Icon: FiUsers, label: 'Groups', path: '/groups' },
    { id: 'gaming', Icon: FiZap, label: 'Gaming', path: '/gaming' },
  ];

  const getNotifIcon = (type) => {
    const map = { like: '👍', comment: '💬', friend_request: '👤', friend_accepted: '🤝', birthday: '🎂' };
    return map[type] || '🔔';
  };

  return (
    <>
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Left: Logo + Search */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo" id="navbar-logo">
            <img src="/friendix-logo.svg" alt="Friendix" className="navbar-logo-img" />
            <span className="navbar-logo-text">friendix</span>
          </Link>

          <div className="navbar-search-wrap" ref={searchRef}>
            <div className="navbar-search">
              <FiSearch className="search-icon" />
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search Friendix"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => search && setShowSearch(true)}
                className="search-input"
              />
              {search && (
                <button className="search-clear" onClick={() => { setSearch(''); setSearchResults([]); setShowSearch(false); }}>
                  <FiX size={14} />
                </button>
              )}
            </div>

            {showSearch && searchResults.length > 0 && (
              <div className="search-dropdown animate-fadeIn">
                <p className="search-dropdown-title">People</p>
                {searchResults.map(user => {
                  const userId = user._id || user.id;
                  if (!userId) return null;
                  return (
                    <div
                      key={userId}
                      className="search-result-item"
                      onClick={() => { navigate(`/profile/${userId}`); setShowSearch(false); setSearch(''); }}
                    >
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullName || ''} className="avatar avatar-sm" />
                      ) : (
                        <div className="avatar-placeholder avatar-sm">{user.fullName?.[0] || '?'}</div>
                      )}
                      <div>
                        <p className="search-name">{user.fullName || 'Unknown User'}</p>
                        <p className="search-meta">{user.location || 'Friendix User'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center: Nav Tabs */}
        <div className="navbar-center">
          {NAV_TABS.map(tab => (
            <Link
              key={tab.id}
              to={tab.path}
              id={`nav-tab-${tab.id}`}
              className={`nav-tab ${activePage === tab.id ? 'active' : ''}`}
              data-tooltip={tab.label}
            >
              <tab.Icon size={22} />
              <span className="nav-tab-label">{tab.label}</span>
            </Link>
          ))}
        </div>

        {/* Right: Action Buttons */}
        <div className="navbar-right">
          {/* Messenger */}
          <div ref={messengerRef} style={{ position: 'relative' }}>
            <button
              id="navbar-messenger"
              className={`nav-action-btn ${showMessengerDrop ? 'active' : ''}`}
              onClick={() => {
              const opening = !showMessengerDrop;
              setShowMessengerDrop(opening);
              setShowNotif(false);
              setShowMenu(false);
              // Immediately refresh online status when opening
              if (opening) {
                const ids = conversations.map(c => c.user?._id || c.user?.id).filter(Boolean);
                if (ids.length > 0) fetchOnlineStatus(ids.map(String));
              }
            }}
              data-tooltip="Messenger"
            >
              <FiMessageSquare size={20} />
              {unreadMsgCount > 0 && (
                <span className="badge nav-badge">{unreadMsgCount}</span>
              )}
            </button>
            {showMessengerDrop && (
              <div className="navbar-dropdown animate-fadeIn" style={{ width: '360px' }}>
                <div className="dropdown-header">
                  <h3>Messenger</h3>
                  <button className="icon-btn" onClick={() => navigate('/messenger')}>See All</button>
                </div>
                {conversations.filter(c => c && c.user).slice(0, 5).map((conv) => {
                  const user = conv.user;
                  const userId = user._id || user.id;
                  return (
                    <div
                      key={userId}
                      className={`notif-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => { navigate('/messenger'); setShowMessengerDrop(false); }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="avatar avatar-md" />
                        ) : (
                          <div className="avatar-placeholder avatar-md">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </div>
                        )}
                        <span className={`online-dot ${isOnline(userId) ? 'active' : ''}`} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="notif-name" style={{ fontWeight: conv.unreadCount > 0 ? 700 : 500 }}>{user.fullName}</p>
                        <p className="notif-time" style={{
                          color: conv.unreadCount > 0 ? 'var(--primary)' : 'var(--text-secondary)',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {conv.lastMessage || 'Start chatting'}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="badge" style={{ minWidth: '20px', height: '20px', fontSize: '0.7rem', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })}
                {conversations.length === 0 && (
                  <p style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    No conversations yet
                  </p>
                )}
                <div className="see-all-btn-wrap">
                  <button className="see-all-btn" onClick={() => { navigate('/messenger'); setShowMessengerDrop(false); }}>
                    Open Messenger
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              id="navbar-notifications"
              className={`nav-action-btn ${showNotif ? 'active' : ''}`}
              onClick={handleOpenNotifications}
              data-tooltip="Notifications"
            >
              <FiBell size={20} />
              {unreadNotifCount > 0 && (
                <span className="badge nav-badge">{unreadNotifCount}</span>
              )}
            </button>

            {showNotif && (
              <div className="navbar-dropdown animate-fadeIn">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                  <button className="icon-btn" onClick={handleOpenNotifications}>Mark all as read</button>
                </div>
                <p className="notif-section-label">All Notifications</p>
                {notifications.map(n => {
                  const notifId = n._id || n.id;
                  const sender = n.fromId || {};
                  return (
                    <div
                      key={notifId}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => {
                        if (n.postId) navigate(`/profile/${currentUser?.id}`);
                        setShowNotif(false);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        {sender.avatar ? (
                          <img
                            src={sender.avatar}
                            alt=""
                            className="avatar avatar-md"
                          />
                        ) : (
                          <div className="avatar-placeholder avatar-md">
                            {sender.firstName?.[0]}{sender.lastName?.[0]}
                          </div>
                        )}
                        <span className="notif-type-icon">{getNotifIcon(n.type)}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="notif-text">
                          <strong>{sender.fullName || 'Someone'}</strong> {n.message}
                        </p>
                        <p className="notif-time" style={{ color: n.read ? 'var(--text-secondary)' : 'var(--primary)' }}>
                          Just now
                        </p>
                      </div>
                      {!n.read && <span className="notif-unread-dot" />}
                    </div>
                  );
                })}
                {notifications.length === 0 && (
                  <p style={{ padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    No new notifications
                  </p>
                )}
                <div className="see-all-btn-wrap">
                  <button className="see-all-btn" onClick={() => { navigate('/notifications'); setShowNotif(false); }}>
                    See all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              id="navbar-profile-menu"
              className="nav-profile-btn"
              onClick={() => { setShowMenu(!showMenu); setShowNotif(false); setShowMessengerDrop(false); }}
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.fullName} className="avatar avatar-sm" />
              ) : (
                <div className="avatar-placeholder avatar-sm">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </div>
              )}
            </button>

            {showMenu && (
              <div className="navbar-dropdown animate-fadeIn" style={{ width: '320px' }}>
                {activeSubMenu === 'settings' ? (
                  <>
                    <div className="submenu-header" onClick={() => setActiveSubMenu(null)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', marginBottom: '8px' }}>
                      <button className="back-btn" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-hover)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <FiArrowLeft size={18} />
                      </button>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Settings & privacy</h3>
                    </div>
                    
                    <div className="dropdown-item" onClick={() => { navigate('/settings'); setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiSettings size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Settings</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiLock size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Privacy Checkup</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiShield size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Privacy Center</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiActivity size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Activity Log</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiMenu size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Feed Preferences</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiGlobe size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Language</p>
                    </div>
                  </>
                ) : activeSubMenu === 'help' ? (
                  <>
                    <div className="submenu-header" onClick={() => setActiveSubMenu(null)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)', marginBottom: '8px' }}>
                      <button className="back-btn" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-hover)', color: 'var(--text-primary)', cursor: 'pointer' }}>
                        <FiArrowLeft size={18} />
                      </button>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Help & support</h3>
                    </div>

                    <div className="dropdown-item" onClick={() => { navigate('/help'); setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiHelpCircle size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Help Center</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiInbox size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Support Inbox</p>
                    </div>

                    <div className="dropdown-item" onClick={() => { setShowMenu(false); setActiveSubMenu(null); }}>
                      <div className="icon" style={{ background: 'var(--bg-hover)', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px' }}><FiAlertTriangle size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Report a Problem</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="menu-profile-card" onClick={() => { navigate(`/profile/${currentUser?.id}`); setShowMenu(false); }}>
                      {currentUser?.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.fullName} className="avatar avatar-md" />
                      ) : (
                        <div className="avatar-placeholder avatar-md">
                          {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="menu-name">{currentUser?.fullName}</p>
                        <p className="menu-view-profile">See your profile</p>
                      </div>
                    </div>
                    <div className="dropdown-divider" />

                    <div className="menu-section-label">Settings & support</div>

                    {currentUser?.isProfessional ? (
                      <div className="dropdown-item" onClick={() => { navigate('/professional-dashboard'); setShowMenu(false); }}>
                        <div className="icon"><FiBarChart2 size={18} /></div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Professional Dashboard</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>View insights & analytics</p>
                        </div>
                      </div>
                    ) : (
                      <div className="dropdown-item" onClick={() => setShowProModal(true)}>
                        <div className="icon"><FiTrendingUp size={18} /></div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Turn on Professional Mode</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Get insights, followers & more</p>
                        </div>
                      </div>
                    )}

                    <div className="dropdown-item" onClick={() => setActiveSubMenu('settings')}>
                      <div className="icon"><FiSettings size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Settings & privacy</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Privacy, security and more</p>
                      </div>
                      <FiChevronDown size={16} style={{ transform: 'rotate(-90deg)', color: 'var(--text-secondary)' }} />
                    </div>

                    <div className="dropdown-item" onClick={toggleTheme}>
                      <div className="icon">{theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}</div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Display & accessibility</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          {theme === 'light' ? 'Turn on Dark Mode' : 'Turn on Light Mode'}
                        </p>
                      </div>
                    </div>

                    <div className="dropdown-item" onClick={() => setActiveSubMenu('help')}>
                      <div className="icon"><FiHelpCircle size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Help & support</p>
                      </div>
                      <FiChevronDown size={16} style={{ transform: 'rotate(-90deg)', color: 'var(--text-secondary)' }} />
                    </div>

                    <div className="dropdown-divider" />
                    <div className="dropdown-item" id="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
                      <div className="icon"><FiLogOut size={18} /></div>
                      <p style={{ fontWeight: 600, fontSize: '0.93rem', margin: 0 }}>Log out</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="mobile-navbar">
        {NAV_TABS.map(tab => (
          <Link
            key={tab.id}
            to={tab.path}
            className={`mobile-nav-item ${activePage === tab.id ? 'active' : ''}`}
          >
            <tab.Icon size={22} />
            <span className="mobile-nav-label">{tab.label}</span>
          </Link>
        ))}
        <Link
          to="/notifications"
          className={`mobile-nav-item ${activePage === 'notifications' ? 'active' : ''}`}
        >
          <div style={{ position: 'relative' }}>
            <FiBell size={22} />
            {unreadNotifCount > 0 && <span className="badge" style={{ position: 'absolute', top: '-6px', right: '-6px', minWidth: '16px', height: '16px', fontSize: '0.7rem' }}>{unreadNotifCount}</span>}
          </div>
          <span className="mobile-nav-label">Alerts</span>
        </Link>
      </div>
    </nav>
    <ProfessionalModeModal
      isOpen={showProModal}
      onClose={() => { setShowProModal(false); setProModalLoading(false); }}
      mode="on"
      loading={proModalLoading}
      onConfirm={async () => {
        setProModalLoading(true);
        try {
          await usersAPI.toggleProfessional();
        } catch (err) {
          console.error('Toggle professional failed:', err);
          alert('Failed to enable professional mode. Please try again.');
          setProModalLoading(false);
          return;
        }
        setShowProModal(false);
        setShowMenu(false);
        setProModalLoading(false);
        try {
          await refreshUser();
        } catch (err) {
          console.error('Refresh user failed:', err);
        }
      }}
    />
    </>
  );
};

export default Navbar;
