import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, storiesAPI, postsAPI } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import {
  FiHome, FiTrendingUp, FiFileText, FiDollarSign, FiMessageSquare,
  FiGrid, FiChevronDown, FiChevronRight, FiEye, FiUsers,
  FiThumbsUp, FiShare2, FiStar, FiRefreshCw, FiPlusCircle,
  FiEdit3, FiVideo, FiBookOpen, FiShield, FiLink2, FiAward,
  FiSettings, FiInfo, FiCheckCircle, FiBarChart2, FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import './ProfessionalDashboard.css';

// ─── Tiny SVG Line Chart ───────────────────────────────────────────────────
const LineChart = ({ data = [], color = '#1877F2', height = 120, label = '' }) => {
  if (!data.length) return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>No data yet</div>;
  const w = 600, h = height;
  const pad = { top: 16, right: 16, bottom: 28, left: 40 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const maxV = Math.max(...data.map(d => d.value), 1);
  const minV = 0;
  const pts = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.top + ch - ((d.value - minV) / (maxV - minV)) * ch,
    ...d,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x},${pad.top + ch} L${pts[0].x},${pad.top + ch} Z`;
  const yTicks = [0, Math.round(maxV / 2), maxV];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {yTicks.map((v, i) => {
          const y = pad.top + ch - ((v - minV) / (maxV - minV)) * ch;
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4,4" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-secondary)">{v.toLocaleString()}</text>
            </g>
          );
        })}
        {/* X labels */}
        {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 6)) === 0).map((p, i) => (
          <text key={i} x={p.x} y={h - 4} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{p.label}</text>
        ))}
        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${label})`} />
        {/* Line */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────────────
const MetricCard = ({ label, value, pct, color = '#1877F2', active, onClick, info }) => {
  const isUp = pct >= 0;
  return (
    <div className={`pro-metric-card ${active ? 'active' : ''}`} onClick={onClick} style={{ borderBottomColor: active ? color : 'transparent' }}>
      <div className="pro-metric-top">
        <span className="pro-metric-label">{label}</span>
        {info && <FiInfo size={13} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} title={info} />}
      </div>
      <div className="pro-metric-row">
        <span className="pro-metric-value" style={{ color: active ? color : 'var(--text-primary)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        <span className={`pro-metric-pct ${isUp ? 'up' : 'down'}`}>
          {isUp ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}
          {Math.abs(pct)}%
        </span>
      </div>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, onSeeAll }) => (
  <div className="pro-section-hdr">
    <div>
      <h2 className="pro-section-title">{title}</h2>
      {sub && <p className="pro-section-sub">{sub}</p>}
    </div>
    {onSeeAll && <button className="pro-see-all-btn" onClick={onSeeAll}>See all</button>}
  </div>
);

// ─── Generate mock chart data for 28 days ─────────────────────────────────
const buildChartData = (totalValue) => {
  const days = 28;
  const data = [];
  let v = Math.max(Math.floor(totalValue / days), 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    const spike = i === Math.floor(days / 2) ? v * 4 : 0;
    data.push({ label, value: Math.max(0, v + spike + Math.floor(Math.random() * v * 0.3)) });
  }
  return data;
};

// ═════════════════════════════════════════════════════════════════════════════
const ProfessionalDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard]       = useState(null);
  const [analytics, setAnalytics]       = useState([]);
  const [storyStats, setStoryStats]     = useState({ totalViews: 0, totalStories: 0, stories: [] });
  const [recentPosts, setRecentPosts]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [period, setPeriod]             = useState('28d');
  const [activeMetric, setActiveMetric] = useState('views');
  const [navOpen, setNavOpen]           = useState({ insights: true, content: false, monetisation: false, engagement: false });
  const [lastRefresh, setLastRefresh]   = useState(new Date());
  const [isRefreshing, setRefreshing]   = useState(false);

  const pollingRef = useRef(null);

  useEffect(() => {
    if (!currentUser?.isProfessional) navigate('/');
  }, [currentUser, navigate]);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const [dashData, analyticsData, storiesData, postsData] = await Promise.allSettled([
        usersAPI.getDashboard(),
        usersAPI.getMyPostAnalytics('90d'),
        storiesAPI.getAll(),
        postsAPI.getFeed(),
      ]);
      if (dashData.status === 'fulfilled')     setDashboard(dashData.value);
      if (analyticsData.status === 'fulfilled') setAnalytics(analyticsData.value?.posts || []);
      if (storiesData.status === 'fulfilled') {
        const myId = (currentUser?._id || currentUser?.id)?.toString();
        const mine = (storiesData.value?.stories || []).filter(
          s => (s.authorId?._id || s.authorId)?.toString() === myId
        );
        setStoryStats({ totalViews: mine.reduce((s, x) => s + (x.viewers?.length || 0), 0), totalStories: mine.length, stories: mine });
      }
      if (postsData.status === 'fulfilled') {
        const myId = (currentUser?._id || currentUser?.id)?.toString();
        const mine = (postsData.value?.posts || []).filter(
          p => (p.author?._id || p.authorId)?.toString() === myId
        );
        setRecentPosts(mine.slice(0, 5));
      }
      setLastRefresh(new Date());
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); setRefreshing(false); }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.isProfessional) return;
    loadAll(false);
    pollingRef.current = setInterval(() => loadAll(true), 30000);
    return () => clearInterval(pollingRef.current);
  }, [loadAll]);

  if (!currentUser?.isProfessional) return null;

  const ov = dashboard?.overview || {};
  const totalViews       = ov.totalReach || 0;
  const totalInteract    = ov.totalEngagement || 0;
  const totalFollowers   = ov.followerCount || 0;
  const storyViews       = storyStats.totalViews;

  const chartMap = {
    views:      buildChartData(totalViews),
    interactions: buildChartData(totalInteract),
    followers:  buildChartData(totalFollowers),
    stories:    buildChartData(storyViews),
  };
  const metricColor = { views: '#1877F2', interactions: '#7C3AED', followers: '#D97706', stories: '#EA580C' };

  const toggleNav = (key) => setNavOpen(prev => ({ ...prev, [key]: !prev[key] }));

  const weeklyGoals = [
    { label: 'Create 8 new public posts',  done: Math.min(recentPosts.length, 8), total: 8, icon: <FiEdit3 size={16} /> },
    { label: 'Create 7 new public reels',  done: 0, total: 7, icon: <FiVideo size={16} /> },
    { label: 'Get 3 new followers',        done: Math.min(totalFollowers, 3), total: 3, icon: <FiUsers size={16} /> },
  ];
  const weekDone = weeklyGoals.filter(g => g.done >= g.total).length;
  const weekPct  = Math.round((weekDone / weeklyGoals.length) * 100);

  return (
    <div className="app-layout">
      <Navbar />

      <div className="pro-fb-layout">

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="pro-fb-sidebar">
          <div className="pro-fb-sidebar-title">
            <FiBarChart2 size={18} />
            Professional dashboard
          </div>

          {/* Nav item */}
          {[
            { key: null, icon: <FiHome size={16} />, label: 'Home', to: '/' },
          ].map(item => (
            <Link key={item.label} to={item.to} className="pro-fb-nav-item">
              {item.icon} {item.label}
            </Link>
          ))}

          {/* Collapsible nav groups */}
          {[
            {
              key: 'insights', icon: <FiTrendingUp size={16} />, label: 'Insights',
              children: ['Overview', 'Reach', 'Engagement', 'Followers', 'Stories']
            },
            {
              key: 'content', icon: <FiFileText size={16} />, label: 'Content',
              children: ['Posts', 'Stories', 'Reels', 'Scheduled']
            },
            {
              key: 'monetisation', icon: <FiDollarSign size={16} />, label: 'Monetisation',
              children: ['Overview', 'Stars', 'Subscriptions']
            },
            {
              key: 'engagement', icon: <FiMessageSquare size={16} />, label: 'Engagement',
              children: ['Comments', 'Messages', 'Mentions']
            },
          ].map(group => (
            <div key={group.key}>
              <button className="pro-fb-nav-group" onClick={() => toggleNav(group.key)}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{group.icon} {group.label}</span>
                {navOpen[group.key] ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
              </button>
              {navOpen[group.key] && (
                <div className="pro-fb-nav-children">
                  {group.children.map(c => (
                    <button key={c} className="pro-fb-nav-child">{c}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button className="pro-fb-nav-item" style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', background: 'transparent' }}>
            <FiGrid size={16} /> All tools
          </button>

          {/* Create a post */}
          <div className="pro-fb-sidebar-footer">
            <button className="pro-create-post-btn" onClick={() => navigate('/')}>
              <FiPlusCircle size={16} /> Create a post
            </button>
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="pro-fb-main">

          {/* ── INSIGHTS SECTION ── */}
          <section className="pro-fb-card">
            <SectionHeader
              title="Insights"
              sub="Learn how your Page is performing."
              onSeeAll={() => {}}
            />

            {/* Period selector */}
            <div className="pro-period-row">
              {['7d', '28d', '90d'].map(p => (
                <button key={p} className={`pro-period-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
                  {p === '7d' ? 'Last 7 days' : p === '28d' ? 'Last 28 days' : 'Last 90 days'}
                </button>
              ))}
              <button className="pro-refresh-btn" onClick={() => loadAll(false)} disabled={isRefreshing} title="Refresh">
                <FiRefreshCw size={14} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              </button>
            </div>

            {/* Metric cards */}
            <div className="pro-metrics-row">
              <MetricCard label="Views"        value={totalViews}     pct={12} color={metricColor.views}        active={activeMetric === 'views'}        onClick={() => setActiveMetric('views')}        info="Total times your content was seen" />
              <MetricCard label="Interactions" value={totalInteract}  pct={8}  color={metricColor.interactions} active={activeMetric === 'interactions'}  onClick={() => setActiveMetric('interactions')} info="Likes, comments, shares on your posts" />
              <MetricCard label="Net follows"  value={totalFollowers}  pct={5}  color={metricColor.followers}    active={activeMetric === 'followers'}     onClick={() => setActiveMetric('followers')}    info="Followers you gained in this period" />
              <MetricCard label="Story views"  value={storyViews}     pct={storyViews > 0 ? 20 : 0} color={metricColor.stories} active={activeMetric === 'stories'} onClick={() => setActiveMetric('stories')} info="Views on your stories" />
            </div>

            {/* Line chart */}
            <div className="pro-chart-wrap">
              {loading ? (
                <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading chart...
                </div>
              ) : (
                <LineChart
                  data={chartMap[activeMetric] || []}
                  color={metricColor[activeMetric]}
                  height={140}
                  label={activeMetric}
                />
              )}
            </div>
          </section>

          {/* ── CONTENT SECTION ── */}
          <section className="pro-fb-card">
            <SectionHeader
              title="Content"
              sub="Access your published and scheduled posts and create new content all in one place."
              onSeeAll={() => navigate('/')}
            />

            {recentPosts.length === 0 ? (
              <div className="pro-empty-state">
                <FiFileText size={32} style={{ opacity: 0.3 }} />
                <p>No posts yet. Share something to see your content insights!</p>
                <button className="pro-create-post-btn" onClick={() => navigate('/')}>
                  <FiPlusCircle size={14} /> Create a post
                </button>
              </div>
            ) : (
              <div className="pro-content-list">
                {recentPosts.slice(0, 3).map(post => {
                  const pid = post._id || post.id;
                  const views   = (post.reactions?.length || 0) * 8 + (post.comments?.length || 0) * 4;
                  const likes   = post.reactions?.length || 0;
                  const comments = post.comments?.length || 0;
                  return (
                    <div key={pid} className="pro-content-row">
                      <div className="pro-content-thumb">
                        {post.image
                          ? <img src={post.image} alt="" />
                          : <div className="pro-content-thumb-placeholder"><FiFileText size={18} /></div>}
                      </div>
                      <div className="pro-content-meta">
                        <p className="pro-content-text">{post.content || '(No text)'}</p>
                        <span className="pro-content-type">Post</span>
                      </div>
                      <div className="pro-content-stats">
                        <div className="pro-content-stat">
                          <FiEye size={13} />
                          <span>{views.toLocaleString()}</span>
                          <span className="pro-stat-lbl">Views</span>
                        </div>
                        <div className="pro-content-stat">
                          <FiThumbsUp size={13} />
                          <span>{likes}</span>
                          <span className="pro-stat-lbl">Reactions</span>
                        </div>
                        <div className="pro-content-stat">
                          <FiMessageSquare size={13} />
                          <span>{comments}</span>
                          <span className="pro-stat-lbl">Interactions</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── STORIES SECTION ── */}
          {storyStats.stories.length > 0 && (
            <section className="pro-fb-card">
              <SectionHeader title="Stories" sub="Your active stories and their performance." onSeeAll={() => {}} />
              <div className="pro-content-list">
                {storyStats.stories.slice(0, 3).map(s => {
                  const sid = s._id || s.id;
                  const views = s.viewers?.length || 0;
                  return (
                    <div key={sid} className="pro-content-row">
                      <div className="pro-content-thumb" style={{ height: '60px', width: '44px' }}>
                        {s.mediaType === 'video'
                          ? <video src={s.image} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                          : <img src={s.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />}
                      </div>
                      <div className="pro-content-meta">
                        <p className="pro-content-text">{s.text || '(Story)'}</p>
                        <span className="pro-content-type">Story · {s.musicLabel ? `🎵 ${s.musicLabel}` : (s.visibility === 'public' ? '🌍 Public' : '👥 Friends')}</span>
                      </div>
                      <div className="pro-content-stats">
                        <div className="pro-content-stat">
                          <FiEye size={13} />
                          <span>{views}</span>
                          <span className="pro-stat-lbl">Views</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── ENGAGEMENT SECTION ── */}
          <section className="pro-fb-card">
            <SectionHeader title="Engagement" sub="Manage comments, mentions and tags, and discover new ways to engage with your fans." onSeeAll={() => {}} />
            <div className="pro-engage-grid">
              <div className="pro-engage-card">
                <div className="pro-engage-icon" style={{ background: '#E7F3FF', color: '#1877F2' }}><FiThumbsUp size={20} /></div>
                <p className="pro-engage-val">{totalInteract.toLocaleString()}</p>
                <p className="pro-engage-lbl">Total reactions</p>
              </div>
              <div className="pro-engage-card">
                <div className="pro-engage-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}><FiMessageSquare size={20} /></div>
                <p className="pro-engage-val">{analytics.reduce((s, p) => s + (p.comments || 0), 0).toLocaleString()}</p>
                <p className="pro-engage-lbl">Comments</p>
              </div>
              <div className="pro-engage-card">
                <div className="pro-engage-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><FiShare2 size={20} /></div>
                <p className="pro-engage-val">{analytics.reduce((s, p) => s + (p.shares || 0), 0).toLocaleString()}</p>
                <p className="pro-engage-lbl">Shares</p>
              </div>
              <div className="pro-engage-card">
                <div className="pro-engage-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><FiStar size={20} /></div>
                <p className="pro-engage-val">{storyViews.toLocaleString()}</p>
                <p className="pro-engage-lbl">Story views</p>
              </div>
            </div>
          </section>

        </main>

        {/* ═══ RIGHT PANEL ═══ */}
        <aside className="pro-fb-right">

          {/* Page Status */}
          <div className="pro-right-card">
            <h3 className="pro-right-title">Page status</h3>
            <div className="pro-page-status-row">
              {currentUser?.avatar
                ? <img src={currentUser.avatar} alt="" className="avatar avatar-md" />
                : <div className="avatar-placeholder avatar-md" style={{ fontSize: '0.9rem' }}>{currentUser?.fullName?.[0]}</div>}
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.87rem', margin: 0 }}>{currentUser?.fullName}</p>
                <p style={{ fontSize: '0.75rem', color: '#16A34A', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCheckCircle size={12} /> Page has no issues.
                </p>
              </div>
            </div>
          </div>

          {/* Page Tools */}
          <div className="pro-right-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="pro-right-title" style={{ margin: 0 }}>Your page tools</h3>
              <button className="icon-btn" style={{ color: 'var(--text-secondary)' }}><FiChevronDown size={16} /></button>
            </div>
            {[
              { icon: <FiShield size={16} style={{ color: '#1877F2' }} />, label: 'Page access', sub: 'Invite people to help manage and control who can access it.' },
              { icon: <FiLink2 size={16} style={{ color: '#7C3AED' }} />, label: 'Linked accounts', sub: 'Engage with your community across platforms.' },
              { icon: <FiStar size={16} style={{ color: '#D97706' }} />, label: 'Page recommendation', sub: 'Review your Page recommendation status.' },
              { icon: <FiSettings size={16} style={{ color: '#16A34A' }} />, label: 'Page setup', sub: 'Set up your page for success.' },
              { icon: <FiAward size={16} style={{ color: '#EA580C' }} />, label: 'Creator education', sub: 'View resources and guidance to find success as a creator.' },
            ].map((tool, i) => (
              <div key={i} className="pro-tool-row">
                <div className="pro-tool-icon">{tool.icon}</div>
                <div>
                  <p className="pro-tool-label">{tool.label}</p>
                  <p className="pro-tool-sub">{tool.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Progress */}
          <div className="pro-right-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 className="pro-right-title" style={{ margin: 0 }}>Weekly progress</h3>
              <button className="pro-see-all-btn">See all</button>
            </div>
            <div className="pro-week-bar-wrap">
              <div className="pro-week-bar">
                <div className="pro-week-bar-fill" style={{ width: `${weekPct}%` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>{weekPct}% completed</span>
                <span>5 days left</span>
              </div>
            </div>
            <div className="pro-goals-list">
              {weeklyGoals.map((g, i) => {
                const pct = Math.min(100, Math.round((g.done / g.total) * 100));
                const done = g.done >= g.total;
                return (
                  <div key={i} className="pro-goal-row">
                    <div className={`pro-goal-icon ${done ? 'done' : ''}`}>{g.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p className="pro-goal-label">{g.label}</p>
                      <div className="pro-goal-bar"><div className="pro-goal-bar-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <FiChevronRight size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Last updated */}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '8px 0' }}>
            Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Auto-refreshes every 30s
          </p>
        </aside>

      </div>
    </div>
  );
};

export default ProfessionalDashboard;
