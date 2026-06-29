import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, storiesAPI } from '../../services/api';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiMusic, FiEye, FiImage, FiType, FiGlobe, FiUsers, FiLock, FiTrash2 } from 'react-icons/fi';
import './Stories.css';

const MUSIC_TRACKS = [
  { id: 'none', label: '🤫 No Music', url: '' },
  { id: 'lofi', label: '🎧 Lofi Chill Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'dance', label: '💃 Pop Dance Loop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'acoustic', label: '🎸 Chill Acoustic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'piano', label: '🎹 Classical Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
];

const VISIBILITY_OPTIONS = [
  { value: 'friends', label: 'Friends', icon: FiUsers, desc: 'Your friends can see this' },
  { value: 'public', label: 'Public', icon: FiGlobe, desc: 'Anyone on Friendix can see this' },
  { value: 'only_me', label: 'Only Me', icon: FiLock, desc: 'Only you can see this' }
];

const normalizeStory = (s, currentUser) => ({
  id: s._id || s.id,
  authorId: (s.authorId?._id || s.authorId)?.toString(),
  authorName: s.authorId?.fullName || s.authorName || '',
  authorAvatar: s.authorId?.avatar || s.authorAvatar || '',
  image: s.image,
  text: s.text || '',
  filter: s.filter || 'none',
  musicUrl: s.musicUrl || '',
  musicLabel: s.musicLabel || '',
  bgColor: s.bgColor || '',
  visibility: s.visibility || 'friends',
  viewers: s.viewers || [],
  createdAt: s.createdAt,
});

const Stories = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [stories, setStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null); // index in stories array
  const [progress, setProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewerList, setShowViewerList] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyFilePreview, setStoryFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [storyForm, setStoryForm] = useState({
    text: '',
    filter: 'none',
    musicTrackId: 'none',
    bgColor: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)',
    visibility: 'friends'
  });

  const progressRef = useRef(null);
  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch stories from backend
  const fetchStories = useCallback(async (silent = false) => {
    try {
      if (!silent) setStoriesLoading(true);
      const res = await storiesAPI.getAll();
      if (res && res.stories) {
        const normalized = res.stories.map(s => normalizeStory(s, currentUser));
        setStories(normalized);
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    } finally {
      if (!silent) setStoriesLoading(false);
    }
  }, [currentUser]);

  // Initial fetch + real-time polling every 15 seconds
  useEffect(() => {
    fetchStories(false);
    pollingRef.current = setInterval(() => fetchStories(true), 15000);
    return () => {
      clearInterval(pollingRef.current);
      clearInterval(progressRef.current);
    };
  }, [fetchStories]);

  // Open story from profile ring navigation
  useEffect(() => {
    if (location.state?.openStoryForUser && stories.length > 0) {
      const targetUserId = location.state.openStoryForUser;
      const idx = stories.findIndex(s => s.authorId === targetUserId.toString());
      if (idx !== -1) openStoryAt(idx);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, stories]);

  const openStoryAt = (index) => {
    if (index < 0 || index >= stories.length) return;
    setActiveStoryIndex(index);
    setProgress(0);
    setShowViewerList(false);

    // Mark as viewed (async, don't block UI)
    const story = stories[index];
    if (story && story.authorId !== currentUser?.id) {
      storiesAPI.viewStory(story.id).catch(() => {});
    }

    clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressRef.current);
          // Go to next story
          setActiveStoryIndex(prev => {
            if (prev !== null && prev < stories.length - 1) {
              openStoryAt(prev + 1);
              return prev + 1;
            } else {
              setProgress(0);
              return null; // close
            }
          });
          return 0;
        }
        return p + 1;
      });
    }, 80); // 8 seconds total (80ms * 100)
  };

  const closeStory = () => {
    setActiveStoryIndex(null);
    setProgress(0);
    clearInterval(progressRef.current);
  };

  const goNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      openStoryAt(activeStoryIndex + 1);
    } else {
      closeStory();
    }
  };

  const goPrevStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      openStoryAt(activeStoryIndex - 1);
    }
  };

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStoryFile(file);
      setStoryFilePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!storyFile || uploading) return;

    try {
      setUploading(true);
      const uploadRes = await postsAPI.uploadFile(storyFile);
      const imageUrl = uploadRes.url;

      const selectedMusic = MUSIC_TRACKS.find(t => t.id === storyForm.musicTrackId);
      const storyPayload = {
        image: imageUrl,
        text: storyForm.text,
        filter: storyForm.filter,
        musicUrl: selectedMusic?.url || '',
        musicLabel: selectedMusic?.id !== 'none' ? selectedMusic?.label : '',
        bgColor: storyForm.bgColor,
        visibility: storyForm.visibility,
      };

      const res = await storiesAPI.create(storyPayload);
      if (res && res.story) {
        const newStory = normalizeStory(res.story, currentUser);
        setStories(prev => [newStory, ...prev]);
      }
      setShowCreateModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert('Failed to upload story. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Delete this story?')) return;
    try {
      await storiesAPI.deleteStory(storyId);
      setStories(prev => prev.filter(s => s.id !== storyId));
      closeStory();
    } catch (err) {
      alert('Failed to delete story.');
    }
  };

  const resetForm = () => {
    setStoryFile(null);
    setStoryFilePreview(null);
    setStoryForm({ text: '', filter: 'none', musicTrackId: 'none', bgColor: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)', visibility: 'friends' });
  };

  const handleAddEmojiReaction = (emoji) => {
    const newEmoji = { id: `fe_${Date.now()}_${Math.random()}`, symbol: emoji, left: Math.random() * 80 + 10 };
    setFloatingEmojis(prev => [...prev, newEmoji]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(fe => fe.id !== newEmoji.id)), 2000);
  };

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const getVisibilityIcon = (v) => {
    if (v === 'public') return <FiGlobe size={10} />;
    if (v === 'only_me') return <FiLock size={10} />;
    return <FiUsers size={10} />;
  };

  return (
    <>
      <div className="stories-container card">
        <button className="stories-scroll-btn left" onClick={() => scroll('left')} aria-label="Scroll left">
          <FiChevronLeft size={18} />
        </button>

        <div className="stories-scroll" ref={scrollRef}>
          {/* Create Story Card */}
          <div className="story-card story-create-card" onClick={() => setShowCreateModal(true)} id="create-story-card-btn">
            <div className="story-create-bg">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser?.fullName} className="story-create-photo" />
              ) : (
                <div className="story-create-placeholder" />
              )}
            </div>
            <div className="story-create-bottom">
              <div className="story-create-btn"><FiPlus size={18} /></div>
              <p className="story-create-label">Create Story</p>
            </div>
          </div>

          {/* Story Cards */}
          {storiesLoading && stories.length === 0 ? (
            [1, 2, 3].map(i => (
              <div key={i} className="story-card" style={{ background: 'var(--bg-hover)', opacity: 0.5 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: 'inherit' }} />
              </div>
            ))
          ) : (
            stories.map((story, index) => {
              const isMe = story.authorId === currentUser?.id?.toString();
              const authorName = story.authorName || (isMe ? currentUser?.fullName : 'User');
              const authorAvatar = isMe ? (currentUser?.avatar || story.authorAvatar) : story.authorAvatar;
              const firstName = (authorName || '').split(' ')[0] || 'User';
              return (
                <div
                  key={story.id}
                  className="story-card"
                  onClick={() => openStoryAt(index)}
                  role="button"
                  tabIndex={0}
                  id={`story-card-${story.id}`}
                  onKeyDown={e => e.key === 'Enter' && openStoryAt(index)}
                >
                  <img
                    src={story.image}
                    alt={authorName}
                    className={`story-bg-img filter-${story.filter || 'none'}`}
                    onError={e => { e.target.src = authorAvatar || 'https://i.pravatar.cc/300'; }}
                  />
                  <div className="story-gradient" />
                  <div className="story-avatar-ring">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} className="story-avatar" />
                    ) : (
                      <div className="avatar-placeholder story-avatar" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'white', background: 'var(--primary)' }}>
                        {firstName[0]}
                      </div>
                    )}
                  </div>
                  <p className="story-name">{firstName}</p>
                  {isMe && (
                    <div className="story-visibility-badge" title={story.visibility}>
                      {getVisibilityIcon(story.visibility)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button className="stories-scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll right">
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="story-modal-overlay" onClick={closeStory}>
          <div className="story-viewer" onClick={e => e.stopPropagation()}>
            {activeStory.musicUrl && <audio ref={audioRef} src={activeStory.musicUrl} autoPlay loop />}

            {floatingEmojis.map(fe => (
              <span key={fe.id} className="floating-emoji-reaction" style={{ left: `${fe.left}%` }}>{fe.symbol}</span>
            ))}

            {/* Progress Bar */}
            <div className="story-progress-bar">
              <div className="story-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Header */}
            <div className="story-viewer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeStory.authorAvatar ? (
                  <img src={activeStory.authorAvatar} alt="" className="avatar avatar-md" style={{ border: '2px solid white' }} />
                ) : (
                  <div className="avatar-placeholder avatar-md" style={{ border: '2px solid white', fontSize: '0.9rem' }}>
                    {activeStory.authorName?.[0]}
                  </div>
                )}
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.93rem', margin: 0 }}>{activeStory.authorName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', margin: '2px 0 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getVisibilityIcon(activeStory.visibility)}
                    {activeStory.visibility === 'public' ? 'Public' : activeStory.visibility === 'only_me' ? 'Only me' : 'Friends'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {activeStory.authorId === currentUser?.id?.toString() && (
                  <button
                    className="story-close-btn"
                    onClick={() => handleDeleteStory(activeStory.id)}
                    title="Delete story"
                    style={{ background: 'rgba(255,0,0,0.2)' }}
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
                <button className="story-close-btn" onClick={closeStory}><FiX size={20} /></button>
              </div>
            </div>

            {/* Prev/Next navigation */}
            {activeStoryIndex > 0 && (
              <button
                onClick={goPrevStory}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}
              >
                <FiChevronLeft size={22} />
              </button>
            )}
            {activeStoryIndex < stories.length - 1 && (
              <button
                onClick={goNextStory}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 10 }}
              >
                <FiChevronRight size={22} />
              </button>
            )}

            <img
              src={activeStory.image}
              alt="Story"
              className={`story-viewer-img filter-${activeStory.filter || 'none'}`}
              onError={e => { e.target.src = 'https://i.pravatar.cc/600'; }}
            />

            {activeStory.text && (
              <div className="story-text-overlay" style={{ background: activeStory.bgColor || 'rgba(0,0,0,0.4)' }}>
                <p>{activeStory.text}</p>
              </div>
            )}

            {activeStory.musicLabel && (
              <div className="story-music-badge">
                <FiMusic size={12} />
                <span>{activeStory.musicLabel}</span>
              </div>
            )}

            {/* Seen By (only for my own stories) */}
            {activeStory.authorId === currentUser?.id?.toString() && (
              <div className="story-seen-by-wrap">
                <button className="story-seen-by-btn" onClick={() => setShowViewerList(!showViewerList)} id="story-seen-by-toggle">
                  <FiEye size={14} /> Seen by {(activeStory.viewers || []).length} people
                </button>
                {showViewerList && (
                  <div className="story-viewers-dropdown card animate-scaleIn">
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>Viewers</p>
                    {(activeStory.viewers || []).length === 0 && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No views yet</p>
                    )}
                    {(activeStory.viewers || []).map((v, i) => {
                      const name = v?.fullName || v?.toString() || 'User';
                      return (
                        <div key={i} className="story-viewer-row">
                          {v?.avatar ? (
                            <img src={v.avatar} alt="" className="avatar" style={{ width: '24px', height: '24px' }} />
                          ) : (
                            <div className="avatar-placeholder avatar-xs" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>{name[0]}</div>
                          )}
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Emoji Reactions (for others' stories) */}
            {activeStory.authorId !== currentUser?.id?.toString() && (
              <div className="story-reactions-bar">
                {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                  <button key={emoji} className="story-reaction-btn" onClick={() => handleAddEmojiReaction(emoji)} id={`story-emoji-${emoji}`}>
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="story-modal-overlay" onClick={() => { setShowCreateModal(false); resetForm(); }}>
          <div className="card story-creator-modal" onClick={e => e.stopPropagation()}>
            {!storyFilePreview ? (
              /* Step 1: Pick file */
              <div className="story-uploader-start-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Create Story</h3>
                  <button className="icon-btn" onClick={() => { setShowCreateModal(false); resetForm(); }}><FiX size={18} /></button>
                </div>
                <label className="story-upload-dropzone">
                  <FiImage size={48} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Create a Photo Story</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Select a photo from your computer or phone</span>
                  <input id="story-image-file-start" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            ) : (
              /* Step 2: Customize & share */
              <div className="story-creator-split-layout">
                {/* Left Panel */}
                <aside className="story-creator-left-sidebar">
                  <div className="story-creator-sidebar-header">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Your Story</h3>
                    <button className="icon-btn" onClick={() => { setShowCreateModal(false); resetForm(); }}><FiX size={18} /></button>
                  </div>

                  <div className="story-creator-user-row">
                    <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="" className="avatar avatar-md" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentUser?.fullName}</span>
                  </div>

                  <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {/* Text Overlay */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiType size={16} /> Add Text Overlay
                      </label>
                      <textarea
                        id="story-text-input-split"
                        className="form-input"
                        value={storyForm.text}
                        onChange={e => setStoryForm({ ...storyForm, text: e.target.value })}
                        placeholder="Start typing..."
                        style={{ minHeight: '60px', resize: 'vertical' }}
                      />
                    </div>

                    {/* Visual Filter */}
                    <div className="form-group">
                      <label className="form-label">Visual Filter Effect</label>
                      <select id="story-filter-select-split" className="form-input" value={storyForm.filter} onChange={e => setStoryForm({ ...storyForm, filter: e.target.value })}>
                        <option value="none">None</option>
                        <option value="grayscale">Grayscale</option>
                        <option value="sepia">Sepia (Retro)</option>
                        <option value="vibrant">Vibrant Colors</option>
                        <option value="blur">Dreamy Blur</option>
                      </select>
                    </div>

                    {/* Music */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiMusic size={16} /> Add Music
                      </label>
                      <select id="story-music-select-split" className="form-input" value={storyForm.musicTrackId} onChange={e => setStoryForm({ ...storyForm, musicTrackId: e.target.value })}>
                        {MUSIC_TRACKS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                      </select>
                    </div>

                    {/* Text Background */}
                    <div className="form-group">
                      <label className="form-label">Text Banner Background</label>
                      <select id="story-bg-select-split" className="form-input" value={storyForm.bgColor} onChange={e => setStoryForm({ ...storyForm, bgColor: e.target.value })}>
                        <option value="linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)">Blue Dream</option>
                        <option value="linear-gradient(135deg, #F33E58 0%, #FF6B8B 100%)">Sweet Pink</option>
                        <option value="linear-gradient(135deg, #F7B125 0%, #F58529 100%)">Sunset Orange</option>
                        <option value="rgba(0,0,0,0.65)">Translucent Black</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>

                    {/* === VISIBILITY (Facebook-style) === */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                        Who can see your story?
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {VISIBILITY_OPTIONS.map(opt => {
                          const Icon = opt.icon;
                          const isSelected = storyForm.visibility === opt.value;
                          return (
                            <label
                              key={opt.value}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-light)'}`,
                                borderRadius: '10px', cursor: 'pointer',
                                background: isSelected ? 'var(--primary-faint, rgba(24,119,242,0.08))' : 'transparent',
                                transition: 'all 0.15s'
                              }}
                            >
                              <input type="radio" name="visibility" value={opt.value} checked={isSelected} onChange={() => setStoryForm({ ...storyForm, visibility: opt.value })} style={{ display: 'none' }} />
                              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isSelected ? 'var(--primary)' : 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : 'var(--text-secondary)', flexShrink: 0 }}>
                                <Icon size={18} />
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>{opt.label}</p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={resetForm} disabled={uploading}>Discard</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} id="submit-story-btn" disabled={uploading}>
                        {uploading ? 'Sharing...' : 'Share to Story'}
                      </button>
                    </div>
                  </form>
                </aside>

                {/* Right Preview */}
                <main className="story-creator-preview-pane">
                  <span className="story-preview-label">Preview</span>
                  <div className="story-creator-preview-viewport">
                    <div className="story-creator-preview-frame">
                      <img src={storyFilePreview} alt="Story Preview" className={`story-viewer-img filter-${storyForm.filter}`} />
                      <div className="story-viewer-header" style={{ pointerEvents: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="" className="avatar avatar-sm" style={{ border: '2px solid white' }} />
                          <div>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem', display: 'block' }}>{currentUser?.fullName}</span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {storyForm.visibility === 'public' ? <><FiGlobe size={9} /> Public</> : storyForm.visibility === 'only_me' ? <><FiLock size={9} /> Only me</> : <><FiUsers size={9} /> Friends</>}
                            </span>
                          </div>
                        </div>
                      </div>
                      {storyForm.text && (
                        <div className="story-text-overlay" style={{ background: storyForm.bgColor, bottom: '60px' }}>
                          <p style={{ margin: 0 }}>{storyForm.text}</p>
                        </div>
                      )}
                      {storyForm.musicTrackId !== 'none' && (
                        <div className="story-music-badge" style={{ top: '64px' }}>
                          <FiMusic size={12} />
                          <span>{MUSIC_TRACKS.find(t => t.id === storyForm.musicTrackId)?.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </main>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
