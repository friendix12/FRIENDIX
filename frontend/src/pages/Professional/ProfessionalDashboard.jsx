import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, storiesAPI, postsAPI, notificationsAPI } from '../../services/api';
import Navbar from '../../components/Navbar/Navbar';
import {
  FiHome, FiTrendingUp, FiFileText, FiDollarSign, FiMessageSquare,
  FiGrid, FiChevronDown, FiChevronRight, FiEye, FiUsers,
  FiThumbsUp, FiShare2, FiStar, FiRefreshCw, FiPlusCircle,
  FiEdit3, FiVideo, FiBookOpen, FiShield, FiLink2, FiAward,
  FiSettings, FiInfo, FiCheckCircle, FiBarChart2, FiArrowUp,
  FiArrowDown, FiGlobe, FiHeart, FiZap, FiCalendar, FiClock,
  FiMapPin, FiAlertCircle, FiExternalLink, FiLock, FiMail
} from 'react-icons/fi';
import './ProfessionalDashboard.css';

// ─── SVG Line Chart ──────────────────────────────────────────────────────────
const LineChart = ({ data = [], color = '#1877F2', height = 130 }) => {
  const [hovered, setHovered] = useState(null);
  if (!data.length) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
      No data for this period
    </div>
  );
  const W = 600, H = height;
  const pad = { top: 14, right: 12, bottom: 28, left: 42 };
  const cw = W - pad.left - pad.right;
  const ch = H - pad.top - pad.bottom;
  const maxV = Math.max(...data.map(d => d.value), 1);
  const pts = data.map((d, i) => ({
    x: pad.left + (i / Math.max(data.length - 1, 1)) * cw,
    y: pad.top + ch - (d.value / maxV) * ch,
    ...d,
  }));
  const pathD   = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD   = `${pathD} L${pts.at(-1).x},${pad.top + ch} L${pts[0].x},${pad.top + ch} Z`;
  const yTicks  = [0, Math.round(maxV / 2), maxV];
  const xLabels = pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 6)) === 0);

  return (
    <div style={{ width: '100%', position: 'relative', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {yTicks.map((v, i) => {
          const y = pad.top + ch - (v / maxV) * ch;
          return (
            <g key={i}>
              <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="var(--border-light)" strokeWidth="1" strokeDasharray="4,4" />
              <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-secondary)">{v.toLocaleString()}</text>
            </g>
          );
        })}
        {xLabels.map((p, i) => (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{p.label}</text>
        ))}
        <path d={areaD} fill="url(#chartGrad)" />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i} onMouseEnter={() => setHovered(p)} style={{ cursor: 'crosshair' }}>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hovered?.label === p.label ? 5 : 3.5}
              fill={hovered?.label === p.label ? color : 'white'}
              stroke={color} strokeWidth="2" />
          </g>
        ))}
        {hovered && (
          <g>
            <line x1={hovered.x} y1={pad.top} x2={hovered.x} y2={pad.top + ch} stroke={color} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            <rect x={hovered.x - 38} y={hovered.y - 28} width="76" height="22" rx="4" fill={color} />
            <text x={hovered.x} y={hovered.y - 12} textAnchor="middle" fontSize="11" fill="white" fontWeight="700">
              {hovered.value.toLocaleString()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// ─── Build chart data from real counts ───────────────────────────────────────
const buildChart = (total = 0, days = 28) => {
  const per = Math.max(Math.floor(total / days), 0);
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    const spike  = i === Math.floor(days * 0.65) ? per * 5 : 0;
    const val    = Math.max(0, per + spike + Math.floor(Math.random() * Math.max(per, 1) * 0.4));
    return { label, value: val };
  });
};

// ─── Metric card ─────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, pct = 0, color, active, onClick, info }) => (
  <div className={`pro-metric-card ${active ? 'active' : ''}`}
    onClick={onClick}
    style={{ borderBottomColor: active ? color : 'transparent' }}>
    <div className="pro-metric-top">
      <span className="pro-metric-label">{label}</span>
      {info && <FiInfo size={12} style={{ color: 'var(--text-secondary)' }} title={info} />}
    </div>
    <div className="pro-metric-row">
      <span className="pro-metric-value" style={{ color: active ? color : 'var(--text-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className={`pro-metric-pct ${pct >= 0 ? 'up' : 'down'}`}>
        {pct >= 0 ? <FiArrowUp size={10} /> : <FiArrowDown size={10} />}
        {Math.abs(pct)}%
      </span>
    </div>
  </div>
);

// ─── Section wrapper ─────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub, action }) => (
  <div className="pro-section-hdr">
    <div><h2 className="pro-section-title">{title}</h2>
      {sub && <p className="pro-section-sub">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── Info banner ─────────────────────────────────────────────────────────────
const InfoBanner = ({ icon, title, desc, color = '#1877F2', bg = '#E7F3FF' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px', background: bg, borderRadius: '10px', marginBottom: '14px' }}>
    <div style={{ color, flexShrink: 0, marginTop: '2px' }}>{icon}</div>
    <div>
      <p style={{ fontWeight: 700, fontSize: '0.88rem', margin: '0 0 3px', color: 'var(--text-primary)' }}>{title}</p>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>{desc}</p>
    </div>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
const ProfessionalDashboard = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard]       = useState(null);
  const [analytics, setAnalytics]       = useState([]);
  const [storyStats, setStoryStats]     = useState({ totalViews: 0, totalStories: 0, stories: [] });
  const [myPosts, setMyPosts]           = useState([]);
  const [myNotifs, setMyNotifs]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [isRefreshing, setRefreshing]   = useState(false);
  const [lastRefresh, setLastRefresh]   = useState(new Date());

  // Navigation state
  const [activeView, setActiveView]     = useState('home');
  const [period, setPeriod]             = useState('28d');
  const [activeMetric, setActiveMetric] = useState('views');
  const [navOpen, setNavOpen]           = useState({ insights: false, content: false, monetisation: false, engagement: false });

  const pollingRef = useRef(null);

  useEffect(() => { if (!currentUser?.isProfessional) navigate('/'); }, [currentUser, navigate]);

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const myId = (currentUser?._id || currentUser?.id)?.toString();
      const [d, a, s, p, n] = await Promise.allSettled([
        usersAPI.getDashboard(),
        usersAPI.getMyPostAnalytics('90d'),
        storiesAPI.getAll(),
        postsAPI.getFeed(),
        notificationsAPI.getAll(),
      ]);
      if (d.status === 'fulfilled') setDashboard(d.value);
      if (a.status === 'fulfilled') setAnalytics(a.value?.posts || []);
      if (s.status === 'fulfilled') {
        const mine = (s.value?.stories || []).filter(x => (x.authorId?._id || x.authorId)?.toString() === myId);
        setStoryStats({ totalViews: mine.reduce((s, x) => s + (x.viewers?.length || 0), 0), totalStories: mine.length, stories: mine });
      }
      if (p.status === 'fulfilled') {
        const mine = (p.value?.posts || []).filter(x => (x.author?._id || x.authorId)?.toString() === myId);
        setMyPosts(mine);
      }
      if (n.status === 'fulfilled') setMyNotifs(n.value?.notifications || []);
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

  const ov             = dashboard?.overview || {};
  const totalViews     = ov.totalReach       || 0;
  const totalInteract  = ov.totalEngagement  || 0;
  const totalFollowers = ov.followerCount    || 0;
  const totalFriends   = ov.friendCount      || 0;
  const storyViews     = storyStats.totalViews;
  const totalPosts     = ov.postCount        || myPosts.length;
  const totalComments  = analytics.reduce((s, p) => s + (p.comments || 0), 0);
  const totalShares    = analytics.reduce((s, p) => s + (p.shares || 0), 0);
  const totalReactions = analytics.reduce((s, p) => s + (p.reactions || 0), 0);

  const periodDays   = period === '7d' ? 7 : period === '28d' ? 28 : 90;
  const chartData    = {
    views:        buildChart(totalViews, periodDays),
    interactions: buildChart(totalInteract, periodDays),
    followers:    buildChart(totalFollowers, periodDays),
    stories:      buildChart(storyViews, periodDays),
    reach:        buildChart(totalViews * 2, periodDays),
    posts:        buildChart(totalPosts, periodDays),
  };
  const metricColor = { views: '#1877F2', interactions: '#7C3AED', followers: '#D97706', stories: '#EA580C', reach: '#1877F2', posts: '#16A34A' };

  const weeklyGoals = [
    { label: 'Create 8 new public posts',  done: Math.min(myPosts.length, 8), total: 8,  icon: <FiEdit3 size={15} /> },
    { label: 'Create 7 new public reels',  done: 0, total: 7, icon: <FiVideo size={15} /> },
    { label: 'Get 3 new followers',        done: Math.min(totalFollowers, 3), total: 3,  icon: <FiUsers size={15} /> },
  ];
  const weekPct = Math.round((weeklyGoals.filter(g => g.done >= g.total).length / weeklyGoals.length) * 100);

  const go = (view, navKey = null) => {
    setActiveView(view);
    if (navKey) setNavOpen(prev => ({ ...prev, [navKey]: true }));
  };

  // ─── MAIN CONTENT renderer ────────────────────────────────────────────────
  const renderContent = () => {

    // ━━ HOME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'home') return (
      <>
        {/* Insights overview */}
        <section className="pro-fb-card">
          <SectionHeader title="Insights" sub="Learn how your Page is performing."
            action={<button className="pro-see-all-btn" onClick={() => go('insights-overview', 'insights')}>See all</button>} />
          <PeriodRow period={period} setPeriod={setPeriod} onRefresh={() => loadAll(false)} isRefreshing={isRefreshing} />
          <div className="pro-metrics-row">
            <MetricCard label="Views"        value={totalViews}    pct={12} color={metricColor.views}        active={activeMetric==='views'}        onClick={() => setActiveMetric('views')}        info="How many times your content was seen" />
            <MetricCard label="Interactions" value={totalInteract} pct={8}  color={metricColor.interactions} active={activeMetric==='interactions'}  onClick={() => setActiveMetric('interactions')} info="Likes, comments, shares" />
            <MetricCard label="Net follows"  value={totalFollowers} pct={5} color={metricColor.followers}    active={activeMetric==='followers'}     onClick={() => setActiveMetric('followers')}    info="Followers gained" />
            <MetricCard label="Story views"  value={storyViews}    pct={storyViews > 0 ? 20 : 0} color={metricColor.stories} active={activeMetric==='stories'} onClick={() => setActiveMetric('stories')} info="Story view count" />
          </div>
          <div className="pro-chart-wrap">
            <LineChart data={chartData[activeMetric] || []} color={metricColor[activeMetric]} height={130} />
          </div>
        </section>

        {/* Content preview */}
        <section className="pro-fb-card">
          <SectionHeader title="Content" sub="Access your published posts and create new content."
            action={<button className="pro-see-all-btn" onClick={() => go('content-posts', 'content')}>See all</button>} />
          <ContentList posts={myPosts.slice(0, 3)} onCreatePost={() => navigate('/')} />
        </section>

        {/* Stories preview */}
        {storyStats.stories.length > 0 && (
          <section className="pro-fb-card">
            <SectionHeader title="Stories" sub="Your active stories and their performance."
              action={<button className="pro-see-all-btn" onClick={() => go('content-stories', 'content')}>See all</button>} />
            <StoriesList stories={storyStats.stories.slice(0, 3)} />
          </section>
        )}

        {/* Engagement preview */}
        <section className="pro-fb-card">
          <SectionHeader title="Engagement" sub="Manage comments, mentions and tags, and discover new ways to engage with your fans."
            action={<button className="pro-see-all-btn" onClick={() => go('engagement-comments', 'engagement')}>See all</button>} />
          <EngagementGrid totalReactions={totalReactions} totalComments={totalComments} totalShares={totalShares} storyViews={storyViews} />
        </section>
      </>
    );

    // ━━ INSIGHTS — OVERVIEW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'insights-overview') return (
      <section className="pro-fb-card">
        <SectionHeader title="Insights Overview" sub="A summary of your page performance across all metrics." />
        <PeriodRow period={period} setPeriod={setPeriod} onRefresh={() => loadAll(false)} isRefreshing={isRefreshing} />
        <div className="pro-stats-summary-grid">
          {[
            { label: 'Total Reach',       value: totalViews,    color: '#1877F2', bg: '#E7F3FF', icon: <FiEye size={18} />,         pct: 12 },
            { label: 'Total Engagement',  value: totalInteract, color: '#7C3AED', bg: '#F3E8FF', icon: <FiThumbsUp size={18} />,    pct: 8  },
            { label: 'Followers',         value: totalFollowers, color: '#D97706', bg: '#FEF3C7', icon: <FiUsers size={18} />,      pct: 5  },
            { label: 'Story Views',       value: storyViews,    color: '#EA580C', bg: '#FFEDD5', icon: <FiBookOpen size={18} />,    pct: storyViews > 0 ? 20 : 0 },
            { label: 'Total Posts',       value: totalPosts,    color: '#16A34A', bg: '#DCFCE7', icon: <FiFileText size={18} />,    pct: 3  },
            { label: 'Friends',           value: totalFriends,  color: '#0891B2', bg: '#E0F2FE', icon: <FiShare2 size={18} />,     pct: 2  },
            { label: 'Total Reactions',   value: totalReactions, color: '#E11D48', bg: '#FFE4E6', icon: <FiHeart size={18} />,    pct: 9  },
            { label: 'Total Comments',    value: totalComments, color: '#4F46E5', bg: '#E0E7FF', icon: <FiMessageSquare size={18} />, pct: 6 },
          ].map((s, i) => (
            <div key={i} className="pro-summary-card">
              <div className="pro-summary-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div>
                <p className="pro-summary-value" style={{ color: s.color }}>{s.value.toLocaleString()}</p>
                <p className="pro-summary-label">{s.label}</p>
              </div>
              <span className="pro-metric-pct up" style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
                <FiArrowUp size={10} />{s.pct}%
              </span>
            </div>
          ))}
        </div>
      </section>
    );

    // ━━ INSIGHTS — REACH ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'insights-reach') return (
      <section className="pro-fb-card">
        <SectionHeader title="Reach" sub="Track how many unique people see your content." />
        <PeriodRow period={period} setPeriod={setPeriod} onRefresh={() => loadAll(false)} isRefreshing={isRefreshing} />
        <InfoBanner icon={<FiGlobe size={20} />} title="Total Reach" desc="Reach counts the number of unique accounts that saw any of your content at least once." color="#1877F2" bg="#E7F3FF" />
        <div className="pro-big-stat-row">
          <div className="pro-big-stat">
            <p className="pro-big-stat-val" style={{ color: '#1877F2' }}>{totalViews.toLocaleString()}</p>
            <p className="pro-big-stat-lbl">Total Reach</p>
            <span className="pro-metric-pct up"><FiArrowUp size={10} />12%</span>
          </div>
          <div className="pro-big-stat">
            <p className="pro-big-stat-val">{(totalViews * 0.4).toFixed(0).toLocaleString()}</p>
            <p className="pro-big-stat-lbl">Organic Reach</p>
          </div>
          <div className="pro-big-stat">
            <p className="pro-big-stat-val">{(totalFollowers * 0.6).toFixed(0)}</p>
            <p className="pro-big-stat-lbl">Follower Reach</p>
          </div>
        </div>
        <div className="pro-chart-wrap">
          <LineChart data={chartData.reach} color="#1877F2" height={140} />
        </div>
      </section>
    );

    // ━━ INSIGHTS — ENGAGEMENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'insights-engagement') return (
      <section className="pro-fb-card">
        <SectionHeader title="Engagement" sub="How people interact with your content." />
        <PeriodRow period={period} setPeriod={setPeriod} onRefresh={() => loadAll(false)} isRefreshing={isRefreshing} />
        <div className="pro-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '20px' }}>
          <MetricCard label="Reactions"  value={totalReactions}  pct={9}  color="#E11D48" active info="Likes, loves, hahas, wows, sads, angrys" />
          <MetricCard label="Comments"   value={totalComments}   pct={6}  color="#7C3AED" info="Comments on your posts" />
          <MetricCard label="Shares"     value={totalShares}     pct={4}  color="#16A34A" info="Times your posts were shared" />
        </div>
        <div className="pro-chart-wrap">
          <LineChart data={chartData.interactions} color="#7C3AED" height={140} />
        </div>
        <div style={{ marginTop: '16px' }}>
          {analytics.slice(0, 5).map((post, i) => (
            <div key={i} className="pro-engage-row">
              <span className="pro-engage-row-rank">#{i + 1}</span>
              <p className="pro-engage-row-text">{post.content || '(No text)'}</p>
              <div className="pro-engage-row-stats">
                <span><FiThumbsUp size={12} /> {post.reactions || 0}</span>
                <span><FiMessageSquare size={12} /> {post.comments || 0}</span>
                <span><FiShare2 size={12} /> {post.shares || 0}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    );

    // ━━ INSIGHTS — FOLLOWERS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'insights-followers') return (
      <section className="pro-fb-card">
        <SectionHeader title="Followers" sub="Track your audience growth over time." />
        <PeriodRow period={period} setPeriod={setPeriod} onRefresh={() => loadAll(false)} isRefreshing={isRefreshing} />
        <div className="pro-big-stat-row">
          <div className="pro-big-stat">
            <p className="pro-big-stat-val" style={{ color: '#D97706' }}>{totalFollowers.toLocaleString()}</p>
            <p className="pro-big-stat-lbl">Total Followers</p>
            <span className="pro-metric-pct up"><FiArrowUp size={10} />5%</span>
          </div>
          <div className="pro-big-stat">
            <p className="pro-big-stat-val">{totalFriends.toLocaleString()}</p>
            <p className="pro-big-stat-lbl">Total Friends</p>
          </div>
          <div className="pro-big-stat">
            <p className="pro-big-stat-val">{ov.followingCount || 0}</p>
            <p className="pro-big-stat-lbl">Following</p>
          </div>
        </div>
        <div className="pro-chart-wrap">
          <LineChart data={chartData.followers} color="#D97706" height={140} />
        </div>
        <div className="pro-audience-demo">
          <h4 style={{ fontWeight: 700, fontSize: '0.9rem', margin: '16px 0 10px' }}>Audience Location</h4>
          <InfoBanner icon={<FiMapPin size={18} />} title="Demographics coming soon" desc="As your audience grows, detailed location and age demographics will appear here." color="#7C3AED" bg="#F3E8FF" />
        </div>
      </section>
    );

    // ━━ INSIGHTS — STORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'insights-stories') return (
      <section className="pro-fb-card">
        <SectionHeader title="Stories Insights" sub="Performance metrics for your stories." />
        <div className="pro-big-stat-row">
          <div className="pro-big-stat">
            <p className="pro-big-stat-val" style={{ color: '#EA580C' }}>{storyViews.toLocaleString()}</p>
            <p className="pro-big-stat-lbl">Total Story Views</p>
          </div>
          <div className="pro-big-stat">
            <p className="pro-big-stat-val">{storyStats.totalStories}</p>
            <p className="pro-big-stat-lbl">Active Stories</p>
          </div>
          <div className="pro-big-stat">
            <p className="pro-big-stat-val">{storyStats.totalStories > 0 ? Math.round(storyViews / storyStats.totalStories) : 0}</p>
            <p className="pro-big-stat-lbl">Avg Views/Story</p>
          </div>
        </div>
        <div className="pro-chart-wrap">
          <LineChart data={chartData.stories} color="#EA580C" height={140} />
        </div>
        <StoriesList stories={storyStats.stories} />
      </section>
    );

    // ━━ CONTENT — POSTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'content-posts') return (
      <section className="pro-fb-card">
        <SectionHeader title="Posts" sub="All your published posts with performance data." />
        <div className="pro-chart-wrap" style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Post reach over time</p>
          <LineChart data={chartData.posts} color="#16A34A" height={120} />
        </div>
        {myPosts.length === 0
          ? <EmptyState icon={<FiFileText size={32} />} text="No posts yet. Create your first post!" action={{ label: 'Create a post', onClick: () => navigate('/') }} />
          : <ContentList posts={myPosts} onCreatePost={() => navigate('/')} showAll />}
      </section>
    );

    // ━━ CONTENT — STORIES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'content-stories') return (
      <section className="pro-fb-card">
        <SectionHeader title="Stories" sub="Your published stories (active 48 hours)." />
        {storyStats.stories.length === 0
          ? <EmptyState icon={<FiBookOpen size={32} />} text="No active stories. Add a story to see insights!" />
          : <StoriesList stories={storyStats.stories} showAll />}
      </section>
    );

    // ━━ CONTENT — REELS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'content-reels') return (
      <section className="pro-fb-card">
        <SectionHeader title="Reels" sub="Short-form video content." />
        <InfoBanner icon={<FiVideo size={20} />} title="Reels — Coming Soon" desc="Reels (short-form vertical video) will be available in a future update. Stay tuned!" color="#7C3AED" bg="#F3E8FF" />
        <EmptyState icon={<FiVideo size={32} />} text="No reels yet. Reels feature is coming soon!" />
      </section>
    );

    // ━━ CONTENT — SCHEDULED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'content-scheduled') return (
      <section className="pro-fb-card">
        <SectionHeader title="Scheduled Posts" sub="Posts queued to publish at a future time." />
        <InfoBanner icon={<FiCalendar size={20} />} title="Post Scheduling — Coming Soon" desc="Schedule posts to go live at specific times. This feature is planned for a future release." color="#D97706" bg="#FEF3C7" />
        <EmptyState icon={<FiCalendar size={32} />} text="No scheduled posts." />
      </section>
    );

    // ━━ MONETISATION — OVERVIEW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'monetisation-overview') return (
      <section className="pro-fb-card">
        <SectionHeader title="Monetisation Overview" sub="Check your monetisation eligibility and manage earning tools." />
        <InfoBanner icon={<FiCheckCircle size={20} />} title="Your page has no monetisation policy issues" desc="Keep creating quality content to become eligible for monetisation tools." color="#16A34A" bg="#DCFCE7" />
        <div className="pro-mono-grid">
          {[
            { icon: <FiStar size={22} style={{ color: '#D97706' }} />, label: 'Stars', status: 'Not eligible yet', desc: 'Fans can send you Stars during live videos and reels.', bg: '#FEF3C7', color: '#D97706' },
            { icon: <FiUsers size={22} style={{ color: '#1877F2' }} />, label: 'Subscriptions', status: 'Not eligible yet', desc: 'Charge subscribers a monthly fee for exclusive content.', bg: '#E7F3FF', color: '#1877F2' },
            { icon: <FiDollarSign size={22} style={{ color: '#16A34A' }} />, label: 'In-stream ads', status: 'Not eligible yet', desc: 'Earn money from ads shown in your videos.', bg: '#DCFCE7', color: '#16A34A' },
          ].map((m, i) => (
            <div key={i} className="pro-mono-card">
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>{m.icon}</div>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>{m.label}</p>
              <p style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600, margin: '0 0 6px' }}>{m.status}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
        <InfoBanner icon={<FiAlertCircle size={18} />} title="Build your audience to unlock monetisation" desc="You need more followers and consistent content to qualify. Keep posting quality content!" color="#D97706" bg="#FEF3C7" />
      </section>
    );

    // ━━ MONETISATION — STARS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'monetisation-stars') return (
      <section className="pro-fb-card">
        <SectionHeader title="Stars" sub="Fans can send you Stars to show appreciation for your content." />
        <InfoBanner icon={<FiStar size={20} />} title="Stars not yet enabled" desc="Stars allow your fans to tip you during live videos and reels. Grow your audience to become eligible." color="#D97706" bg="#FEF3C7" />
        <div className="pro-big-stat-row">
          <div className="pro-big-stat"><p className="pro-big-stat-val">0</p><p className="pro-big-stat-lbl">Stars received</p></div>
          <div className="pro-big-stat"><p className="pro-big-stat-val">₹0</p><p className="pro-big-stat-lbl">Estimated earnings</p></div>
          <div className="pro-big-stat"><p className="pro-big-stat-val">0</p><p className="pro-big-stat-lbl">Star senders</p></div>
        </div>
      </section>
    );

    // ━━ MONETISATION — SUBSCRIPTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'monetisation-subscriptions') return (
      <section className="pro-fb-card">
        <SectionHeader title="Subscriptions" sub="Offer exclusive content to paying subscribers." />
        <InfoBanner icon={<FiUsers size={20} />} title="Subscriptions not yet enabled" desc="Charge a monthly fee for exclusive content, early access to posts, and subscriber-only groups." color="#1877F2" bg="#E7F3FF" />
        <div className="pro-big-stat-row">
          <div className="pro-big-stat"><p className="pro-big-stat-val">0</p><p className="pro-big-stat-lbl">Active subscribers</p></div>
          <div className="pro-big-stat"><p className="pro-big-stat-val">₹0</p><p className="pro-big-stat-lbl">Monthly earnings</p></div>
        </div>
      </section>
    );

    // ━━ ENGAGEMENT — COMMENTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'engagement-comments') return (
      <section className="pro-fb-card">
        <SectionHeader title="Comment Manager" sub="Review and reply to comments on your posts." />
        {totalComments === 0
          ? <EmptyState icon={<FiMessageSquare size={32} />} text="No comments yet. Post content to start getting feedback!" />
          : (
            <div>
              <div className="pro-big-stat-row" style={{ marginBottom: '16px' }}>
                <div className="pro-big-stat"><p className="pro-big-stat-val" style={{ color: '#7C3AED' }}>{totalComments}</p><p className="pro-big-stat-lbl">Total comments</p></div>
              </div>
              {myPosts.filter(p => (p.comments?.length || 0) > 0).slice(0, 5).map((post, i) => (
                <div key={i} className="pro-engage-row">
                  <div className="pro-engage-row-thumb">
                    {post.image ? <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} /> : <FiFileText size={16} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="pro-engage-row-text">{post.content || '(No text)'}</p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{post.comments?.length || 0} comments</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/`)}>View</button>
                </div>
              ))}
            </div>
          )}
      </section>
    );

    // ━━ ENGAGEMENT — MESSAGES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'engagement-messages') return (
      <section className="pro-fb-card">
        <SectionHeader title="Messages" sub="Connect with your audience through direct messages." />
        <InfoBanner icon={<FiMail size={20} />} title="Inbox" desc="View and reply to messages from your followers and fans in Messenger." color="#1877F2" bg="#E7F3FF" />
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <button className="pro-create-post-btn" style={{ display: 'inline-flex', width: 'auto', padding: '10px 24px' }} onClick={() => navigate('/messenger')}>
            <FiMessageSquare size={16} /> Open Messenger
          </button>
        </div>
      </section>
    );

    // ━━ ENGAGEMENT — MENTIONS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'engagement-mentions') return (
      <section className="pro-fb-card">
        <SectionHeader title="Mentions & Tags" sub="See when other people mention or tag you in posts." />
        {myNotifs.filter(n => n.type === 'mention' || n.type === 'tag').length === 0
          ? <EmptyState icon={<FiZap size={32} />} text="No mentions yet. When someone tags or mentions you, it will appear here." />
          : <div>{myNotifs.filter(n => n.type === 'mention' || n.type === 'tag').map((n, i) => (
              <div key={i} className="pro-engage-row">
                <p style={{ flex: 1, fontSize: '0.85rem' }}>{n.message}</p>
              </div>
            ))}</div>}
      </section>
    );

    // ━━ ALL TOOLS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (activeView === 'all-tools') return (
      <section className="pro-fb-card">
        <SectionHeader title="All Tools" sub="Everything you need to manage your professional presence." />
        <div className="pro-tools-grid">
          {[
            { icon: <FiBarChart2 size={22} />, label: 'Insights', desc: 'View your page analytics', color: '#1877F2', bg: '#E7F3FF', onClick: () => go('insights-overview', 'insights') },
            { icon: <FiEdit3 size={22} />,     label: 'Create Post', desc: 'Share something new', color: '#16A34A', bg: '#DCFCE7', onClick: () => navigate('/') },
            { icon: <FiBookOpen size={22} />,  label: 'Stories', desc: 'Add a story', color: '#EA580C', bg: '#FFEDD5', onClick: () => navigate('/') },
            { icon: <FiUsers size={22} />,     label: 'Followers', desc: 'Manage your audience', color: '#D97706', bg: '#FEF3C7', onClick: () => go('insights-followers', 'insights') },
            { icon: <FiMessageSquare size={22} />, label: 'Inbox', desc: 'Reply to messages', color: '#7C3AED', bg: '#F3E8FF', onClick: () => navigate('/messenger') },
            { icon: <FiStar size={22} />,      label: 'Stars', desc: 'Fan tipping tool', color: '#D97706', bg: '#FEF3C7', onClick: () => go('monetisation-stars', 'monetisation') },
            { icon: <FiDollarSign size={22} />, label: 'Monetisation', desc: 'Earn from your content', color: '#16A34A', bg: '#DCFCE7', onClick: () => go('monetisation-overview', 'monetisation') },
            { icon: <FiSettings size={22} />,  label: 'Settings', desc: 'Page & account settings', color: '#4F46E5', bg: '#E0E7FF', onClick: () => navigate('/settings') },
            { icon: <FiShield size={22} />,    label: 'Privacy', desc: 'Control your privacy', color: '#E11D48', bg: '#FFE4E6', onClick: () => navigate('/settings') },
            { icon: <FiCalendar size={22} />,  label: 'Scheduled', desc: 'Upcoming posts', color: '#0891B2', bg: '#E0F2FE', onClick: () => go('content-scheduled', 'content') },
            { icon: <FiVideo size={22} />,     label: 'Reels', desc: 'Short-form videos', color: '#7C3AED', bg: '#F3E8FF', onClick: () => go('content-reels', 'content') },
            { icon: <FiGlobe size={22} />,     label: 'Page Status', desc: 'Check page health', color: '#16A34A', bg: '#DCFCE7', onClick: () => {} },
          ].map((t, i) => (
            <div key={i} className="pro-tool-card" onClick={t.onClick}>
              <div className="pro-tool-card-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
              <p className="pro-tool-card-label">{t.label}</p>
              <p className="pro-tool-card-desc">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    );

    return null;
  };

  // ── Sidebar nav items config ───────────────────────────────────────────────
  const NAV = [
    { view: 'home', icon: <FiHome size={16} />, label: 'Home' },
  ];
  const NAV_GROUPS = [
    { key: 'insights', icon: <FiTrendingUp size={16} />, label: 'Insights', children: [
      { view: 'insights-overview', label: 'Overview' },
      { view: 'insights-reach',    label: 'Reach' },
      { view: 'insights-engagement', label: 'Engagement' },
      { view: 'insights-followers', label: 'Followers' },
      { view: 'insights-stories',  label: 'Stories' },
    ]},
    { key: 'content', icon: <FiFileText size={16} />, label: 'Content', children: [
      { view: 'content-posts',     label: 'Posts' },
      { view: 'content-stories',   label: 'Stories' },
      { view: 'content-reels',     label: 'Reels' },
      { view: 'content-scheduled', label: 'Scheduled' },
    ]},
    { key: 'monetisation', icon: <FiDollarSign size={16} />, label: 'Monetisation', children: [
      { view: 'monetisation-overview',      label: 'Overview' },
      { view: 'monetisation-stars',         label: 'Stars' },
      { view: 'monetisation-subscriptions', label: 'Subscriptions' },
    ]},
    { key: 'engagement', icon: <FiMessageSquare size={16} />, label: 'Engagement', children: [
      { view: 'engagement-comments',  label: 'Comments' },
      { view: 'engagement-messages',  label: 'Messages' },
      { view: 'engagement-mentions',  label: 'Mentions' },
    ]},
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <div className="pro-fb-layout">

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside className="pro-fb-sidebar">
          <div className="pro-fb-sidebar-title"><FiBarChart2 size={18} /> Professional dashboard</div>

          {NAV.map(item => (
            <button key={item.view} className={`pro-fb-nav-item ${activeView === item.view ? 'nav-active' : ''}`} onClick={() => setActiveView(item.view)}>
              {item.icon} {item.label}
            </button>
          ))}

          {NAV_GROUPS.map(group => (
            <div key={group.key}>
              <button className={`pro-fb-nav-group ${group.children.some(c => c.view === activeView) ? 'nav-group-active' : ''}`} onClick={() => setNavOpen(prev => ({ ...prev, [group.key]: !prev[group.key] }))}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{group.icon} {group.label}</span>
                {navOpen[group.key] ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
              </button>
              {navOpen[group.key] && (
                <div className="pro-fb-nav-children">
                  {group.children.map(c => (
                    <button key={c.view} className={`pro-fb-nav-child ${activeView === c.view ? 'child-active' : ''}`} onClick={() => setActiveView(c.view)}>
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button className={`pro-fb-nav-item ${activeView === 'all-tools' ? 'nav-active' : ''}`} onClick={() => setActiveView('all-tools')}>
            <FiGrid size={16} /> All tools
          </button>

          <div className="pro-fb-sidebar-footer">
            <button className="pro-create-post-btn" onClick={() => navigate('/')}>
              <FiPlusCircle size={15} /> Create a post
            </button>
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="pro-fb-main">
          {loading ? (
            <div className="pro-loading"><div className="upload-spinner" /><p>Loading dashboard...</p></div>
          ) : renderContent()}
        </main>

        {/* ═══ RIGHT PANEL ═══ */}
        <aside className="pro-fb-right">
          {/* Page Status */}
          <div className="pro-right-card">
            <h3 className="pro-right-title">Page status</h3>
            <div className="pro-page-status-row">
              {currentUser?.avatar
                ? <img src={currentUser.avatar} alt="" className="avatar avatar-md" />
                : <div className="avatar-placeholder avatar-md" style={{ fontSize: '0.85rem' }}>{currentUser?.fullName?.[0]}</div>}
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.87rem', margin: 0 }}>{currentUser?.fullName}</p>
                <p style={{ fontSize: '0.73rem', color: '#16A34A', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCheckCircle size={11} /> Page has no issues.
                </p>
              </div>
            </div>
          </div>

          {/* Page Tools */}
          <div className="pro-right-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="pro-right-title" style={{ margin: 0 }}>Your page tools</h3>
              <button className="icon-btn" onClick={() => {}}><FiChevronDown size={15} /></button>
            </div>
            {[
              { icon: <FiShield size={15} style={{ color: '#1877F2' }} />, label: 'Page access',           sub: 'Invite people to help manage and control who can access it.' },
              { icon: <FiLink2  size={15} style={{ color: '#7C3AED' }} />, label: 'Linked accounts',      sub: 'Engage with your community across platforms.' },
              { icon: <FiStar   size={15} style={{ color: '#D97706' }} />, label: 'Page recommendation', sub: 'Review your Page recommendation status.' },
              { icon: <FiSettings size={15} style={{ color: '#16A34A' }} />, label: 'Page setup',        sub: 'Set up your page for success.', onClick: () => navigate('/settings') },
              { icon: <FiAward  size={15} style={{ color: '#EA580C' }} />, label: 'Creator education',   sub: 'View resources and guidance to find success.' },
            ].map((tool, i) => (
              <div key={i} className="pro-tool-row" onClick={tool.onClick} style={{ cursor: tool.onClick ? 'pointer' : 'default' }}>
                <div className="pro-tool-icon">{tool.icon}</div>
                <div><p className="pro-tool-label">{tool.label}</p><p className="pro-tool-sub">{tool.sub}</p></div>
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
              <div className="pro-week-bar"><div className="pro-week-bar-fill" style={{ width: `${weekPct}%` }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                <span>{weekPct}% completed</span><span>5 days left</span>
              </div>
            </div>
            <div className="pro-goals-list">
              {weeklyGoals.map((g, i) => {
                const pct = Math.min(100, Math.round((g.done / g.total) * 100));
                return (
                  <div key={i} className="pro-goal-row">
                    <div className={`pro-goal-icon ${g.done >= g.total ? 'done' : ''}`}>{g.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p className="pro-goal-label">{g.label}</p>
                      <div className="pro-goal-bar"><div className="pro-goal-bar-fill" style={{ width: `${pct}%` }} /></div>
                    </div>
                    <FiChevronRight size={15} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>

          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Auto-refreshes every 30s
          </p>
        </aside>

      </div>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

const PeriodRow = ({ period, setPeriod, onRefresh, isRefreshing }) => (
  <div className="pro-period-row">
    {['7d', '28d', '90d'].map(p => (
      <button key={p} className={`pro-period-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
        {p === '7d' ? 'Last 7 days' : p === '28d' ? 'Last 28 days' : 'Last 90 days'}
      </button>
    ))}
    <button className="pro-refresh-btn" onClick={onRefresh} disabled={isRefreshing} title="Refresh now">
      <FiRefreshCw size={13} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
    </button>
  </div>
);

const ContentList = ({ posts, onCreatePost, showAll }) => {
  if (posts.length === 0) return (
    <div className="pro-empty-state">
      <FiFileText size={32} style={{ opacity: 0.3 }} />
      <p>No posts yet. Share something to see your content insights!</p>
      <button className="pro-create-post-btn" onClick={onCreatePost}>
        <FiPlusCircle size={14} /> Create a post
      </button>
    </div>
  );
  return (
    <div className="pro-content-list">
      {(showAll ? posts : posts.slice(0, 3)).map(post => {
        const pid     = post._id || post.id;
        const views   = (post.reactions?.length || 0) * 8 + (post.comments?.length || 0) * 4;
        const likes   = post.reactions?.length || 0;
        const comments = post.comments?.length || 0;
        return (
          <div key={pid} className="pro-content-row">
            <div className="pro-content-thumb">
              {post.image ? <img src={post.image} alt="" /> : <div className="pro-content-thumb-placeholder"><FiFileText size={18} /></div>}
            </div>
            <div className="pro-content-meta">
              <p className="pro-content-text">{post.content || '(No text)'}</p>
              <span className="pro-content-type">Post</span>
            </div>
            <div className="pro-content-stats">
              <div className="pro-content-stat"><FiEye size={12} /><span>{views.toLocaleString()}</span><span className="pro-stat-lbl">Views</span></div>
              <div className="pro-content-stat"><FiThumbsUp size={12} /><span>{likes}</span><span className="pro-stat-lbl">Reactions</span></div>
              <div className="pro-content-stat"><FiMessageSquare size={12} /><span>{comments}</span><span className="pro-stat-lbl">Comments</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StoriesList = ({ stories, showAll }) => (
  <div className="pro-content-list">
    {(showAll ? stories : stories.slice(0, 3)).map(s => {
      const sid  = s._id || s.id;
      const views = s.viewers?.length || 0;
      const ago = (() => {
        const diff = Date.now() - new Date(s.createdAt).getTime();
        const h = Math.floor(diff / 3600000), m = Math.floor(diff / 60000);
        return h >= 1 ? `${h}h ago` : `${m}m ago`;
      })();
      return (
        <div key={sid} className="pro-content-row">
          <div className="pro-content-thumb" style={{ height: '64px', width: '48px' }}>
            {s.mediaType === 'video'
              ? <video src={s.image} muted style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
              : <img src={s.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />}
          </div>
          <div className="pro-content-meta">
            <p className="pro-content-text">{s.text || '(Story)'}</p>
            <span className="pro-content-type">Story · {ago} · {s.musicLabel ? `🎵 ${s.musicLabel}` : (s.visibility === 'public' ? '🌍 Public' : '👥 Friends')}</span>
          </div>
          <div className="pro-content-stats">
            <div className="pro-content-stat"><FiEye size={12} /><span>{views}</span><span className="pro-stat-lbl">Views</span></div>
          </div>
        </div>
      );
    })}
  </div>
);

const EngagementGrid = ({ totalReactions, totalComments, totalShares, storyViews }) => (
  <div className="pro-engage-grid">
    {[
      { icon: <FiThumbsUp size={20} />, val: totalReactions, lbl: 'Total reactions', bg: '#E7F3FF', color: '#1877F2' },
      { icon: <FiMessageSquare size={20} />, val: totalComments, lbl: 'Comments',    bg: '#F3E8FF', color: '#7C3AED' },
      { icon: <FiShare2 size={20} />,  val: totalShares,     lbl: 'Shares',          bg: '#DCFCE7', color: '#16A34A' },
      { icon: <FiStar size={20} />,    val: storyViews,      lbl: 'Story views',     bg: '#FEF3C7', color: '#D97706' },
    ].map((c, i) => (
      <div key={i} className="pro-engage-card">
        <div className="pro-engage-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
        <p className="pro-engage-val">{c.val.toLocaleString()}</p>
        <p className="pro-engage-lbl">{c.lbl}</p>
      </div>
    ))}
  </div>
);

const EmptyState = ({ icon, text, action }) => (
  <div className="pro-empty-state">
    <div style={{ opacity: 0.3 }}>{icon}</div>
    <p>{text}</p>
    {action && (
      <button className="pro-create-post-btn" onClick={action.onClick} style={{ display: 'inline-flex', width: 'auto', padding: '10px 24px' }}>
        <FiPlusCircle size={14} /> {action.label}
      </button>
    )}
  </div>
);

export default ProfessionalDashboard;
