import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import CreateReelModal from '../../components/CreateReel/CreateReelModal';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import {
  FiTv, FiHeart, FiMessageSquare, FiShare2, FiMoreHorizontal,
  FiVolume2, FiVolumeX, FiChevronUp, FiChevronDown, FiUserPlus,
  FiSend, FiMusic, FiX, FiPlus
} from 'react-icons/fi';
import './WatchPage.css';

const WatchPage = () => {
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  
  // Upload Reel Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);

  const videoRef = useRef(null);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const data = await postsAPI.getAll();
      const allPosts = data.posts || [];
      // Filter out posts that contain video links
      const videoPosts = allPosts.filter(p => p.image && p.image.match(/\.(mp4|mov|avi|mkv|webm|3gp)/i));
      
      const mappedReels = videoPosts.map(p => ({
        id: p._id || p.id,
        videoUrl: p.image,
        creator: {
          name: p.authorId?.fullName || 'Friendix User',
          avatar: p.authorId?.avatar
        },
        description: p.content,
        likes: p.likes || [],
        comments: p.comments || []
      }));

      setReels(mappedReels);
      
      const targetId = searchParams.get('id');
      if (targetId) {
        const foundIdx = mappedReels.findIndex(r => r.id === targetId);
        if (foundIdx !== -1) {
          setActiveIndex(foundIdx);
          return;
        }
      }
      setActiveIndex(0);
    } catch (err) {
      console.error('Failed to fetch video reels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const activeReel = reels[activeIndex];
  const isLiked = activeReel && activeReel.likes.includes(currentUser?.id);

  useEffect(() => {
    if (videoRef.current && activeReel) {
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

  const handleLike = async () => {
    if (!activeReel) return;
    try {
      await postsAPI.reactPost(activeReel.id, 'like');
      // Update locally
      setReels(prev => prev.map((r, idx) => {
        if (idx === activeIndex) {
          const alreadyLiked = r.likes.includes(currentUser?.id);
          const updatedLikes = alreadyLiked 
            ? r.likes.filter(id => id !== currentUser?.id)
            : [...r.likes, currentUser?.id];
          return { ...r, likes: updatedLikes };
        }
        return r;
      }));
    } catch (err) {
      console.error(err);
    }
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

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !activeReel) return;

    try {
      const data = await postsAPI.commentPost(activeReel.id, commentInput.trim());
      setReels(prev => prev.map((r, idx) => {
        if (idx === activeIndex) {
          return {
            ...r,
            comments: data.post.comments || []
          };
        }
        return r;
      }));
      setCommentInput('');
    } catch (err) {
      console.error(err);
    }
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
            <button className="reels-nav-item" onClick={fetchReels}>Refresh</button>
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
          {loading ? (
            <div style={{ color: 'white', textAlign: 'center', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              Loading reels...
            </div>
          ) : reels.length === 0 ? (
            <div style={{ color: 'white', textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📽️</span>
              <h3 style={{ marginTop: '16px' }}>No Reels available</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', marginTop: '4px' }}>Be the first to upload a video reel!</p>
            </div>
          ) : (
            <div className="reels-viewport">
              <div className="reel-video-wrapper">
                <video
                  ref={videoRef}
                  className="reel-video"
                  src={activeReel.videoUrl}
                  loop
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onClick={toggleMute}
                />

                <span className="badge-4k-uhd">UHD</span>

                {/* Right controls sidepanel */}
                <div className="reel-right-controls">
                  <button className="reel-ctrl-btn" onClick={handleLike} id="like-reel-btn">
                    <span className="ctrl-icon" style={{ background: isLiked ? 'var(--primary)' : 'rgba(0,0,0,0.6)' }}><FiHeart size={20} color={isLiked ? 'white' : '#ffffff'} /></span>
                    <span className="ctrl-label">{activeReel.likes.length}</span>
                  </button>
                  <button className="reel-ctrl-btn" onClick={() => setShowComments(!showComments)} id="comments-reel-btn">
                    <span className="ctrl-icon"><FiMessageSquare size={20} /></span>
                    <span className="ctrl-label">{activeReel.comments.length}</span>
                  </button>
                  <button className="reel-ctrl-btn" title="Mute/Unmute" onClick={toggleMute}>
                    <span className="ctrl-icon">{isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}</span>
                  </button>
                </div>

                {/* Bottom details Overlay */}
                <div className="reel-bottom-overlay">
                  <div className="reel-creator-row">
                    {activeReel.creator.avatar ? (
                      <img src={activeReel.creator.avatar} alt="" className="avatar avatar-sm" style={{ border: '2px solid white' }} />
                    ) : (
                      <div className="avatar-placeholder avatar-sm" style={{ border: '2px solid white' }}>
                        {activeReel.creator.name?.[0]}
                      </div>
                    )}
                    <span className="reel-creator-name">{activeReel.creator.name}</span>
                    <button className="btn btn-primary btn-xs" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><FiPlus /> Follow</button>
                  </div>
                  <p className="reel-description">{activeReel.description}</p>
                </div>

                {/* Navigation helpers */}
                <div className="reel-nav-arrows">
                  <button className="reel-arrow-btn" onClick={handlePrev} disabled={activeIndex === 0}><FiChevronUp size={24} /></button>
                  <button className="reel-arrow-btn" onClick={handleNext} disabled={activeIndex === reels.length - 1}><FiChevronDown size={24} /></button>
                </div>
              </div>

              {/* Comments sidebar */}
              {showComments && (
                <div className="reel-comments-sidebar animate-fadeIn">
                  <div className="comments-sidebar-header">
                    <h3 style={{ margin: 0, fontWeight: 800 }}>Comments</h3>
                    <button className="icon-btn" onClick={() => setShowComments(false)}><FiX size={18} /></button>
                  </div>

                  <div className="comments-sidebar-list">
                    {activeReel.comments.map(c => {
                      const cAuthor = c.authorId || {};
                      const cId = c._id || c.id;
                      return (
                        <div key={cId} className="comment-item">
                          {cAuthor.avatar ? (
                            <img src={cAuthor.avatar} alt="" className="avatar avatar-sm" />
                          ) : (
                            <div className="avatar-placeholder avatar-sm">
                              {cAuthor.fullName?.[0]}
                            </div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div className="comment-bubble">
                              <p className="comment-author">{cAuthor.fullName || 'User'}</p>
                              <p className="comment-text">{c.content}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {activeReel.comments.length === 0 && (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '20px' }}>No comments yet.</p>
                    )}
                  </div>

                  <form onSubmit={handleSendComment} className="comments-sidebar-input">
                    <input
                      type="text"
                      placeholder="Add comment..."
                      value={commentInput}
                      onChange={e => setCommentInput(e.target.value)}
                      id="reel-comment-input"
                    />
                    <button type="submit" className="icon-btn" disabled={!commentInput.trim()}><FiSend size={16} /></button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <CreateReelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onUpload={fetchReels}
      />
    </div>
  );
};

export default WatchPage;
