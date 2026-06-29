import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { postsAPI } from '../../services/api';
import { FiPlus, FiX, FiChevronLeft, FiChevronRight, FiMusic, FiEye, FiImage, FiType } from 'react-icons/fi';
import './Stories.css';

const DEFAULT_STORY_BG = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80';

const MUSIC_TRACKS = [
  { id: 'none', label: '🤫 No Music', url: '' },
  { id: 'lofi', label: '🎧 Lofi Chill Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'dance', label: '💃 Pop Dance Loop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'acoustic', label: '🎸 Chill Acoustic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'piano', label: '🎹 Classical Piano', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
];

const Stories = () => {
  const { currentUser } = useAuth();
  const [localStories, setLocalStories] = useState(() => {
    const saved = localStorage.getItem('friendix_local_stories');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeStory, setActiveStory] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewerList, setShowViewerList] = useState(false);
  const [storyFile, setStoryFile] = useState(null);

  useEffect(() => {
    localStorage.setItem('friendix_local_stories', JSON.stringify(localStories));
  }, [localStories]);

  // Floating emojis state
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Create Story Form State
  const [storyFilePreview, setStoryFilePreview] = useState(null);
  const [storyForm, setStoryForm] = useState({
    text: '',
    filter: 'none', // 'none', 'grayscale', 'sepia', 'vibrant', 'blur'
    musicTrackId: 'none',
    bgColor: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)'
  });

  const progressRef = useRef(null);
  const scrollRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => progressRef.current && clearInterval(progressRef.current);
  }, []);

  const openStory = (story) => {
    setActiveStory(story);
    setProgress(0);
    setShowViewerList(false);
    
    progressRef.current && clearInterval(progressRef.current);
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(progressRef.current);
          setActiveStory(null);
          return 0;
        }
        return p + 1;
      });
    }, 80);
  };

  const closeStory = () => {
    setActiveStory(null);
    setProgress(0);
    clearInterval(progressRef.current);
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
      const url = URL.createObjectURL(file);
      setStoryFilePreview(url);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!storyFile) return;

    try {
      // Upload file to Telegram/Cloudinary
      const uploadRes = await postsAPI.uploadFile(storyFile);
      const imageUrl = uploadRes.url;

      const selectedMusic = MUSIC_TRACKS.find(t => t.id === storyForm.musicTrackId);

      const newStory = {
        id: `s_${Date.now()}`,
        authorId: currentUser?.id,
        authorName: currentUser?.fullName,
        authorAvatar: currentUser?.avatar,
        image: imageUrl,
        text: storyForm.text,
        filter: storyForm.filter,
        musicUrl: selectedMusic?.url || '',
        musicLabel: selectedMusic?.id !== 'none' ? selectedMusic?.label : '',
        bgColor: storyForm.bgColor,
        viewers: [],
        createdAt: new Date().toISOString()
      };

      setLocalStories([newStory, ...localStories]);
      setShowCreateModal(false);
      
      // Reset form
      setStoryFile(null);
      setStoryFilePreview(null);
      setStoryForm({
        text: '',
        filter: 'none',
        musicTrackId: 'none',
        bgColor: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)'
      });
    } catch (err) {
      console.error(err);
      alert('Failed to upload story photo.');
    }
  };

  const handleAddEmojiReaction = (emoji) => {
    const newEmoji = {
      id: `fe_${Date.now()}_${Math.random()}`,
      symbol: emoji,
      left: Math.random() * 80 + 10
    };
    setFloatingEmojis(prev => [...prev, newEmoji]);

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(fe => fe.id !== newEmoji.id));
    }, 2000);
  };

  const handleDiscard = () => {
    setStoryFilePreview(null);
    setStoryForm({
      text: '',
      filter: 'none',
      musicTrackId: 'none',
      bgColor: 'linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)'
    });
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
              <div className="story-create-btn">
                <FiPlus size={18} />
              </div>
              <p className="story-create-label">Create Story</p>
            </div>
          </div>

          {/* Story Cards */}
          {localStories.map(story => {
            const isMe = story.authorId === currentUser?.id;
            const authorName = story.authorName || (isMe ? currentUser?.fullName : 'User');
            const authorAvatar = story.authorAvatar || (isMe ? currentUser?.avatar : '');
            const authorFirstName = authorName.split(' ')[0];
            return (
              <div
                key={story.id}
                className="story-card"
                onClick={() => openStory(story)}
                role="button"
                tabIndex={0}
                id={`story-card-${story.id}`}
              >
                <img
                  src={story.image || authorAvatar}
                  alt={authorName}
                  className={`story-bg-img filter-${story.filter || 'none'}`}
                />
                <div className="story-gradient" />
                <div className="story-avatar-ring">
                  {authorAvatar ? (
                    <img src={authorAvatar} alt={authorName} className="story-avatar" />
                  ) : (
                    <div className="avatar-placeholder story-avatar" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'white', background: 'var(--primary)' }}>
                      {authorFirstName[0]}
                    </div>
                  )}
                </div>
                <p className="story-name">{authorFirstName}</p>
              </div>
            );
          })}
        </div>

        <button className="stories-scroll-btn right" onClick={() => scroll('right')} aria-label="Scroll right">
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="story-modal-overlay" onClick={closeStory}>
          <div className="story-viewer" onClick={e => e.stopPropagation()}>
            {activeStory.musicUrl && (
              <audio
                ref={audioRef}
                src={activeStory.musicUrl}
                autoPlay
                loop
              />
            )}

            {floatingEmojis.map(fe => (
              <span
                key={fe.id}
                className="floating-emoji-reaction"
                style={{ left: `${fe.left}%` }}
              >
                {fe.symbol}
              </span>
            ))}

            <div className="story-progress-bar">
              <div className="story-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="story-viewer-header">
              {(() => {
                const author = mockUsers.find(u => u.id === activeStory.authorId);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={author?.avatar} alt={author?.fullName} className="avatar avatar-md" style={{ border: '2px solid white' }} />
                    <div>
                      <p style={{ color: 'white', fontWeight: 700, fontSize: '0.93rem', margin: 0 }}>{author?.fullName}</p>
                      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', margin: '2px 0 0 0' }}>Just now</p>
                    </div>
                  </div>
                );
              })()}
              <button className="story-close-btn" onClick={closeStory}>
                <FiX size={20} />
              </button>
            </div>

            <img
              src={activeStory.image || mockUsers.find(u => u.id === activeStory.authorId)?.avatar}
              alt="Story"
              className={`story-viewer-img filter-${activeStory.filter || 'none'}`}
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

            {activeStory.authorId === currentUser?.id && (
              <div className="story-seen-by-wrap">
                <button
                  className="story-seen-by-btn"
                  onClick={() => setShowViewerList(!showViewerList)}
                  id="story-seen-by-toggle"
                >
                  <FiEye size={14} /> Seen by {(activeStory.viewers || []).length} people
                </button>
                {showViewerList && (
                  <div className="story-viewers-dropdown card animate-scaleIn">
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 8px 0', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>Viewers</p>
                    {(activeStory.viewers || []).map(v => (
                      <div key={v} className="story-viewer-row">
                        <div className="avatar-placeholder avatar-xs" style={{ width: '20px', height: '20px', fontSize: '0.65rem' }}>{v[0]}</div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeStory.authorId !== currentUser?.id && (
              <div className="story-reactions-bar">
                {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
                  <button
                    key={emoji}
                    className="story-reaction-btn"
                    onClick={() => handleAddEmojiReaction(emoji)}
                    id={`story-emoji-${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facebook style Stories Creator Split-Screen Modal */}
      {showCreateModal && (
        <div className="story-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div
            className="card story-creator-modal"
            onClick={e => e.stopPropagation()}
          >
            {/* If no photo uploaded yet: Select photo view */}
            {!storyFilePreview ? (
              <div className="story-uploader-start-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Create Story</h3>
                  <button className="icon-btn" onClick={() => setShowCreateModal(false)}><FiX size={18} /></button>
                </div>
                <label className="story-upload-dropzone">
                  <FiImage size={48} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Create a Photo Story</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Select a photo from your computer or phone</span>
                  <input
                    id="story-image-file-start"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            ) : (
              /* If photo uploaded: Split design editor pane */
              <div className="story-creator-split-layout">
                {/* Left panel details editor */}
                <aside className="story-creator-left-sidebar">
                  <div className="story-creator-sidebar-header">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Your Story</h3>
                    <button className="icon-btn" onClick={() => setShowCreateModal(false)}><FiX size={18} /></button>
                  </div>

                  <div className="story-creator-user-row">
                    <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="" className="avatar avatar-md" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentUser?.fullName}</span>
                  </div>

                  <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {/* Add Text */}
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

                    {/* Choose Visual Filter */}
                    <div className="form-group">
                      <label className="form-label">Visual Filter Effect</label>
                      <select
                        id="story-filter-select-split"
                        className="form-input"
                        value={storyForm.filter}
                        onChange={e => setStoryForm({ ...storyForm, filter: e.target.value })}
                      >
                        <option value="none">None</option>
                        <option value="grayscale">Grayscale</option>
                        <option value="sepia">Sepia (Retro)</option>
                        <option value="vibrant">Vibrant Colors</option>
                        <option value="blur">Dreamy Blur</option>
                      </select>
                    </div>

                    {/* Add Background Music */}
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FiMusic size={16} /> Add Music
                      </label>
                      <select
                        id="story-music-select-split"
                        className="form-input"
                        value={storyForm.musicTrackId}
                        onChange={e => setStoryForm({ ...storyForm, musicTrackId: e.target.value })}
                      >
                        {MUSIC_TRACKS.map(t => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Text Background style */}
                    <div className="form-group">
                      <label className="form-label">Text Banner Background</label>
                      <select
                        id="story-bg-select-split"
                        className="form-input"
                        value={storyForm.bgColor}
                        onChange={e => setStoryForm({ ...storyForm, bgColor: e.target.value })}
                      >
                        <option value="linear-gradient(135deg, #1877F2 0%, #00C6FF 100%)">Blue Dream</option>
                        <option value="linear-gradient(135deg, #F33E58 0%, #FF6B8B 100%)">Sweet Pink</option>
                        <option value="linear-gradient(135deg, #F7B125 0%, #F58529 100%)">Sunset Orange</option>
                        <option value="rgba(0,0,0,0.65)">Translucent Black</option>
                        <option value="transparent">Transparent</option>
                      </select>
                    </div>

                    {/* Action buttons footer */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDiscard}>Discard</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} id="submit-story-btn">Share to Story</button>
                    </div>
                  </form>
                </aside>

                {/* Right panel interactive real-time preview */}
                <main className="story-creator-preview-pane">
                  <span className="story-preview-label">Preview</span>
                  <div className="story-creator-preview-viewport">
                    <div className="story-creator-preview-frame">
                      {/* Background Image Preview */}
                      <img
                        src={storyFilePreview}
                        alt="Story Preview"
                        className={`story-viewer-img filter-${storyForm.filter}`}
                      />

                      {/* Header items on preview */}
                      <div className="story-viewer-header" style={{ pointerEvents: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="" className="avatar avatar-sm" style={{ border: '2px solid white' }} />
                          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{currentUser?.fullName}</span>
                        </div>
                      </div>

                      {/* Real-time Text Overlay on preview */}
                      {storyForm.text && (
                        <div className="story-text-overlay" style={{ background: storyForm.bgColor, bottom: '60px' }}>
                          <p style={{ margin: 0 }}>{storyForm.text}</p>
                        </div>
                      )}

                      {/* Real-time Music Badge overlay */}
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
