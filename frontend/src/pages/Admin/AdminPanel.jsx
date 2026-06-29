import { useState, useEffect } from 'react';
import { mockUsers, mockPosts } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { authAPI, adminAPI } from '../../services/api';
import {
  FiTrendingUp, FiUsers, FiFileText, FiCloud, FiAlertCircle, FiShield,
  FiPlus, FiTrash2, FiUserCheck, FiUserX, FiCheck, FiSliders, FiList,
  FiLock, FiEye, FiTv, FiInfo, FiActivity, FiSettings
} from 'react-icons/fi';
import './AdminPanel.css';

// Initial Cloudinary Accounts
const CLOUDINARY_ACCOUNTS_INITIAL = [
  { id: 'c1', name: 'Primary Account (Active Main)', cloudName: 'friendix-prod', apiKey: '123456789', apiSecret: '••••••••', isActive: true, usage: '2.1 GB / 25 GB' },
  { id: 'c2', name: 'Backup Account', cloudName: 'friendix-backup', apiKey: '987654321', apiSecret: '••••••••', isActive: false, usage: '0.5 GB / 25 GB' },
];

// Initial Ad Campaigns
const INITIAL_CAMPAIGNS = [
  { id: 'ad1', name: 'Friendix App Launch (BD)', budget: '$250/day', impressions: '145K', clicks: '12.4K', ctr: '8.5%', status: 'Active' },
  { id: 'ad2', name: 'Tech Bangladesh Sponsored', budget: '$100/day', impressions: '45K', clicks: '2.1K', ctr: '4.6%', status: 'Active' },
  { id: 'ad3', name: 'Cooking Contest Campaign', budget: '$50/day', impressions: '18K', clicks: '350', ctr: '1.9%', status: 'Paused' }
];

// Initial Reported Content
const INITIAL_REPORTS = [
  { id: 'rep1', type: 'Post', author: 'Karim Ahmed', reason: 'Spam / Fake News', content: 'Earn $1000 daily from home! Link...', status: 'Pending' },
  { id: 'rep2', type: 'Profile', author: 'Nasrin Akter', reason: 'Harassment', content: 'Spam messages reported', status: 'Pending' }
];

// Initial Audit Logs
const INITIAL_AUDIT_LOGS = [
  { id: 'l1', time: '14:58', desc: 'Admin Amar Biswas logged into CRM Gateway.' },
  { id: 'l2', time: '15:02', desc: 'Primary Cloudinary configuration activated by Amar Biswas.' },
  { id: 'l3', time: '15:15', desc: 'User Rahim Uddin account details viewed by Amar Biswas.' }
];

const TABS = ['Dashboard', 'Users', 'Posts', 'Cloudinary', 'Ad Manager', 'Reports', 'Audit Logs', 'System Settings'];

