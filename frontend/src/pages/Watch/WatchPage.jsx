import { useState, useRef, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import CreateReelModal from '../../components/CreateReel/CreateReelModal';
import { useAuth } from '../../context/AuthContext';
import {
  FiTv, FiHeart, FiMessageSquare, FiShare2, FiMoreHorizontal,
  FiVolume2, FiVolumeX, FiChevronUp, FiChevronDown, FiUserPlus,
  FiSend, FiMusic, FiX, FiPlus
} from 'react-icons/fi';
import './WatchPage.css';

const DEFAULT_REELS = [
  {
    id: 'r1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-under-blue-sky-4523-large.mp4',
    creator: {
      name: 'Nature Travel',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    description: 'Beautiful yellow flower tree swaying under the blue sky. Nature is absolutely healing! 🌸🍃 #nature #beauty #travel',
    likes: '12.4K',
    commentsCount: 84,
    shares: '110',
    audio: 'Original Audio - Nature Travel',
    category: 'Travel',
    isHdr: true,
    is4k: true,
    emojiSticker: '🌸',
    comments: [
      { id: 'c1', user: 'Sadia Islam', avatar: 'https://i.pravatar.cc/150?img=25', text: 'This is absolutely gorgeous! 😍' },
      { id: 'c2', user: 'Rahim Uddin', avatar: 'https://i.pravatar.cc/150?img=12', text: 'Wow, where is this tree located?' }
    ]
  },
  {
    id: 'r2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-nightclub-43019-large.mp4',
    creator: {
      name: 'Zara Club Mix',
      avatar: 'https://i.pravatar.cc/150?img=26'
    },
    description: 'Chasing the neon lights tonight. Night club music vibes! ✨🌆 #nightlife #vibes #neon',
    likes: '45.1K',
    commentsCount: 245,
    shares: '312',
    audio: 'Neon Lights - Nightcore Mix',
    category: 'Music',
    isHdr: false,
    is4k: true,
    emojiSticker: '✨',
    comments: [
      { id: 'c3', user: 'Karim Ahmed', avatar: 'https://i.pravatar.cc/150?img=15', text: 'Stunning music and colors!' }
    ]
  },
  {
    id: 'r3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pouring-hot-coffee-into-a-cup-42289-large.mp4',
    creator: {
      name: 'Cafe Latte',
      avatar: 'https://i.pravatar.cc/150?img=15'
    },
    description: 'Starting the morning with a fresh pour of premium coffee. How do you take your brew? ☕️🌞 #coffee #morning #cafecito',
    likes: '8.9K',
    commentsCount: 38,
    shares: '12',
    audio: 'Morning Jazz Guitar - Cafe Latte',
    category: 'Comedy',
    isHdr: true,
    is4k: false,
    emojiSticker: '☕',
    comments: [
      { id: 'c4', user: 'Amar Biswas', avatar: 'https://i.pravatar.cc/150?img=11', text: 'Perfect start to the day!' }
    ]
  }
];

const WatchPage = () => {
  const { currentUser } = useAuth();
  const [reels, setReels] = useState(DEFAULT_REELS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  
  // Upload Reel Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const videoRef = useRef(null);

  const activeReel = reels[activeIndex] || DEFAULT_REELS[0];
  const isLiked = likedReels[activeReel.id] || false;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
    }
  }, [activeIndex, reels]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleLike = () => {
    setLikedReels(prev => ({
      ...prev,
      [activeReel.id]: !prev[activeReel.id]
    }));
  };

  const handleNext = () => {
    if (activeIndex < reels.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newComment = {
      id: `rc_${Date.now()}`,
      user: currentUser?.fullName || 'Anonymous',
      avatar: currentUser?.avatar || 'https://i.pravatar.cc/150?img=11',
      text: commentInput.trim()
    };
    
    setReels(prev => prev.map((r, idx) => {
      if (idx === activeIndex) {
        return {
          ...r,
          comments: [...(r.comments || []), newComment]
        };
      }
      return r;
    }));
    setCommentInput('');
  };

  const handleUploadReel = (newReelData) => {
    const fullReel = {
      ...newReelData,
      creator: {
        name: currentUser?.fullName || 'Anonymous User',
        avatar: currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'
      },
      likes: '0',
      commentsCount: 0,
      shares: '0',
      comments: []
    };
    setReels([fullReel, ...reels]);
    setActiveIndex(0);
    setShowCreateModal(false);
  };

  return (
    <div className="app-layout">
      <Navbar activePage="watch" />

      <div className="reels-layout">
        {/* Left Sidebar */}
        <aside className="reels-sidebar">
          <h2 className="reels-title"><FiTv /> Reels</h2>
          <nav className="reels-nav" style={{ marginBottom: '16px' }}>
            <button className="reels-nav-item active">For you</button>
            <button className="reels-nav-item">Profile</button>
            <button className="reels-nav-item">Following</button>
            <button className="reels-nav-item">Saved Reels</button>
          </nav>
          
          <button
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', fontWeight: 700 }}
            onClick={() => setShowCreateModal(true)}
            id="create-reel-sidebar-btn"
          >
            <FiPlus size={18} /> Create Reel
          </button>
        </aside>

        {/* Center Video Player */}
        <main className="reels-player-container">
          <div className="reels-viewport">
            <div className="reel-video-wrapper">
              <video
                ref={videoRef}
                className={`reel-video ${activeReel.isHdr ? 'hdr-effect' : ''}`}
                src={activeReel.videoUrl}
                loop
                autoPlay
                muted={isMuted}
                playsInline
                onClick={toggleMute}
              />

              {/* 4K UHD Badge overlay */}
              {activeReel.is4k && (
                <span className="badge-4k-uhd">4K UHD</span>
              )}

              {/* Emoji Sticker overlay */}
              {activeReel.emojiSticker && (
                <div className="reel-emoji-sticker animate-pulse">
                  {activeReel.emojiSticker}
                </div>
              )}

              {/* Category Badge */}
              {activeReel.category && (
                <span className="badge-reel-category">{activeReel.category}</span>
              )}

              {/* Mute Overlay Button */}
              <button className="reel-mute-btn" onClick={toggleMute}>
                {isMuted ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
              </button>

              {/* Video Details Bottom Overlay */}
              <div className="reel-overlay-bottom">
                <div className="reel-creator-row">
                  <img src={activeReel.creator.avatar} alt="" className="avatar avatar-sm" style={{ border: '2px solid white' }} />
                  <span className="reel-creator-name">{activeReel.creator.name}</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>·</span>
                  <button className="reel-follow-btn"><FiUserPlus size={12} style={{ marginRight: '4px' }} /> Follow</button>
                </div>
                <p className="reel-description">{activeReel.description}</p>
                <div className="reel-music">
                  <FiMusic size={14} />
                  <span>{activeReel.audio}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar (floating beside viewport) */}
            <div className="reels-actions-bar">
              <div className="reel-action-item">
                <button
                  className={`reel-action-circle ${isLiked ? 'active' : ''}`}
                  onClick={handleLike}
                  id={`reel-like-${activeReel.id}`}
                >
                  <FiHeart size={20} fill={isLiked ? 'white' : 'transparent'} />
                </button>
                <span className="reel-action-count">{isLiked ? 'Liked' : activeReel.likes}</span>
              </div>

              <div className="reel-action-item">
                <button
                  className="reel-action-circle"
                  onClick={() => setShowComments(!showComments)}
                  id={`reel-comment-${activeReel.id}`}
                >
                  <FiMessageSquare size={20} />
                </button>
                <span className="reel-action-count">{(activeReel.comments || []).length}</span>
              </div>

              <div className="reel-action-item">
                <button className="reel-action-circle">
                  <FiShare2 size={20} />
                </button>
                <span className="reel-action-count">{activeReel.shares}</span>
              </div>

              <div className="reel-action-item">
                <button className="reel-action-circle">
                  <FiMoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Up/Down Navigation Arrows */}
          <div className="reels-navigation">
            <button
              className="reel-nav-arrow"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              id="reel-prev-btn"
            >
              <FiChevronUp size={22} />
            </button>
            <button
              className="reel-nav-arrow"
              onClick={handleNext}
              disabled={activeIndex === reels.length - 1}
              id="reel-next-btn"
            >
              <FiChevronDown size={22} />
            </button>
          </div>

          {/* Slide-in Comments Drawer */}
          {showComments && (
            <div className="reels-comments-drawer animate-slideLeft">
              <div className="comments-drawer-header">
                <h3 style={{ fontWeight: 700, margin: 0 }}>Comments</h3>
                <button className="icon-btn" onClick={() => setShowComments(false)}><FiX size={18} /></button>
              </div>

              <div className="comments-drawer-list">
                {(!activeReel.comments || activeReel.comments.length === 0) ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0' }}>No comments yet.</p>
                ) : (
                  activeReel.comments.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <img src={c.avatar} alt="" className="avatar avatar-sm" />
                      <div style={{ background: 'var(--bg-hover)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 2px 0' }}>{c.user}</p>
                        <p style={{ fontSize: '0.87rem', margin: 0, color: 'var(--text-primary)' }}>{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendComment} className="comments-drawer-input-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  id="reel-comment-input"
                  style={{ borderRadius: '20px', padding: '8px 14px' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px', borderRadius: '50%' }} disabled={!commentInput.trim()}>
                  <FiSend size={14} />
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Render the Facebook-style Create Reel Wizard */}
      <CreateReelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUpload={handleUploadReel}
      />
    </div>
  );
};

export default WatchPage;
