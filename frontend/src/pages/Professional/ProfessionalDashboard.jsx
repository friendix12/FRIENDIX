import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { FiTrendingUp, FiUsers, FiEye, FiMessageSquare, FiShare2, FiThumbsUp, FiArrowLeft, FiSettings, FiBarChart2, FiVideo, FiPieChart } from 'react-icons/fi';
import './ProfessionalDashboard.css';

const ProfessionalDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!currentUser?.isProfessional) {
      navigate('/');
      return;
    }
    loadDashboard();
  }, [currentUser, navigate]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await usersAPI.getMyPostAnalytics(period);
      setAnalytics(data.posts || []);
    } catch (err) {
      console.error('Analytics load error:', err);
    }
  };

  const handleToggleProfessional = async () => {
    if (!window.confirm('Are you sure you want to turn off Professional Mode? You will lose access to insights and analytics.')) return;
    try {
      await usersAPI.toggleProfessional();
      await refreshUser();
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to toggle professional mode.');
    }
  };

  if (!currentUser?.isProfessional) return null;

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="dashboard-loading">
          <div className="upload-spinner" />
          <p>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const overview = dashboard?.overview || {};

  return (
    <div className="app-layout">
      <Navbar />
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="dashboard-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
            <div>
              <h1 className="dashboard-title">Professional Dashboard</h1>
              <p className="dashboard-subtitle">Manage your professional presence</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
              <FiSettings style={{ marginRight: '6px' }} /> Settings
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="card dashboard-settings-card">
            <h3 style={{ fontWeight: 700, marginBottom: '12px' }}>Professional Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.87rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Profile Category</label>
                <select
                  className="form-input"
                  value={currentUser?.profileCategory || 'Digital Creator'}
                  onChange={async (e) => {
                    try {
                      await usersAPI.setCategory(e.target.value);
                      await refreshUser();
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  {['Digital Creator', 'Gaming Creator', 'Music Artist', 'Public Figure', 'Educator', 'Business', 'Health & Fitness'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-danger" onClick={handleToggleProfessional} style={{ alignSelf: 'flex-start' }}>
                Turn off Professional Mode
              </button>
            </div>
          </div>
        )}

        {/* Overview Cards */}
        <div className="dashboard-overview">
          <div className="overview-card">
            <div className="overview-icon" style={{ background: '#E7F3FF', color: '#1877F2' }}><FiEye size={22} /></div>
            <div>
              <p className="overview-value">{(overview.totalReach || 0).toLocaleString()}</p>
              <p className="overview-label">Total Reach</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}><FiThumbsUp size={22} /></div>
            <div>
              <p className="overview-value">{(overview.totalEngagement || 0).toLocaleString()}</p>
              <p className="overview-label">Total Engagement</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><FiUsers size={22} /></div>
            <div>
              <p className="overview-value">{(overview.followerCount || 0).toLocaleString()}</p>
              <p className="overview-label">Followers</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><FiVideo size={22} /></div>
            <div>
              <p className="overview-value">{(overview.totalVideoViews || 0).toLocaleString()}</p>
              <p className="overview-label">Video Views</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon" style={{ background: '#FFE4E6', color: '#E11D48' }}><FiMessageSquare size={22} /></div>
            <div>
              <p className="overview-value">{(overview.postCount || 0).toLocaleString()}</p>
              <p className="overview-label">Posts</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon" style={{ background: '#E0E7FF', color: '#4F46E5' }}><FiShare2 size={22} /></div>
            <div>
              <p className="overview-value">{(dashboard?.uniqueEngagers || 0).toLocaleString()}</p>
              <p className="overview-label">Unique Engagers</p>
            </div>
          </div>
        </div>

        {/* Growth Summary */}
        <div className="card dashboard-section">
          <h3 className="section-title"><FiTrendingUp style={{ marginRight: '8px' }} /> Growth Summary</h3>
          <div className="growth-stats">
            <div className="growth-item">
              <span className="growth-label">Friends</span>
              <span className="growth-value">{overview.friendCount || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Followers</span>
              <span className="growth-value">{overview.followerCount || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Following</span>
              <span className="growth-value">{overview.followingCount || 0}</span>
            </div>
            <div className="growth-item">
              <span className="growth-label">Posts (90d)</span>
              <span className="growth-value">{overview.postCount || 0}</span>
            </div>
          </div>
        </div>

        {/* Content Insights */}
        <div className="card dashboard-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="section-title"><FiBarChart2 style={{ marginRight: '8px' }} /> Content Insights</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['7d', '30d', '90d'].map(p => (
                <button key={p} className={`period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                  {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>

          {analytics.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No posts in this period.</p>
          ) : (
            <div className="analytics-table">
              <div className="analytics-row analytics-header">
                <span className="analytics-col-content">Content</span>
                <span className="analytics-col">Reach</span>
                <span className="analytics-col">Engagement</span>
                <span className="analytics-col">Reactions</span>
                <span className="analytics-col">Comments</span>
                <span className="analytics-col">Shares</span>
              </div>
              {analytics.map(post => (
                <div key={post.postId} className="analytics-row">
                  <span className="analytics-col-content">
                    {post.image && (
                      <img src={post.image} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', marginRight: '8px', flexShrink: 0 }} />
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.content || '(No text)'}
                    </span>
                  </span>
                  <span className="analytics-col">{(post.reach || 0).toLocaleString()}</span>
                  <span className="analytics-col">{(post.engagement || 0).toLocaleString()}</span>
                  <span className="analytics-col">{(post.reactions || 0).toLocaleString()}</span>
                  <span className="analytics-col">{(post.comments || 0).toLocaleString()}</span>
                  <span className="analytics-col">{(post.shares || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Posts */}
        {dashboard?.topPosts && dashboard.topPosts.length > 0 && (
          <div className="card dashboard-section">
            <h3 className="section-title"><FiPieChart style={{ marginRight: '8px' }} /> Top Performing Posts</h3>
            <div className="top-posts-grid">
              {dashboard.topPosts.slice(0, 3).map((post, i) => (
                <div key={post.postId} className="top-post-card">
                  <div className="top-post-rank">#{i + 1}</div>
                  {post.image && (
                    <img src={post.image} alt="" className="top-post-thumb" />
                  )}
                  <div className="top-post-info">
                    <p style={{ fontWeight: 600, fontSize: '0.87rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.content || '(No text)'}
                    </p>
                    <div className="top-post-stats">
                      <span><FiEye size={12} /> {(post.reach || 0).toLocaleString()}</span>
                      <span><FiThumbsUp size={12} /> {(post.reactions || 0).toLocaleString()}</span>
                      <span><FiMessageSquare size={12} /> {(post.comments || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