const AdminPanel = () => {
  const { currentUser } = useAuth();
  
  // Security Gate states
  const [isGateLoggedIn, setIsGateLoggedIn] = useState(false);
  const [gateCredentials, setGateCredentials] = useState({ email: '', password: '' });
  const [gateError, setGateError] = useState('');

  // CRM Active States
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [cloudinaryAccounts, setCloudinaryAccounts] = useState([]);
  const [showAddCloudinary, setShowAddCloudinary] = useState(false);
  const [showEditCloudinary, setShowEditCloudinary] = useState(false);
  const [newCloudinary, setNewCloudinary] = useState({ name: '', cloudName: '', apiKey: '', apiSecret: '' });
  const [editingCloudinary, setEditingCloudinary] = useState({ id: '', name: '', cloudName: '', apiKey: '', apiSecret: '' });
  const [users, setUsers] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationsAllowed: true,
    jwtExpires: '30d',
    corsUrl: 'http://localhost:5173'
  });
  
  // Settings States
  const handleGateLogin = async (e) => {
    e.preventDefault();
    let emailInput = gateCredentials.email.trim().toLowerCase();
    // Normalize missing @ if user types 'amarbiswas8872gmail.com'
    if (emailInput === 'amarbiswas8872gmail.com') {
      emailInput = 'amarbiswas8872@gmail.com';
    }

    if (emailInput !== 'amarbiswas8872@gmail.com') {
      setGateError('Incorrect credentials or insufficient admin rights.');
      return;
    }

    try {
      setGateError('');
      const result = await authAPI.login(emailInput, gateCredentials.password);
      if (result.user && result.user.isAdmin) {
        localStorage.setItem('friendix_token', result.token);
        localStorage.setItem('friendix_user', JSON.stringify({ ...result.user, id: result.user._id }));
        setIsGateLoggedIn(true);
        // Log connection
        addAuditLog(`Admin ${result.user.fullName} successfully completed gate authentication.`);
      } else {
        setGateError('Incorrect credentials or insufficient admin rights.');
      }
    } catch (err) {
      setGateError(err.message || 'Authentication failed.');
    }
  };

  const fetchCloudinary = () => {
    adminAPI.getCloudinary()
      .then(res => setCloudinaryAccounts(res))
      .catch(err => console.error(err));
  };

  const fetchUsers = () => {
    adminAPI.getUsers()
      .then(res => setUsers(res))
      .catch(err => console.error(err));
  };

  const fetchPosts = () => {
    adminAPI.getPosts()
      .then(res => setPostsList(res))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    if (isGateLoggedIn) {
      fetchCloudinary();
      fetchUsers();
      fetchPosts();
    }
  }, [isGateLoggedIn]);

  const addAuditLog = (desc) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    setAuditLogs(prev => [
      { id: `log_${Date.now()}`, time, desc },
      ...prev
    ]);
  };

  const setActiveCloudinary = (id) => {
    adminAPI.activateCloudinary(id)
      .then(() => {
        fetchCloudinary();
        addAuditLog(`Cloudinary account active status updated.`);
      })
      .catch(err => alert(err.message));
  };

  const deleteCloudinary = (id) => {
    adminAPI.deleteCloudinary(id)
      .then(() => {
        fetchCloudinary();
        addAuditLog(`Cloudinary configuration deleted.`);
      })
      .catch(err => alert(err.message));
  };

  const addCloudinary = () => {
    if (!newCloudinary.name || !newCloudinary.cloudName || !newCloudinary.apiKey || !newCloudinary.apiSecret) return;
    adminAPI.addCloudinary(newCloudinary)
      .then(() => {
        fetchCloudinary();
        addAuditLog(`New Cloudinary config "${newCloudinary.name}" created.`);
        setNewCloudinary({ name: '', cloudName: '', apiKey: '', apiSecret: '' });
        setShowAddCloudinary(false);
      })
      .catch(err => alert(err.message));
  };

  const handleEditCloudinaryOpen = (acc) => {
    setEditingCloudinary({
      id: acc._id || acc.id,
      name: acc.name,
      cloudName: acc.cloudName,
      apiKey: acc.apiKey,
      apiSecret: ''
    });
    setShowEditCloudinary(true);
  };

  const saveEditedCloudinary = () => {
    if (!editingCloudinary.name || !editingCloudinary.cloudName || !editingCloudinary.apiKey) return;
    // For now edit operates through add/delete or we update active state
    setShowEditCloudinary(false);
  };

  const banUser = (id) => {
    adminAPI.banUser(id)
      .then(res => {
        fetchUsers();
        addAuditLog(`User "${res.user?.fullName || id}" account ban status toggled.`);
      })
      .catch(err => alert(err.message));
  };

  const handleDeletePost = (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      adminAPI.deletePost(id)
        .then(() => {
          fetchPosts();
          addAuditLog(`Post ${id} deleted.`);
        })
        .catch(err => alert(err.message));
    }
  };

  const toggleCampaign = (id) => {
    const target = campaigns.find(c => c.id === id);
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'Active' ? 'Paused' : 'Active' } : c));
    addAuditLog(`Ad campaign "${target?.name}" status toggled to: ${target?.status === 'Active' ? 'Paused' : 'Active'}.`);
  };

  const resolveReport = (id, action) => {
    const target = reports.find(r => r.id === id);
    setReports(prev => prev.filter(r => r.id !== id));
    addAuditLog(`Report against "${target?.author}" resolved with action: ${action}.`);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    addAuditLog('System configurations updated by admin.');
    alert('System settings updated successfully!');
  };

  // If the admin user has not logged into the security gate, render the secure dark-themed CRM portal
  if (!isGateLoggedIn) {
    return (
      <div className="admin-gate-overlay">
        <div className="admin-gate-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            <div className="admin-logo-icon"><FiShield size={24} /></div>
          </div>
          <h2 className="admin-gate-title">FRIENDIX Secure Gate</h2>
          <p style={{ color: '#888ea8', fontSize: '0.8rem', textAlign: 'center', margin: '0 0 10px 0' }}>
            Enter credential details to access administrative CRM systems.
          </p>

          <form onSubmit={handleGateLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#888ea8', display: 'block', marginBottom: '6px' }}>Admin Email</label>
              <input
                id="admin-gate-email"
                type="email"
                className="admin-gate-input"
                placeholder="amar@friendix.com"
                value={gateCredentials.email}
                onChange={e => setGateCredentials({ ...gateCredentials, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#888ea8', display: 'block', marginBottom: '6px' }}>Security Password</label>
              <input
                id="admin-gate-password"
                type="password"
                className="admin-gate-input"
                placeholder="••••••"
                value={gateCredentials.password}
                onChange={e => setGateCredentials({ ...gateCredentials, password: e.target.value })}
                required
              />
            </div>

            {gateError && (
              <p style={{ color: '#F33E58', fontSize: '0.78rem', margin: 0, fontWeight: 600 }}>{gateError}</p>
            )}

            <button type="submit" className="admin-gate-btn" id="admin-gate-submit">Verify & Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Stats
  const stats = [
    { label: 'Total Users', value: users.length, icon: <FiUsers size={22} />, color: '#1877F2' },
    { label: 'Active Reels & Feeds', value: postsList.length, icon: <FiFileText size={22} />, color: '#42B72A' },
    { label: 'Active Cloudinary API', value: cloudinaryAccounts.filter(c => c.isActive).length, icon: <FiCloud size={22} />, color: '#7B2FBE' },
    { label: 'Reports Pending', value: reports.length, icon: <FiAlertCircle size={22} />, color: '#F33E58' },
  ];

  return (
    <div className="admin-layout" data-theme="dark">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon"><FiShield size={20} /></div>
          <div>
            <p className="admin-logo-title">Control Panel</p>
            <p className="admin-logo-sub">FRIENDIX CRM</p>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map(tab => (
            <button
              key={tab}
              id={`admin-tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              className={`admin-nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Dashboard' && <FiTrendingUp size={16} />}
              {tab === 'Users' && <FiUsers size={16} />}
              {tab === 'Posts' && <FiFileText size={16} />}
              {tab === 'Cloudinary' && <FiCloud size={16} />}
              {tab === 'Ad Manager' && <FiTv size={16} />}
              {tab === 'Reports' && <FiAlertCircle size={16} />}
              {tab === 'Audit Logs' && <FiList size={16} />}
              {tab === 'System Settings' && <FiSettings size={16} />}
              <span>{tab}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="" className="avatar avatar-sm" />
          <div>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{currentUser?.fullName || 'Amar Biswas'}</p>
            <p style={{ fontSize: '0.75rem', color: '#42B72A', fontWeight: 600, margin: '2px 0 0 0' }}>Super Admin</p>
          </div>
        </div>
      </aside>

      {/* Admin Main Body */}
      <main className="admin-main">
        {/* Custom Header Bar inside Admin Panel */}
        <header className="admin-crm-header">
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>FRIENDIX Secure Administration Console</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="status-badge active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="cloud-status-dot active" style={{ display: 'inline-block' }} /> System Online
            </span>
          </div>
        </header>

        {/* Scrollable Panel Viewport */}
        <div className="admin-scroll-content">
          
          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
            <div className="admin-content animate-fadeIn">
              <h2 className="admin-page-title">Dashboard Overview</h2>

              <div className="stats-grid">
                {stats.map(stat => (
                  <div key={stat.label} className="stat-card card">
                    <div className="stat-icon" style={{ background: stat.color + '22', color: stat.color }}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="stat-value">{stat.value}</p>
                      <p className="stat-label">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="admin-two-col">
                {/* Recent users */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1.05rem' }}>Recent Registered Users</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {users.slice(0, 4).map(user => (
                      <div key={user.id} className="admin-user-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                        <img src={user.avatar} alt="" className="avatar avatar-sm" />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.85rem', margin: 0 }}>{user.fullName}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>{user.email}</p>
                        </div>
                        <span className="status-badge active">Active</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Server status status cards */}
                <div className="card" style={{ padding: '20px' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px', fontSize: '1.05rem' }}><FiActivity /> Server Status & Analytics</h3>
                  <div className="server-metrics-wrap">
                    <div className="metric-gauge-card">
                      <div className="circular-gauge">
                        <span className="circular-gauge-value">38%</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>CPU Core Load</p>
                    </div>

                    <div className="metric-gauge-card">
                      <div className="circular-gauge" style={{ background: 'conic-gradient(var(--success) 62%, var(--border-light) 0)' }}>
                        <span className="circular-gauge-value">62%</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>RAM Memory Allocation</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>MongoDB Size:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>12.4 MB / 512 MB (Atlas Free)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>API Average Latency:</span>
                      <strong style={{ color: 'var(--success)' }}>14ms (Healthy)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'Users' && (
            <div className="admin-content animate-fadeIn">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 className="admin-page-title">User Account CRM</h2>
                <span style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total: {users.length} registered</span>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User Info</th>
                      <th>Email ID</th>
                      <th>Location</th>
                      <th>System Role</th>
                      <th>Security Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => {
                      const userId = user._id || user.id;
                      return (
                        <tr key={userId} className={user.banned ? 'banned-row' : ''}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="avatar avatar-sm" />
                              ) : (
                                <div className="avatar-placeholder avatar-sm" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                              )}
                              <span style={{ fontWeight: 600, fontSize: '0.87rem' }}>{user.fullName}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{user.email || user.phone || '—'}</td>
                          <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{user.location || '—'}</td>
                          <td>
                            <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                              {user.isAdmin ? '👑 Admin' : '👤 User'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${user.banned ? 'banned' : 'active'}`}>
                              {user.banned ? 'Banned' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${user.banned ? 'btn-primary' : 'btn-danger'}`}
                              onClick={() => banUser(userId)}
                              disabled={userId === currentUser?.id}
                              id={`ban-user-${userId}`}
                            >
                              {user.banned ? 'Unban Account' : 'Ban Account'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === 'Posts' && (
            <div className="admin-content animate-fadeIn">
              <h2 className="admin-page-title">Feed Post Moderation</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Post Text</th>
                      <th>Social Likes</th>
                      <th>Comments</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {postsList.map(post => {
                      const author = post.authorId || { fullName: 'Unknown User', avatar: '' };
                      return (
                        <tr key={post._id || post.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={author.avatar || 'https://i.pravatar.cc/150'} alt="" className="avatar avatar-sm" />
                              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{author.fullName}</span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '240px' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                              {post.content || '[Media Attachment]'}
                            </p>
                          </td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{post.likes?.length || 0}</td>
                          <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>{post.comments?.length || 0}</td>
                          <td>
                            <button 
                              className="btn btn-danger btn-sm" 
                              onClick={() => handleDeletePost(post._id || post.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cloudinary Tab */}
          {activeTab === 'Cloudinary' && (
            <div className="admin-content animate-fadeIn">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 className="admin-page-title">Cloudinary Account API Manager</h2>
                <button
                  className="btn btn-primary animate-hover"
                  id="add-cloudinary-btn"
                  onClick={() => setShowAddCloudinary(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FiPlus /> Add Account
                </button>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginBottom: '20px', background: 'var(--primary-light)', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                💡 Automatically fallback or switch active Cloudinary accounts when current accounts reach their upload or memory limit.
              </p>

              <div className="cloudinary-grid">
                {cloudinaryAccounts.map(acc => (
                  <div
                    key={acc.id}
                    className={`cloudinary-card card ${acc.isActive ? 'active-cloud' : ''}`}
                    id={`cloudinary-${acc.id}`}
                  >
                    <div className="cloudinary-card-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <FiCloud size={20} color="var(--primary)" />
                          <h3 style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>{acc.name}</h3>
                          {acc.isActive && <span className="status-badge active">Active</span>}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Cloud Name: {acc.cloudName}</p>
                      </div>
                    </div>

                    <div className="cloudinary-details">
                      <div className="cloud-detail-row">
                        <span>API Key:</span>
                        <span>{acc.apiKey}</span>
                      </div>
                      <div className="cloud-detail-row">
                        <span>API Secret:</span>
                        <span>{acc.apiSecret}</span>
                      </div>
                      <div className="cloud-detail-row">
                        <span>Usage:</span>
                        <span style={{ color: acc.isActive ? 'var(--primary)' : 'var(--text-secondary)' }}>{acc.isActive ? '2.1 GB / 25 GB' : acc.usage}</span>
                      </div>
                    </div>

                    {/* Usage Bar */}
                    <div className="cloud-usage-bar-wrap">
                      <div
                        className="cloud-usage-bar-fill"
                        style={{
                          width: acc.isActive ? '10%' : '5%',
                          background: acc.isActive ? 'var(--primary)' : 'var(--border-color)'
                        }}
                      />
                    </div>

                    <div className="cloudinary-actions">
                      {!acc.isActive && (
                        <button
                          className="btn btn-primary btn-sm"
                          id={`activate-cloudinary-${acc.id}`}
                          onClick={() => setActiveCloudinary(acc.id)}
                        >
                          <FiCheck /> Activate
                        </button>
                      )}
                      {acc.isActive && (
                        <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 600 }}>Currently Active</span>
                      )}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEditCloudinaryOpen(acc)}
                          id={`edit-cloudinary-${acc.id}`}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteCloudinary(acc.id)}
                          disabled={acc.isActive}
                          id={`delete-cloudinary-${acc.id}`}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ad Manager Tab */}
          {activeTab === 'Ad Manager' && (
            <div className="admin-content animate-fadeIn">
              <h2 className="admin-page-title">Sponsored Ad Campaigns</h2>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ad Campaign Name</th>
                      <th>Daily Budget</th>
                      <th>Impressions</th>
                      <th>Total Clicks</th>
                      <th>CTR Rate</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(camp => (
                      <tr key={camp.id}>
                        <td style={{ fontWeight: 700 }}>{camp.name}</td>
                        <td style={{ color: 'var(--success)', fontWeight: 600 }}>{camp.budget}</td>
                        <td>{camp.impressions}</td>
                        <td>{camp.clicks}</td>
                        <td>{camp.ctr}</td>
                        <td>
                          <span className={`status-badge ${camp.status === 'Active' ? 'active' : 'banned'}`}>
                            {camp.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className={`btn btn-sm ${camp.status === 'Active' ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => toggleCampaign(camp.id)}
                            id={`toggle-ad-${camp.id}`}
                          >
                            {camp.status === 'Active' ? 'Pause Campaign' : 'Resume Campaign'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'Reports' && (
            <div className="admin-content animate-fadeIn">
              <h2 className="admin-page-title">Content Abuse Reports</h2>
              {reports.length > 0 ? (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Content Type</th>
                        <th>User Author</th>
                        <th>Abuse Reason</th>
                        <th>Snippet / Info</th>
                        <th>Decision Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(rep => (
                        <tr key={rep.id}>
                          <td style={{ fontWeight: 700 }}>{rep.type}</td>
                          <td>{rep.author}</td>
                          <td style={{ color: '#F33E58', fontWeight: 600 }}>{rep.reason}</td>
                          <td style={{ fontStyle: 'italic', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rep.content}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => resolveReport(rep.id, 'Dismissed')}>Keep Post</button>
                              <button className="btn btn-danger btn-sm" onClick={() => resolveReport(rep.id, 'Removed')}>Delete Post</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '12px' }}>🚩</p>
                  <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>All reports successfully resolved. Clear status.</p>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs Tab */}
          {activeTab === 'Audit Logs' && (
            <div className="admin-content animate-fadeIn">
              <h2 className="admin-page-title">Admin Audit Logs</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Rolling system logs capturing active admin console transactions.</p>
              <div className="card" style={{ padding: '16px', maxHeight: '420px', overflowY: 'auto' }}>
                {auditLogs.map(log => (
                  <div key={log.id} className="audit-log-item">
                    <span className="audit-time">[{log.time}]</span>
                    <span className="audit-desc">{log.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {activeTab === 'System Settings' && (
            <div className="admin-content animate-fadeIn" style={{ maxWidth: '600px' }}>
              <h2 className="admin-page-title">System Configuration Settings</h2>
              <form onSubmit={handleSaveSettings} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">CORS Origins Allowed URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={settings.corsUrl}
                    onChange={e => setSettings({ ...settings, corsUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">JWT Token Lifecycle Secret</label>
                  <input
                    type="password"
                    className="form-input"
                    value="••••••••••••••••••••••••••••••"
                    disabled
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '14px', background: 'var(--bg-hover)', borderRadius: '8px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={e => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                    />
                    Maintenance Mode
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={settings.registrationsAllowed}
                      onChange={e => setSettings({ ...settings, registrationsAllowed: e.target.checked })}
                    />
                    Allow Public Signups
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '12px', alignSelf: 'flex-end' }}>Save System Configuration</button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Add Cloudinary Modal */}
      {showAddCloudinary && (
        <div className="story-modal-overlay" onClick={() => setShowAddCloudinary(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Add Cloudinary Account</h3>
              <button className="icon-btn" onClick={() => setShowAddCloudinary(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'name', label: 'Account Name', placeholder: 'e.g. Production Backup 1' },
                { name: 'cloudName', label: 'Cloud Name', placeholder: 'Cloudinary Cloud Name' },
                { name: 'apiKey', label: 'API Key', placeholder: 'Cloudinary API Key' },
                { name: 'apiSecret', label: 'API Secret', placeholder: 'Cloudinary API Secret', type: 'password' },
              ].map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    id={`new-cloud-${field.name}`}
                    type={field.type || 'text'}
                    className="form-input"
                    placeholder={field.placeholder}
                    value={newCloudinary[field.name]}
                    onChange={e => setNewCloudinary({ ...newCloudinary, [field.name]: e.target.value })}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAddCloudinary(false)}>Cancel</button>
                <button className="btn btn-primary" id="save-cloudinary-btn" onClick={addCloudinary}>Save Account</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cloudinary Modal */}
      {showEditCloudinary && (
        <div className="story-modal-overlay" onClick={() => setShowEditCloudinary(false)}>
          <div className="card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '440px', padding: '24px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Edit Cloudinary Account</h3>
              <button className="icon-btn" onClick={() => setShowEditCloudinary(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'name', label: 'Account Name', placeholder: 'e.g. Production Backup 1' },
                { name: 'cloudName', label: 'Cloud Name', placeholder: 'Cloudinary Cloud Name' },
                { name: 'apiKey', label: 'API Key', placeholder: 'Cloudinary API Key' },
                { name: 'apiSecret', label: 'API Secret', placeholder: 'Cloudinary API Secret', type: 'password' },
              ].map(field => (
                <div key={field.name} className="form-group">
                  <label className="form-label">{field.label}</label>
                  <input
                    id={`edit-cloud-${field.name}`}
                    type={field.type || 'text'}
                    className="form-input"
                    placeholder={field.placeholder}
                    value={editingCloudinary[field.name]}
                    onChange={e => setEditingCloudinary({ ...editingCloudinary, [field.name]: e.target.value })}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setShowEditCloudinary(false)}>Cancel</button>
                <button className="btn btn-primary" id="update-cloudinary-btn" onClick={saveEditedCloudinary}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
