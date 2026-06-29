import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import {
  FiSettings, FiShield, FiLock, FiAlertTriangle, FiGlobe,
  FiBell, FiUser, FiSmartphone, FiUserMinus, FiCheckCircle
} from 'react-icons/fi';
import './SettingsPage.css';

const SECTIONS = [
  { id: 'general', label: 'General', icon: <FiUser size={18} /> },
  { id: 'security', label: 'Security and login', icon: <FiShield size={18} /> },
  { id: 'privacy', label: 'Privacy settings', icon: <FiLock size={18} /> },
  { id: 'blocking', label: 'Blocking', icon: <FiUserMinus size={18} /> },
  { id: 'language', label: 'Language and region', icon: <FiGlobe size={18} /> },
  { id: 'notifications', label: 'Notifications', icon: <FiBell size={18} /> }
];

const SettingsPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [activeSec, setActiveSec] = useState('general');
  const [successMsg, setSuccessMsg] = useState('');

  // General state
  const [generalForm, setGeneralForm] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
  });

  // Security state
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Privacy state
  const [privacy, setPrivacy] = useState({
    futurePosts: 'public',
    friendRequests: 'everyone',
    searchEngine: true
  });

  // Blocking state
  const [blockedUsers, setBlockedUsers] = useState(['Abul Kalam', 'Kamrul Hasan']);

  // Language state
  const [lang, setLang] = useState('English');

  // Notifications state
  const [notifs, setNotifs] = useState({
    comments: true,
    tags: true,
    reminders: false,
    friendRequests: true
  });

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveGeneral = (e) => {
    e.preventDefault();
    updateProfile({
      firstName: generalForm.firstName,
      lastName: generalForm.lastName,
      fullName: `${generalForm.firstName} ${generalForm.lastName}`,
      email: generalForm.email,
      bio: generalForm.bio,
      location: generalForm.location
    });
    showSuccess('General settings updated successfully!');
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert('Passwords do not match!');
      return;
    }
    setPasswords({ current: '', new: '', confirm: '' });
    showSuccess('Password updated successfully!');
  };

  return (
    <div className="app-layout">
      <Navbar activePage="settings" />

      <div className="settings-layout">
        {/* Settings Left Sidebar */}
        <aside className="settings-sidebar">
          <h2 className="settings-title"><FiSettings /> Settings</h2>
          <nav className="settings-nav">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                id={`settings-tab-${sec.id}`}
                className={`settings-nav-item ${activeSec === sec.id ? 'active' : ''}`}
                onClick={() => setActiveSec(sec.id)}
              >
                <span className="settings-nav-icon">{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Main Panel */}
        <main className="settings-main">
          {successMsg && (
            <div className="settings-success-alert animate-fadeIn">
              <FiCheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="card settings-panel-card">
            {/* General Settings */}
            {activeSec === 'general' && (
              <div className="settings-section-content animate-fadeIn">
                <h3 className="settings-section-title">General Profile Settings</h3>
                <form onSubmit={handleSaveGeneral} className="settings-form">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        id="setting-firstName"
                        type="text"
                        className="form-input"
                        value={generalForm.firstName}
                        onChange={e => setGeneralForm({ ...generalForm, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        id="setting-lastName"
                        type="text"
                        className="form-input"
                        value={generalForm.lastName}
                        onChange={e => setGeneralForm({ ...generalForm, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      id="setting-email"
                      type="email"
                      className="form-input"
                      value={generalForm.email}
                      onChange={e => setGeneralForm({ ...generalForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      id="setting-bio"
                      className="form-input"
                      style={{ minHeight: '80px', resize: 'vertical' }}
                      value={generalForm.bio}
                      onChange={e => setGeneralForm({ ...generalForm, bio: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      id="setting-location"
                      type="text"
                      className="form-input"
                      value={generalForm.location}
                      onChange={e => setGeneralForm({ ...generalForm, location: e.target.value })}
                    />
                  </div>

                  <button id="save-general-btn" type="submit" className="btn btn-primary" style={{ padding: '10px 24px', alignSelf: 'flex-start' }}>
                    Save Changes
                  </button>
                </form>
              </div>
            )}

            {/* Security and Login Settings */}
            {activeSec === 'security' && (
              <div className="settings-section-content animate-fadeIn">
                <h3 className="settings-section-title">Security and Login</h3>

                {/* Change Password Box */}
                <div style={{ marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>Change Password</h4>
                  <form onSubmit={handleSaveSecurity} className="settings-form">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input
                        id="setting-pw-current"
                        type="password"
                        className="form-input"
                        value={passwords.current}
                        onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        id="setting-pw-new"
                        type="password"
                        className="form-input"
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        id="setting-pw-confirm"
                        type="password"
                        className="form-input"
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        required
                      />
                    </div>
                    <button id="save-security-btn" type="submit" className="btn btn-primary" style={{ padding: '10px 24px', alignSelf: 'flex-start' }}>
                      Update Password
                    </button>
                  </form>
                </div>

                {/* Where You're Logged In */}
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '16px' }}>Where You're Logged In</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { device: 'Windows PC · Dhaka, Bangladesh', app: 'Chrome · Active Now', active: true },
                      { device: 'iPhone 15 Pro · Dhaka, Bangladesh', app: 'FRIENDIX App · 2 hours ago', active: false }
                    ].map((session, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: 'var(--bg-hover)' }}>
                        <FiSmartphone size={24} style={{ color: 'var(--text-secondary)' }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.93rem', color: 'var(--text-primary)' }}>{session.device}</p>
                          <p style={{ fontSize: '0.8rem', color: session.active ? 'var(--success)' : 'var(--text-secondary)', fontWeight: session.active ? 600 : 400 }}>{session.app}</p>
                        </div>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>Log Out</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSec === 'privacy' && (
              <div className="settings-section-content animate-fadeIn">
                <h3 className="settings-section-title">Privacy Settings and Tools</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {[
                    {
                      label: 'Who can see your future posts?',
                      desc: 'Adjust the visibility of the new items you share.',
                      value: privacy.futurePosts,
                      onChange: (val) => setPrivacy({ ...privacy, futurePosts: val }),
                      options: [
                        { val: 'public', label: '🌐 Public' },
                        { val: 'friends', label: '👥 Friends' },
                        { val: 'only_me', label: '🔒 Only me' }
                      ]
                    },
                    {
                      label: 'Who can send you friend requests?',
                      desc: 'Choose who is allowed to contact you.',
                      value: privacy.friendRequests,
                      onChange: (val) => setPrivacy({ ...privacy, friendRequests: val }),
                      options: [
                        { val: 'everyone', label: 'Everyone' },
                        { val: 'friends_of_friends', label: 'Friends of Friends' }
                      ]
                    }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ flex: 1, paddingRight: '20px' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.label}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                      </div>
                      <select
                        id={`privacy-setting-${idx}`}
                        className="form-input"
                        style={{ width: '180px', padding: '6px 10px' }}
                        value={item.value}
                        onChange={e => item.onChange(e.target.value)}
                      >
                        {item.options.map(opt => (
                          <option key={opt.val} value={opt.val}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, paddingRight: '20px' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Do you want search engines outside of FRIENDIX to link to your profile?</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Allows search engines to crawl your profile details.</p>
                    </div>
                    <label className="switch-container">
                      <input
                        id="setting-privacy-search"
                        type="checkbox"
                        checked={privacy.searchEngine}
                        onChange={e => {
                          setPrivacy({ ...privacy, searchEngine: e.target.checked });
                          showSuccess('Privacy settings updated!');
                        }}
                      />
                      <span className="switch-slider" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Blocking Settings */}
            {activeSec === 'blocking' && (
              <div className="settings-section-content animate-fadeIn">
                <h3 className="settings-section-title">Manage Blocking</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Once you block someone, they can no longer see things you post on your timeline, tag you, invite you to groups or events, start a conversation with you, or add you as a friend.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {blockedUsers.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '12px', background: 'var(--bg-hover)', borderRadius: '8px', textAlign: 'center' }}>Your block list is empty.</p>
                  ) : (
                    blockedUsers.map(user => (
                      <div key={user} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'var(--bg-hover)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user}</span>
                        <button
                          className="btn btn-secondary btn-sm"
                          id={`unblock-${user.replace(' ', '-')}`}
                          onClick={() => {
                            setBlockedUsers(blockedUsers.filter(u => u !== user));
                            showSuccess(`Unblocked ${user}!`);
                          }}
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeSec === 'language' && (
              <div className="settings-section-content animate-fadeIn">
                <h3 className="settings-section-title">Language and Region Settings</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>FRIENDIX Language</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select your preferred language for buttons, titles and menu labels.</p>
                  </div>
                  <select
                    id="setting-lang-select"
                    className="form-input"
                    style={{ width: '180px' }}
                    value={lang}
                    onChange={e => {
                      setLang(e.target.value);
                      showSuccess(`Language set to ${e.target.value}!`);
                    }}
                  >
                    {['English', 'Bengali', 'Spanish', 'French'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Notifications Settings */}
            {activeSec === 'notifications' && (
              <div className="settings-section-content animate-fadeIn">
                <h3 className="settings-section-title">Notification Settings</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Choose what notifications you receive and where they are delivered.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { id: 'comments', label: 'Comments', desc: 'Notify when someone comments on your post.' },
                    { id: 'tags', label: 'Tags', desc: 'Notify when someone tags you in a post or photo.' },
                    { id: 'friendRequests', label: 'Friend Requests', desc: 'Notify for new friend request activities.' }
                  ].map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '0.93rem', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.label}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                      </div>
                      <label className="switch-container">
                        <input
                          id={`setting-notif-${item.id}`}
                          type="checkbox"
                          checked={notifs[item.id]}
                          onChange={e => {
                            setNotifs({ ...notifs, [item.id]: e.target.checked });
                            showSuccess('Notification settings updated!');
                          }}
                        />
                        <span className="switch-slider" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
