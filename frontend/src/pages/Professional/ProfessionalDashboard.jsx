import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, storiesAPI } from '../../services/api';
import {
  FiTrendingUp, FiUsers, FiEye, FiMessageSquare, FiShare2,
  FiThumbsUp, FiArrowLeft, FiSettings, FiBarChart2, FiVideo,
  FiPieChart, FiRefreshCw, FiBookOpen, FiActivity, FiStar,
  FiHeart, FiX
} from 'react-icons/fi';
import './ProfessionalDashboard.css';

// ─── Mini Sparkline bar chart ───
const SparkBar = ({ value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-hover)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.5s ease' }} />
    </div>
  );
};

// ─── Stat Card ───
const StatCard = ({ icon, label, value, sub, color, bg, trend }) => (
  <div className="pro-stat-card">
    <div className="pro-stat-icon" style={{ background: bg, color }}>
      {icon}
    </div>
    <div className="pro-stat-content">
      <p className="pro-stat-value">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      <p className="pro-stat-label">{label}</p>
      {sub && <p className="pro-stat-sub">{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={`pro-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </div>
    )}
  </div>
);

// ─── Live dot ───
const LiveDot = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', fontWeight: 700, color: '#16A34A', letterSpacing: '0.02em' }}>
    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
    LIVE
  </span>
);

// ═══════════════════════════════════════
const ProfessionalDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard]     = useState(null);
  const [analytics, setAnalytics]     = useState([]);
  const [storyStats, setStoryStats]   = useState({ totalViews: 0, totalStories: 0, stories: [] });
  const [loading, setLoading]         = useState(true);
  const [period, setPeriod]           = useState('30d');
  const [showSettings, setShowSettings] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]     = useState('overview'); // overview|posts|stories|audience

  const pollingRef = useRef(null);

  // ─── Guard: redirect if not pro ───
  useEffect(() => {
    if (!currentUser?.isProfessional) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  // ─── Load all data ───
  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [dashData, analyticsData, storiesData] = await Promise.allSettled([
        usersAPI.getDashboard(),
        usersAPI.getMyPostAnalytics(period),
        storiesAPI.getAll(),
      ]);

      if (dashData.status === 'fulfilled') setDashboard(dashData.value);
      if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value?.posts || []);
      if (storiesData.status === 'fulfilled') {
        const myStories = (storiesData.value?.stories || []).filter(
          s => (s.authorId?._id || s.authorId)?.toString() === (currentUser?._id || currentUser?.id)?.toString()
        );
        const totalViews = myStories.reduce((sum, s) => sum + (s.viewers?.length || 0), 0);
        setStoryStats({ totalViews, totalStories: myStories.length, stories: myStories });
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, [period, currentUser]);

  useEffect(() => {
    if (!currentUser?.isProfessional) return;
    loadAll(false);
    // Real-time polling every 30 seconds
    pollingRef.current = setInterval(() => loadAll(true), 30000);
    return () => clearInterval(pollingRef.current);
  }, [loadAll]);

  // Reload analytics when period changes
  useEffect(() => {
    if (!currentUser?.isProfessional || loading) return;
    usersAPI.getMyPostAnalytics(period).then(d => setAnalytics(d?.posts || [])).catch(console.error);
  }, [period]);

  const handleToggleProfessional = async () => {
    if (!window.confirm('Turn off Professional Mode? You will lose access to insights and analytics.')) return;
    try {
      await usersAPI.toggleProfessional();
      await refreshUser();
      navigate('/');
    } catch (err) {
      alert('Failed to toggle professional mode.');
    }
  };

  if (!currentUser?.isProfessional) return null;

  const overview      = dashboard?.overview || {};
  const topPosts      = dashboard?.topPosts || [];
  const maxEngagement = Math.max(...analytics.map(p => p.engagement || 0), 1);

  return (
    <div className="app-layout">
      <Navbar />
      <div className="pro-dashboard-wrapper">

        {/* ═══ HEADER ═══ */}
        <div className="pro-dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="pro-back-btn" onClick={() => navigate(-1)}><FiArrowLeft size={20} /></button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="pro-dashboard-title">Professional Dashboard</h1>
                <LiveDot />
              </div>
              <p className="pro-dashboard-sub">
                {currentUser?.profileCategory || 'Digital Creator'} &nbsp;·&nbsp;
                Last updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => loadAll(false)}
              disabled={isRefreshing}
              title="Refresh now"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiRefreshCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
            <button className="btn btn-secondary" onClick={() => setShowSettings(!showSettings)}>
              <FiSettings size={15} style={{ marginRight: '6px' }} /> Settings
            </button>
          </div>
        </div>

        {/* ═══ SETTINGS PANEL ═══ */}
        {showSettings && (
          <div className="card pro-settings-card animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontWeight: 800, margin: 0 }}>Professional Settings</h3>
              <button className="icon-btn" onClick={() => setShowSettings(false)}><FiX size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="form-label">Profile Category</label>
                <select className="form-input" value={currentUser?.profileCategory || 'Digital Creator'}
                  onChange={async (e) => {
                    try { await usersAPI.setCategory(e.target.value); await refreshUser(); }
                    catch (err) { console.error(err); }
                  }}
                >
                  {['Digital Creator', 'Gaming Creator', 'Music Artist', 'Public Figure', 'Educator', 'Business', 'Health & Fitness', 'Journalist', 'Politician', 'Athlete'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-danger" onClick={handleToggleProfessional} style={{ alignSelf: 'flex-start' }} id="turn-off-pro-btn">
                Turn off Professional Mode
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="pro-loading">
            <div className="upload-spinner" />
            <p>Loading Dashboard...</p>
          </div>
        ) : (
          <>
            {/* ═══ TAB NAV ═══ */}
            <div className="pro-tab-nav">
              {[
                { id: 'overview', icon: <FiActivity size={16} />, label: 'Overview' },
                { id: 'posts',    icon: <FiBarChart2 size={16} />, label: 'Posts' },
                { id: 'stories',  icon: <FiBookOpen size={16} />, label: 'Stories' },
                { id: 'audience', icon: <FiUsers size={16} />, label: 'Audience' },
              ].map(t => (
                <button
                  key={t.id}
                  className={`pro-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  id={`pro-tab-${t.id}`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ═══ OVERVIEW TAB ═══ */}
            {activeTab === 'overview' && (
              <>
                {/* Stat Cards */}
                <div className="pro-stats-grid">
                  <StatCard icon={<FiEye size={20} />}         label="Total Reach"       value={overview.totalReach || 0}       color="#1877F2" bg="#E7F3FF" trend={12} />
                  <StatCard icon={<FiHeart size={20} />}       label="Engagement"        value={overview.totalEngagement || 0}  color="#7C3AED" bg="#F3E8FF" trend={8}  />
                  <StatCard icon={<FiUsers size={20} />}       label="Followers"         value={overview.followerCount || 0}    color="#D97706" bg="#FEF3C7" trend={5}  />
                  <StatCard icon={<FiVideo size={20} />}       label="Video Views"       value={overview.totalVideoViews || 0}  color="#16A34A" bg="#DCFCE7" trend={-2} />
                  <StatCard icon={<FiMessageSquare size={20} />} label="Total Posts"     value={overview.postCount || 0}        color="#E11D48" bg="#FFE4E6" />
                  <StatCard icon={<FiStar size={20} />}        label="Story Views"       value={storyStats.totalViews}          color="#EA580C" bg="#FFEDD5" sub={`${storyStats.totalStories} active stories`} />
                  <StatCard icon={<FiShare2 size={20} />}      label="Unique Engagers"   value={dashboard?.uniqueEngagers || 0} color="#4F46E5" bg="#E0E7FF" />
                  <StatCard icon={<FiUsers size={20} />}       label="Friends"           value={overview.friendCount || 0}      color="#0891B2" bg="#E0F2FE" />
                </div>

                {/* Top Posts */}
                {topPosts.length > 0 && (
                  <div className="card pro-section">
                    <h3 className="pro-section-title"><FiStar style={{ marginRight: '8px', color: '#D97706' }} />Top Performing Posts</h3>
                    <div className="pro-top-posts-grid">
                      {topPosts.slice(0, 3).map((post, i) => (
                        <div key={post.postId} className="pro-top-post-card">
                          <div className="pro-top-post-rank">#{i + 1}</div>
                          {post.image && <img src={post.image} alt="" className="pro-top-post-thumb" />}
                          <div className="pro-top-post-info">
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 6px' }}>
                              {post.content || '(No text)'}
                            </p>
                            <div className="pro-post-mini-stats">
                              <span><FiEye size={11} /> {(post.reach || 0).toLocaleString()}</span>
                              <span><FiThumbsUp size={11} /> {(post.reactions || 0).toLocaleString()}</span>
                              <span><FiMessageSquare size={11} /> {(post.comments || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══ POSTS TAB ═══ */}
            {activeTab === 'posts' && (
              <div className="card pro-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 className="pro-section-title" style={{ margin: 0 }}><FiBarChart2 style={{ marginRight: '8px' }} />Content Insights</h3>
                  <div className="pro-period-tabs">
                    {['7d', '30d', '90d'].map(p => (
                      <button key={p} className={`pro-period-btn ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                        {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
                      </button>
                    ))}
                  </div>
                </div>

                {analytics.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <FiBarChart2 size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
                    <p>No posts in this period.</p>
                  </div>
                ) : (
                  <div className="pro-analytics-list">
                    {analytics.map(post => (
                      <div key={post.postId} className="pro-analytics-row">
                        <div className="pro-analytics-thumb">
                          {post.image
                            ? <img src={post.image} alt="" />
                            : <div className="pro-analytics-thumb-placeholder"><FiMessageSquare size={16} /></div>}
                        </div>
                        <div className="pro-analytics-content">
                          <p className="pro-analytics-text">{post.content || '(No text)'}</p>
                          <div className="pro-analytics-bars">
                            <div className="pro-bar-row">
                              <span className="pro-bar-label"><FiEye size={11} /> Reach</span>
                              <SparkBar value={post.reach || 0} max={overview.totalReach || 1} color="#1877F2" />
                              <span className="pro-bar-val">{(post.reach || 0).toLocaleString()}</span>
                            </div>
                            <div className="pro-bar-row">
                              <span className="pro-bar-label"><FiHeart size={11} /> Reactions</span>
                              <SparkBar value={post.reactions || 0} max={maxEngagement} color="#E11D48" />
                              <span className="pro-bar-val">{(post.reactions || 0).toLocaleString()}</span>
                            </div>
                            <div className="pro-bar-row">
                              <span className="pro-bar-label"><FiMessageSquare size={11} /> Comments</span>
                              <SparkBar value={post.comments || 0} max={maxEngagement} color="#7C3AED" />
                              <span className="pro-bar-val">{(post.comments || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pro-analytics-total">
                          <p className="pro-analytics-total-val">{(post.engagement || 0).toLocaleString()}</p>
                          <p className="pro-analytics-total-label">Total engagement</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══ STORIES TAB ═══ */}
            {activeTab === 'stories' && (
              <div className="card pro-section">
                <h3 className="pro-section-title"><FiBookOpen style={{ marginRight: '8px' }} />Story Insights</h3>
                <div className="pro-story-overview">
                  <div className="pro-story-stat">
                    <p className="pro-story-stat-val">{storyStats.totalStories}</p>
                    <p className="pro-story-stat-label">Active Stories (24h)</p>
                  </div>
                  <div className="pro-story-stat">
                    <p className="pro-story-stat-val" style={{ color: '#1877F2' }}>{storyStats.totalViews}</p>
                    <p className="pro-story-stat-label">Total Views</p>
                  </div>
                  <div className="pro-story-stat">
                    <p className="pro-story-stat-val" style={{ color: '#16A34A' }}>
                      {storyStats.totalStories > 0 ? Math.round(storyStats.totalViews / storyStats.totalStories) : 0}
                    </p>
                    <p className="pro-story-stat-label">Avg Views/Story</p>
                  </div>
                </div>

                {storyStats.stories.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                    <FiBookOpen size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
                    <p>No active stories. Share a story to see insights!</p>
                  </div>
                ) : (
                  <div className="pro-story-list">
                    {storyStats.stories.map(story => {
                      const views = story.viewers?.length || 0;
                      const maxV = Math.max(...storyStats.stories.map(s => s.viewers?.length || 0), 1);
                      const ago = (() => {
                        const diff = Date.now() - new Date(story.createdAt).getTime();
                        const h = Math.floor(diff / 3600000);
                        const m = Math.floor(diff / 60000);
                        return h >= 1 ? `${h}h ago` : `${m}m ago`;
                      })();
                      return (
                        <div key={story._id || story.id} className="pro-story-row">
                          <div className="pro-story-thumb">
                            {story.mediaType === 'video'
                              ? <video src={story.image} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                              : <img src={story.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 4px' }}>{ago}</p>
                            <div className="pro-bar-row" style={{ marginBottom: '4px' }}>
                              <span className="pro-bar-label"><FiEye size={11} /> Views</span>
                              <SparkBar value={views} max={maxV} color="#1877F2" />
                              <span className="pro-bar-val" style={{ fontWeight: 700, color: '#1877F2' }}>{views}</span>
                            </div>
                            {story.musicLabel && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                🎵 {story.musicLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══ AUDIENCE TAB ═══ */}
            {activeTab === 'audience' && (
              <div className="card pro-section">
                <h3 className="pro-section-title"><FiUsers style={{ marginRight: '8px' }} />Audience Overview</h3>
                <div className="pro-audience-grid">
                  <div className="pro-audience-card">
                    <FiUsers size={28} style={{ color: '#D97706', marginBottom: '8px' }} />
                    <p className="pro-audience-val">{(overview.followerCount || 0).toLocaleString()}</p>
                    <p className="pro-audience-label">Followers</p>
                  </div>
                  <div className="pro-audience-card">
                    <FiTrendingUp size={28} style={{ color: '#1877F2', marginBottom: '8px' }} />
                    <p className="pro-audience-val">{(overview.followingCount || 0).toLocaleString()}</p>
                    <p className="pro-audience-label">Following</p>
                  </div>
                  <div className="pro-audience-card">
                    <FiShare2 size={28} style={{ color: '#7C3AED', marginBottom: '8px' }} />
                    <p className="pro-audience-val">{(overview.friendCount || 0).toLocaleString()}</p>
                    <p className="pro-audience-label">Friends</p>
                  </div>
                  <div className="pro-audience-card">
                    <FiStar size={28} style={{ color: '#16A34A', marginBottom: '8px' }} />
                    <p className="pro-audience-val">{(dashboard?.uniqueEngagers || 0).toLocaleString()}</p>
                    <p className="pro-audience-label">Unique Engagers</p>
                  </div>
                </div>
                <div style={{ marginTop: '20px', padding: '16px', background: 'var(--bg-hover)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <FiActivity size={20} style={{ marginBottom: '6px', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>Demographics and detailed audience insights coming soon.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
