import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postsAPI, storiesAPI } from '../../services/api';
import {
  FiPlus, FiX, FiChevronLeft, FiChevronRight, FiMusic, FiEye,
  FiImage, FiType, FiGlobe, FiUsers, FiLock, FiTrash2,
  FiPlay, FiPause, FiArchive, FiVideo, FiSmile
} from 'react-icons/fi';
import './Stories.css';

// ─────────────────────────────────────
// MUSIC LIBRARY — 100% Free / Royalty-Free
// ─────────────────────────────────────
const MUSIC_LIBRARY = [
  { id: 'lofi_1',       emoji: '🎧', label: 'Midnight Study',  genre: 'Lofi',       url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 'lofi_2',       emoji: '☕', label: 'Coffee & Rain',   genre: 'Lofi',       url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' },
  { id: 'pop_1',        emoji: '💃', label: 'Summer Vibes',    genre: 'Pop',        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'pop_2',        emoji: '🎉', label: 'Party Time',      genre: 'Pop',        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'acoustic_1',   emoji: '🎸', label: 'Golden Hour',     genre: 'Acoustic',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'acoustic_2',   emoji: '🌅', label: 'Sunset Drive',    genre: 'Acoustic',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
  { id: 'piano_1',      emoji: '🎹', label: 'Morning Light',   genre: 'Classical',  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'piano_2',      emoji: '🎼', label: 'Nocturne',        genre: 'Classical',  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
  { id: 'electronic_1', emoji: '⚡', label: 'Neon Rush',       genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'electronic_2', emoji: '🔊', label: 'Deep Bass',       genre: 'Electronic', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
  { id: 'cinematic_1',  emoji: '🎬', label: 'Epic Journey',    genre: 'Cinematic',  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: 'cinematic_2',  emoji: '🎭', label: 'Grand Finale',    genre: 'Cinematic',  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
  { id: 'hiphop_1',     emoji: '🎤', label: 'Street Beat',     genre: 'Hip-Hop',    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
  { id: 'rnb_1',        emoji: '🎵', label: 'Smooth Groove',   genre: 'R&B',        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3' },
  { id: 'jazz_1',       emoji: '🎺', label: 'Late Night Jazz', genre: 'Jazz',       url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  { id: 'ambient_1',    emoji: '🌌', label: 'Space Dreams',    genre: 'Ambient',    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3' },
];
const MUSIC_GENRES = ['All', ...new Set(MUSIC_LIBRARY.map(t => t.genre))];

// ─────────────────────────────────────
// STICKER PACKS
// ─────────────────────────────────────
const STICKER_PACKS = {
  '😊 Faces':  ['😀','😍','😂','😎','🥳','😢','😡','🤩','😏','🥺','😴','🤔'],
  '❤️ Hearts': ['❤️','💕','💔','🧡','💛','💚','💙','💜','🖤','🤍','💝','💖'],
  '🌟 Effects':['⭐','🌟','✨','💫','🔥','❄️','🌈','☀️','🌙','⚡','💥','🌊'],
  '🎉 Fun':    ['🎉','🎊','🎈','🎁','🎂','🥂','🍾','🎯','🏆','🎮','👑','💎'],
  '🌸 Nature': ['🌸','🌺','🌻','🌿','🍀','🦋','🌹','🌷','🍁','🌾','🦄','🐝'],
  '🎵 Music':  ['🎵','🎶','🎸','🎹','🎤','🎧','🥁','🎺','🎻','🎷','📻','🎙️'],
};

const VISIBILITY_OPTIONS = [
  { value: 'friends', label: 'Friends', Icon: FiUsers,  desc: 'Your friends can see this' },
  { value: 'public',  label: 'Public',  Icon: FiGlobe,  desc: 'Anyone on Friendix can see this' },
  { value: 'only_me', label: 'Only Me', Icon: FiLock,   desc: 'Only you can see this' },
];

// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────
const normalizeStory = (s) => ({
  id: s._id || s.id,
  authorId: (s.authorId?._id || s.authorId)?.toString(),
  authorName: s.authorId?.fullName || s.authorName || '',
  authorAvatar: s.authorId?.avatar || s.authorAvatar || '',
  mediaType: s.mediaType || 'image',
  image: s.image,
  text: s.text || '',
  filter: s.filter || 'none',
  musicUrl: s.musicUrl || '',
  musicLabel: s.musicLabel || '',
  musicEmoji: s.musicEmoji || '🎵',
  bgColor: s.bgColor || '',
  visibility: s.visibility || 'friends',
  stickers: s.stickers || [],
  textX: s.textX ?? 50,
  textY: s.textY ?? 80,
  textSize: s.textSize ?? 20,
  viewers: s.viewers || [],
  createdAt: s.createdAt,
});

const getVisIcon = (v) => {
  if (v === 'public')  return <FiGlobe size={10} />;
  if (v === 'only_me') return <FiLock size={10} />;
  return <FiUsers size={10} />;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ago`;
  if (h >= 1)  return `${h}h ago`;
  return `${m}m ago`;
};

// ═══════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════
const Stories = () => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Stories data ──
  const [stories, setStories]         = useState([]);
  const [archiveStories, setArchive]  = useState([]);
  const [storiesLoading, setLoading]  = useState(true);

  // ── Viewer ──
  const [activeIdx, setActiveIdx]     = useState(null);
  const [progress, setProgress]       = useState(0);
  const [showViewerList, setViewerList] = useState(false);
  const [floatingEmojis, setFloatEmoji] = useState([]);

  // ── Modals ──
  const [showCreate, setShowCreate]   = useState(false);
  const [showArchive, setShowArchive] = useState(false);

  // ── Upload Progress Modal ──
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadPhase, setUploadPhase]         = useState('upload');   // 'compress' | 'upload'
  const [uploadProgress, setUploadProgress]   = useState(0);          // 0–100
  const [uploadStatus, setUploadStatus]       = useState('idle');     // 'idle'|'running'|'success'|'error'
  const [uploadError, setUploadError]         = useState('');

  // ── Confirm Delete Modal ──
  const [showConfirmDelete, setShowConfirmDelete] = useState(null); // storyId | null

  // ── Creator form ──
  const [mediaFile, setMediaFile]     = useState(null);
  const [mediaPreview, setPreview]    = useState(null);
  const [mediaType, setMediaType]     = useState('image');
  const [uploading, setUploading]     = useState(false);
  const [form, setForm]               = useState({
    text: '', filter: 'none', bgColor: 'linear-gradient(135deg,#1877F2,#00C6FF)',
    visibility: 'friends', musicId: '', stickers: [],
  });

  // ── Text Overlay drag + size ──
  const [textPos, setTextPos]         = useState({ x: 50, y: 80 });  // % position
  const [textFontSize, setTextFontSize] = useState(20);               // px
  const [draggingText, setDraggingText] = useState(false);

  // ── Music picker ──
  const [musicGenre, setMusicGenre]   = useState('All');
  const [previewingId, setPreviewId]  = useState(null);
  const [stickerTab, setStickerTab]   = useState(Object.keys(STICKER_PACKS)[0]);
  const [activeSection, setSection]   = useState('text'); // text|filter|music|stickers|visibility

  // ── Sticker drag ──
  const [dragging, setDragging]       = useState(null); // {idx}

  // ── Refs ──
  const progressRef   = useRef(null);
  const scrollRef     = useRef(null);
  const storyAudioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const storyVideoRef = useRef(null);
  const pollingRef    = useRef(null);
  const previewFrameRef = useRef(null);

  // ──────────────────────────────────────
  // FETCH STORIES
  // ──────────────────────────────────────
  const fetchStories = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await storiesAPI.getAll();
      if (res?.stories) setStories(res.stories.map(normalizeStory));
    } catch (e) { console.error(e); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStories(false);
    pollingRef.current = setInterval(() => fetchStories(true), 15000);
    return () => { clearInterval(pollingRef.current); clearInterval(progressRef.current); };
  }, [fetchStories]);

  // Open story from profile navigation
  useEffect(() => {
    if (location.state?.openStoryForUser && stories.length > 0) {
      const idx = stories.findIndex(s => s.authorId === location.state.openStoryForUser.toString());
      if (idx !== -1) openStoryAt(idx);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, stories]);

  // Sticker drag events
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const frame = previewFrameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
      setForm(prev => {
        const stickers = [...prev.stickers];
        stickers[dragging.idx] = { ...stickers[dragging.idx], x, y };
        return { ...prev, stickers };
      });
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging]);

  // ── Text overlay drag events ──
  useEffect(() => {
    if (!draggingText) return;
    const onMove = (e) => {
      const frame = previewFrameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
      const y = Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100));
      setTextPos({ x, y });
    };
    const onUp = () => setDraggingText(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [draggingText]);

  // ──────────────────────────────────────
  // STORY VIEWER
  // ──────────────────────────────────────
  const openStoryAt = (idx) => {
    if (idx < 0 || idx >= stories.length) return;
    const story = stories[idx];
    setActiveIdx(idx);
    setProgress(0);
    setViewerList(false);
    clearInterval(progressRef.current);

    if (story.authorId !== currentUser?.id?.toString()) {
      storiesAPI.viewStory(story.id).catch(() => {});
    }

    // Images: 8-second timer; Videos: driven by onTimeUpdate
    if (story.mediaType !== 'video') {
      progressRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(progressRef.current);
            setActiveIdx(prev => {
              if (prev !== null && prev < stories.length - 1) {
                setTimeout(() => openStoryAt(prev + 1), 50);
                return prev + 1;
              }
              return null;
            });
            return 0;
          }
          return p + 1;
        });
      }, 80);
    }
  };

  const closeStory = () => {
    setActiveIdx(null);
    setProgress(0);
    clearInterval(progressRef.current);
    if (storyVideoRef.current) storyVideoRef.current.pause();
  };

  const goNext = () => {
    if (activeIdx !== null && activeIdx < stories.length - 1) openStoryAt(activeIdx + 1);
    else closeStory();
  };
  const goPrev = () => {
    if (activeIdx !== null && activeIdx > 0) openStoryAt(activeIdx - 1);
  };

  const handleVideoProgress = (e) => {
    const v = e.target;
    if (!v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const addFloatEmoji = (emoji) => {
    const id = `fe_${Date.now()}`;
    setFloatEmoji(p => [...p, { id, symbol: emoji, left: Math.random() * 80 + 10 }]);
    setTimeout(() => setFloatEmoji(p => p.filter(f => f.id !== id)), 2000);
  };

  const handleDeleteStory = async (storyId) => {
    setShowConfirmDelete(storyId);
  };

  const confirmDeleteStory = async () => {
    const storyId = showConfirmDelete;
    setShowConfirmDelete(null);
    try {
      await storiesAPI.deleteStory(storyId);
      setStories(p => p.filter(s => s.id !== storyId));
      closeStory();
    } catch {
      setUploadError('Failed to delete story. Please try again.');
      setUploadStatus('error');
      setShowUploadModal(true);
    }
  };

  // ──────────────────────────────────────
  // ARCHIVE
  // ──────────────────────────────────────
  const openArchive = async () => {
    setShowArchive(true);
    try {
      const res = await storiesAPI.getArchive();
      if (res?.stories) setArchive(res.stories.map(normalizeStory));
    } catch (e) { console.error(e); }
  };

  // ──────────────────────────────────────
  // STORY CREATOR
  // ──────────────────────────────────────
  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(type);
    setPreview(URL.createObjectURL(file));
  };

  const addSticker = (emoji) => {
    setForm(p => ({
      ...p,
      stickers: [...p.stickers, { emoji, x: 50, y: 50, size: 40 }]
    }));
  };

  const removeSticker = (idx) => {
    setForm(p => ({ ...p, stickers: p.stickers.filter((_, i) => i !== idx) }));
  };

  const previewMusic = (track) => {
    if (previewingId === track.id) {
      previewAudioRef.current?.pause();
      setPreviewId(null);
    } else {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      previewAudioRef.current = new Audio(track.url);
      previewAudioRef.current.play();
      previewAudioRef.current.onended = () => setPreviewId(null);
      setPreviewId(track.id);
    }
  };

  const selectMusic = (track) => {
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPreviewId(null);
    setForm(p => ({
      ...p,
      musicId: p.musicId === track.id ? '' : track.id,
    }));
  };

  const resetForm = () => {
    setMediaFile(null);
    setPreview(null);
    setMediaType('image');
    setUploading(false);
    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPreviewId(null);
    setSection('text');
    setTextPos({ x: 50, y: 80 });
    setTextFontSize(20);
    setForm({ text: '', filter: 'none', bgColor: 'linear-gradient(135deg,#1877F2,#00C6FF)', visibility: 'friends', musicId: '', stickers: [] });
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!mediaFile || uploading) return;

    // Open the upload progress modal
    setShowUploadModal(true);
    setUploadStatus('running');
    setUploadProgress(0);
    setUploadPhase('upload');
    setUploadError('');
    setUploading(true);

    try {
      const uploadRes = await postsAPI.uploadFile(mediaFile, ({ phase, pct }) => {
        setUploadPhase(phase);
        setUploadProgress(pct);
      });

      const selectedTrack = MUSIC_LIBRARY.find(t => t.id === form.musicId);
      const payload = {
        image: uploadRes.url,
        mediaType,
        text: form.text,
        filter: form.filter,
        bgColor: form.bgColor,
        visibility: form.visibility,
        stickers: form.stickers,
        musicUrl: selectedTrack?.url || '',
        musicLabel: selectedTrack?.label || '',
        musicEmoji: selectedTrack?.emoji || '',
        textX: textPos.x,
        textY: textPos.y,
        textSize: textFontSize,
      };
      const res = await storiesAPI.create(payload);
      if (res?.story) setStories(p => [normalizeStory(res.story), ...p]);

      setUploadStatus('success');
      setUploadProgress(100);
      setTimeout(() => {
        setShowUploadModal(false);
        setShowCreate(false);
        resetForm();
      }, 1500);
    } catch (err) {
      console.error(err);
      setUploadStatus('error');
      setUploadError(err.message || 'Failed to share story. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // ──────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────
  const activeStory = activeIdx !== null ? stories[activeIdx] : null;
  const selectedTrack = MUSIC_LIBRARY.find(t => t.id === form.musicId);
  const filteredMusic = musicGenre === 'All' ? MUSIC_LIBRARY : MUSIC_LIBRARY.filter(t => t.genre === musicGenre);

  return (
    <>
      {/* ════════════ STORIES BAR ════════════ */}
      <div className="stories-container card">
        <button className="stories-scroll-btn left" onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })} aria-label="Scroll left">
          <FiChevronLeft size={18} />
        </button>

        <div className="stories-scroll" ref={scrollRef}>
          {/* Create Story */}
          <div className="story-card story-create-card" onClick={() => setShowCreate(true)} id="create-story-card-btn">
            <div className="story-create-bg">
              {currentUser?.avatar
                ? <img src={currentUser.avatar} alt="" className="story-create-photo" />
                : <div className="story-create-placeholder" />}
            </div>
            <div className="story-create-bottom">
              <div className="story-create-btn"><FiPlus size={18} /></div>
              <p className="story-create-label">Create Story</p>
            </div>
          </div>

          {/* Archive Button */}
          <div className="story-card story-archive-card" onClick={openArchive} title="Story Archive">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '8px', color: 'var(--text-secondary)' }}>
              <FiArchive size={28} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Archive</span>
            </div>
          </div>

          {/* Story Cards */}
          {storiesLoading && stories.length === 0
            ? [1, 2, 3].map(i => <div key={i} className="story-card" style={{ background: 'var(--bg-hover)', opacity: 0.5 }} />)
            : stories.map((story, index) => {
                const isMe = story.authorId === currentUser?.id?.toString();
                const name = story.authorName || (isMe ? currentUser?.fullName : 'User');
                const avatar = isMe ? (currentUser?.avatar || story.authorAvatar) : story.authorAvatar;
                const firstName = (name || '').split(' ')[0] || 'User';
                return (
                  <div
                    key={story.id}
                    className="story-card"
                    onClick={() => openStoryAt(index)}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && openStoryAt(index)}
                    id={`story-card-${story.id}`}
                  >
                    {story.mediaType === 'video'
                      ? <video src={story.image} className={`story-bg-img filter-${story.filter || 'none'}`} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <img src={story.image} alt={name} className={`story-bg-img filter-${story.filter || 'none'}`} onError={e => { e.target.src = avatar || 'https://i.pravatar.cc/300'; }} />}
                    <div className="story-gradient" />
                    <div className="story-avatar-ring">
                      {avatar
                        ? <img src={avatar} alt={name} className="story-avatar" />
                        : <div className="avatar-placeholder story-avatar" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: 'white', background: 'var(--primary)' }}>{firstName[0]}</div>}
                    </div>
                    {story.mediaType === 'video' && <div className="story-video-badge">▶</div>}
                    <p className="story-name">{firstName}</p>
                    {isMe && <div className="story-visibility-badge" title={story.visibility}>{getVisIcon(story.visibility)}</div>}
                  </div>
                );
              })}
        </div>

        <button className="stories-scroll-btn right" onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} aria-label="Scroll right">
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* ════════════ STORY VIEWER ════════════ */}
      {activeStory && (
        <div className="story-modal-overlay" onClick={closeStory}>
          <div className="story-viewer" onClick={e => e.stopPropagation()}>
            {/* Background Music */}
            {activeStory.musicUrl && <audio ref={storyAudioRef} src={activeStory.musicUrl} autoPlay loop key={activeStory.id} />}

            {/* Floating Emoji Reactions */}
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
                {activeStory.authorAvatar
                  ? <img src={activeStory.authorAvatar} alt="" className="avatar avatar-md" style={{ border: '2px solid white' }} />
                  : <div className="avatar-placeholder avatar-md" style={{ border: '2px solid white', fontSize: '0.9rem' }}>{activeStory.authorName?.[0]}</div>}
                <div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.93rem', margin: 0 }}>{activeStory.authorName}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {getVisIcon(activeStory.visibility)}
                    {activeStory.visibility === 'public' ? 'Public' : activeStory.visibility === 'only_me' ? 'Only me' : 'Friends'}
                    &nbsp;·&nbsp;{timeAgo(activeStory.createdAt)}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {activeStory.authorId === currentUser?.id?.toString() && (
                  <button className="story-close-btn" onClick={() => handleDeleteStory(activeStory.id)} title="Delete" style={{ background: 'rgba(220,53,69,0.3)' }}>
                    <FiTrash2 size={16} />
                  </button>
                )}
                <button className="story-close-btn" onClick={closeStory}><FiX size={20} /></button>
              </div>
            </div>

            {/* Prev/Next arrows */}
            {activeIdx > 0 && (
              <button className="story-nav-btn story-nav-left" onClick={goPrev}><FiChevronLeft size={22} /></button>
            )}
            {activeIdx < stories.length - 1 && (
              <button className="story-nav-btn story-nav-right" onClick={goNext}><FiChevronRight size={22} /></button>
            )}

            {/* Media */}
            {activeStory.mediaType === 'video'
              ? <video
                  ref={storyVideoRef}
                  src={activeStory.image}
                  className={`story-viewer-img filter-${activeStory.filter || 'none'}`}
                  autoPlay playsInline
                  onTimeUpdate={handleVideoProgress}
                  onEnded={goNext}
                />
              : <img
                  src={activeStory.image}
                  alt="Story"
                  className={`story-viewer-img filter-${activeStory.filter || 'none'}`}
                  onError={e => { e.target.src = 'https://i.pravatar.cc/600'; }}
                />}

            {/* Stickers Overlay */}
            {(activeStory.stickers || []).map((s, i) => (
              <span key={i} className="story-viewer-sticker" style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.size || 40}px` }}>
                {s.emoji}
              </span>
            ))}

            {/* Text Overlay */}
            {activeStory.text && (
              <div
                className="story-text-overlay"
                style={{
                  background: activeStory.bgColor || 'rgba(0,0,0,0.4)',
                  position: 'absolute',
                  left: `${activeStory.textX ?? 50}%`,
                  top: `${activeStory.textY ?? 80}%`,
                  transform: 'translate(-50%, -50%)',
                  bottom: 'auto',
                  fontSize: `${activeStory.textSize ?? 20}px`,
                }}
              >
                <p>{activeStory.text}</p>
              </div>
            )}

            {/* Music Badge */}
            {activeStory.musicLabel && (
              <div className="story-music-badge">
                <span>{activeStory.musicEmoji || '🎵'}</span>
                <span>{activeStory.musicLabel}</span>
              </div>
            )}

            {/* Seen By (own stories only) */}
            {activeStory.authorId === currentUser?.id?.toString() && (
              <div className="story-seen-by-wrap">
                <button className="story-seen-by-btn" onClick={() => setViewerList(!showViewerList)}>
                  <FiEye size={14} /> Seen by {(activeStory.viewers || []).length} people
                </button>
                {showViewerList && (
                  <div className="story-viewers-dropdown card animate-scaleIn">
                    <p style={{ fontWeight: 700, fontSize: '0.85rem', margin: '0 0 8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>Viewers</p>
                    {(activeStory.viewers || []).length === 0
                      ? <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>No views yet</p>
                      : (activeStory.viewers || []).map((v, i) => {
                          const vname = v?.fullName || 'User';
                          return (
                            <div key={i} className="story-viewer-row">
                              {v?.avatar
                                ? <img src={v.avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                : <div className="avatar-placeholder" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>{vname[0]}</div>}
                              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{vname}</span>
                            </div>
                          );
                        })}
                  </div>
                )}
              </div>
            )}

            {/* Emoji Reactions (others' stories) */}
            {activeStory.authorId !== currentUser?.id?.toString() && (
              <div className="story-reactions-bar">
                {['👍','❤️','😂','😮','😢','😡'].map(emoji => (
                  <button key={emoji} className="story-reaction-btn" onClick={() => addFloatEmoji(emoji)}>{emoji}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ ARCHIVE MODAL ════════════ */}
      {showArchive && (
        <div className="story-modal-overlay" onClick={() => setShowArchive(false)}>
          <div className="card story-archive-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>📦 Story Archive</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Stories older than 24h — visible only to you</p>
              </div>
              <button className="icon-btn" onClick={() => setShowArchive(false)}><FiX size={20} /></button>
            </div>
            {archiveStories.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                  <FiArchive size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                  <p>No archived stories yet</p>
                </div>
              : <div className="archive-grid">
                  {archiveStories.map(story => (
                    <div key={story.id} className="archive-item">
                      {story.mediaType === 'video'
                        ? <video src={story.image} className={`archive-media filter-${story.filter}`} muted />
                        : <img src={story.image} alt="" className={`archive-media filter-${story.filter}`} />}
                      <div className="archive-item-overlay">
                        <p className="archive-item-time">{timeAgo(story.createdAt)}</p>
                        {getVisIcon(story.visibility)}
                      </div>
                    </div>
                  ))}
                </div>}
          </div>
        </div>
      )}

      {/* ════════════ CREATE STORY MODAL ════════════ */}
      {showCreate && (
        <div className="story-modal-overlay" onClick={() => { setShowCreate(false); resetForm(); }}>
          <div className="card story-creator-modal" onClick={e => e.stopPropagation()}>

            {/* Step 1: Choose media */}
            {!mediaPreview ? (
              <div className="story-uploader-start-pane">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '24px' }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Create Story</h3>
                  <button className="icon-btn" onClick={() => { setShowCreate(false); resetForm(); }}><FiX size={18} /></button>
                </div>
                <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
                  <label className="story-upload-dropzone" style={{ flex: 1 }}>
                    <FiImage size={40} style={{ color: 'var(--primary)', marginBottom: '10px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Photo Story</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>JPG, PNG, GIF</span>
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'image')} style={{ display: 'none' }} />
                  </label>
                  <label className="story-upload-dropzone" style={{ flex: 1 }}>
                    <FiVideo size={40} style={{ color: '#e91e8c', marginBottom: '10px' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Video Story</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>MP4, MOV, max 60s</span>
                    <input type="file" accept="video/*" onChange={e => handleFileChange(e, 'video')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            ) : (
              /* Step 2: Customize */
              <div className="story-creator-split-layout">

                {/* ── Left Panel ── */}
                <aside className="story-creator-left-sidebar">
                  <div className="story-creator-sidebar-header">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>Your Story</h3>
                    <button className="icon-btn" onClick={() => { setShowCreate(false); resetForm(); }}><FiX size={18} /></button>
                  </div>

                  {/* Author */}
                  <div className="story-creator-user-row">
                    <img src={currentUser?.avatar || 'https://i.pravatar.cc/150?img=11'} alt="" className="avatar avatar-md" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser?.fullName}</span>
                  </div>

                  {/* Section Tabs */}
                  <div className="story-section-tabs">
                    {[
                      { id: 'text',       icon: '✏️', label: 'Text' },
                      { id: 'filter',     icon: '🎨', label: 'Filter' },
                      { id: 'music',      icon: '🎵', label: 'Music' },
                      { id: 'stickers',   icon: '😊', label: 'Stickers' },
                      { id: 'visibility', icon: '👁️', label: 'Privacy' },
                    ].map(s => (
                      <button
                        key={s.id}
                        className={`story-section-tab ${activeSection === s.id ? 'active' : ''}`}
                        onClick={() => setSection(s.id)}
                      >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateStory} style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, overflowY: 'auto', paddingRight: '2px' }}>

                    {/* ── TEXT section ── */}
                    {activeSection === 'text' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">Text Overlay</label>
                          <textarea
                            className="form-input"
                            value={form.text}
                            onChange={e => setForm(p => ({ ...p, text: e.target.value }))}
                            placeholder="Add text to your story..."
                            style={{ minHeight: '80px', resize: 'vertical' }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Text Banner Color</label>
                          <select className="form-input" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))}>
                            <option value="linear-gradient(135deg,#1877F2,#00C6FF)">🔵 Blue Dream</option>
                            <option value="linear-gradient(135deg,#F33E58,#FF6B8B)">🌸 Sweet Pink</option>
                            <option value="linear-gradient(135deg,#F7B125,#F58529)">🟠 Sunset Orange</option>
                            <option value="linear-gradient(135deg,#7C3AED,#C026D3)">💜 Violet Galaxy</option>
                            <option value="linear-gradient(135deg,#059669,#10B981)">🟢 Forest Green</option>
                            <option value="rgba(0,0,0,0.65)">⚫ Translucent Black</option>
                            <option value="transparent">🫥 Transparent</option>
                          </select>
                        </div>
                        {form.text && (
                          <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Text Size</span>
                              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{textFontSize}px</span>
                            </label>
                            <input
                              type="range"
                              className="story-text-size-slider"
                              min={12} max={72} step={2}
                              value={textFontSize}
                              onChange={e => setTextFontSize(Number(e.target.value))}
                            />
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                              💡 Drag the text on the preview to reposition it
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── FILTER section ── */}
                    {activeSection === 'filter' && (
                      <div className="form-group">
                        <label className="form-label">Visual Filter Effect</label>
                        <div className="filter-grid">
                          {[
                            { value: 'none',      label: 'None',       preview: 'linear-gradient(135deg,#ccc,#888)' },
                            { value: 'grayscale',  label: 'B&W',        preview: 'linear-gradient(135deg,#666,#333)' },
                            { value: 'sepia',      label: 'Vintage',    preview: 'linear-gradient(135deg,#c8a265,#8b6340)' },
                            { value: 'vibrant',    label: 'Vivid',      preview: 'linear-gradient(135deg,#ff6b6b,#4ecdc4)' },
                            { value: 'blur',       label: 'Dreamy',     preview: 'linear-gradient(135deg,#a8edea,#fed6e3)' },
                            { value: 'warm',       label: 'Warm',       preview: 'linear-gradient(135deg,#f7971e,#ffd200)' },
                            { value: 'cool',       label: 'Cool',       preview: 'linear-gradient(135deg,#2193b0,#6dd5ed)' },
                            { value: 'invert',     label: 'Invert',     preview: 'linear-gradient(135deg,#0f0c29,#302b63)' },
                          ].map(f => (
                            <button
                              key={f.value}
                              type="button"
                              className={`filter-option ${form.filter === f.value ? 'active' : ''}`}
                              onClick={() => setForm(p => ({ ...p, filter: f.value }))}
                            >
                              <div className="filter-preview" style={{ background: f.preview }} />
                              <span>{f.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── MUSIC section ── */}
                    {activeSection === 'music' && (
                      <div className="form-group">
                        <label className="form-label">🎵 Music Library — 100% Free</label>
                        {form.musicId && (
                          <div className="selected-music-badge">
                            {selectedTrack?.emoji} {selectedTrack?.label} — {selectedTrack?.genre}
                            <button type="button" onClick={() => setForm(p => ({ ...p, musicId: '' }))} style={{ marginLeft: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><FiX size={12} /></button>
                          </div>
                        )}
                        <div className="music-genre-tabs">
                          {MUSIC_GENRES.map(g => (
                            <button key={g} type="button" className={`music-genre-btn ${musicGenre === g ? 'active' : ''}`} onClick={() => setMusicGenre(g)}>{g}</button>
                          ))}
                        </div>
                        <div className="music-track-list">
                          {filteredMusic.map(track => (
                            <div
                              key={track.id}
                              className={`music-track-item ${form.musicId === track.id ? 'selected' : ''}`}
                              onClick={() => selectMusic(track)}
                            >
                              <div className="music-track-emoji">{track.emoji}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="music-track-label">{track.label}</p>
                                <span className="music-genre-tag">{track.genre}</span>
                              </div>
                              <button
                                type="button"
                                className="music-preview-btn"
                                onClick={e => { e.stopPropagation(); previewMusic(track); }}
                                title="Preview"
                              >
                                {previewingId === track.id ? <FiPause size={14} /> : <FiPlay size={14} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── STICKERS section ── */}
                    {activeSection === 'stickers' && (
                      <div className="form-group">
                        <label className="form-label">🎭 Stickers — tap to add, drag to position</label>
                        <div className="sticker-pack-tabs">
                          {Object.keys(STICKER_PACKS).map(pack => (
                            <button key={pack} type="button" className={`sticker-tab-btn ${stickerTab === pack ? 'active' : ''}`} onClick={() => setStickerTab(pack)}>
                              {pack.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                        <div className="sticker-grid">
                          {(STICKER_PACKS[stickerTab] || []).map((emoji, i) => (
                            <button key={i} type="button" className="sticker-btn" onClick={() => addSticker(emoji)}>{emoji}</button>
                          ))}
                        </div>
                        {form.stickers.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 6px' }}>Added stickers (click to remove):</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {form.stickers.map((s, i) => (
                                <button key={i} type="button" onClick={() => removeSticker(i)} className="sticker-remove-btn" title="Remove">
                                  {s.emoji} ×
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── VISIBILITY section ── */}
                    {activeSection === 'visibility' && (
                      <div className="form-group">
                        <label className="form-label">Who can see your story?</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {VISIBILITY_OPTIONS.map(opt => {
                            const Icon = opt.Icon;
                            const active = form.visibility === opt.value;
                            return (
                              <label key={opt.value} className={`visibility-option ${active ? 'active' : ''}`}>
                                <input type="radio" name="vis" value={opt.value} checked={active} onChange={() => setForm(p => ({ ...p, visibility: opt.value }))} style={{ display: 'none' }} />
                                <div className={`vis-icon ${active ? 'active' : ''}`}><Icon size={18} /></div>
                                <div>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem' }}>{opt.label}</p>
                                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{opt.desc}</p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Submit buttons */}
                    <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={resetForm} disabled={uploading}>Discard</button>
                      <button type="submit" className="btn btn-primary" style={{ flex: 1 }} id="submit-story-btn" disabled={uploading}>
                        {uploading ? '⏳ Sharing...' : '📤 Share to Story'}
                      </button>
                    </div>
                  </form>
                </aside>

                {/* ── Live Preview Panel ── */}
                <main className="story-creator-preview-pane">
                  <span className="story-preview-label">Live Preview</span>
                  <div className="story-creator-preview-viewport">
                    <div className="story-creator-preview-frame" ref={previewFrameRef}>
                      {/* Media Preview */}
                      {mediaType === 'video'
                        ? <video src={mediaPreview} className={`story-viewer-img filter-${form.filter}`} muted autoPlay loop playsInline />
                        : <img src={mediaPreview} alt="Preview" className={`story-viewer-img filter-${form.filter}`} />}

                      {/* Author header overlay */}
                      <div className="story-viewer-header" style={{ pointerEvents: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={currentUser?.avatar || 'https://i.pravatar.cc/60'} alt="" className="avatar avatar-sm" style={{ border: '2px solid white' }} />
                          <div>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '0.75rem', display: 'block' }}>{currentUser?.fullName}</span>
                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              {form.visibility === 'public' ? <><FiGlobe size={9} /> Public</> : form.visibility === 'only_me' ? <><FiLock size={9} /> Only me</> : <><FiUsers size={9} /> Friends</>}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stickers on preview (draggable) */}
                      {form.stickers.map((s, i) => (
                        <span
                          key={i}
                          className="story-preview-sticker"
                          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: `${s.size}px` }}
                          onMouseDown={e => { e.preventDefault(); setDragging({ idx: i }); }}
                          onTouchStart={e => { e.preventDefault(); setDragging({ idx: i }); }}
                        >
                          {s.emoji}
                        </span>
                      ))}

                      {/* Text overlay preview — draggable */}
                      {form.text && (
                        <div
                          className="story-text-overlay story-text-draggable"
                          style={{
                            background: form.bgColor,
                            position: 'absolute',
                            left: `${textPos.x}%`,
                            top: `${textPos.y}%`,
                            transform: 'translate(-50%, -50%)',
                            fontSize: `${textFontSize}px`,
                            bottom: 'auto',
                            cursor: 'grab',
                            userSelect: 'none',
                          }}
                          onMouseDown={e => { e.preventDefault(); setDraggingText(true); }}
                          onTouchStart={e => { e.preventDefault(); setDraggingText(true); }}
                        >
                          <p style={{ margin: 0 }}>{form.text}</p>
                          <div className="story-text-drag-hint">✥ drag</div>
                        </div>
                      )}

                      {/* Music badge preview */}
                      {selectedTrack && (
                        <div className="story-music-badge" style={{ top: '64px' }}>
                          <span>{selectedTrack.emoji}</span>
                          <span>{selectedTrack.label}</span>
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
      {/* ════════════ UPLOAD PROGRESS MODAL ════════════ */}
      {showUploadModal && (
        <div className="upload-modal-overlay" onClick={uploadStatus === 'error' ? () => setShowUploadModal(false) : undefined}>
          <div className="upload-modal-card" onClick={e => e.stopPropagation()}>

            {/* Animated circular progress ring */}
            <div className="upload-ring-wrap">
              <svg className="upload-ring-svg" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" className="upload-ring-bg" />
                <circle
                  cx="60" cy="60" r="50"
                  className={`upload-ring-fill ${
                    uploadStatus === 'success' ? 'success'
                    : uploadStatus === 'error'  ? 'error'
                    : uploadPhase === 'compress' ? 'compress' : 'upload'
                  }`}
                  style={{
                    strokeDashoffset: 314 - (314 * uploadProgress) / 100,
                  }}
                />
              </svg>
              <div className="upload-ring-icon">
                {uploadStatus === 'success' ? '✅'
                  : uploadStatus === 'error' ? '❌'
                  : uploadPhase === 'compress' ? '🗜️' : '📤'}
              </div>
              <div className="upload-ring-pct">
                {uploadStatus === 'success' ? ''
                  : uploadStatus === 'error' ? ''
                  : `${uploadProgress}%`}
              </div>
            </div>

            {/* Status text */}
            <div className="upload-modal-text">
              {uploadStatus === 'success' && (
                <>
                  <p className="upload-modal-title success">Story Shared! 🎉</p>
                  <p className="upload-modal-sub">Your story is now live</p>
                </>
              )}
              {uploadStatus === 'error' && (
                <>
                  <p className="upload-modal-title error">Upload Failed</p>
                  <p className="upload-modal-sub error-msg">{uploadError}</p>
                  <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%' }} onClick={() => setShowUploadModal(false)}>Try Again</button>
                </>
              )}
              {uploadStatus === 'running' && (
                <>
                  <p className="upload-modal-title">
                    {uploadPhase === 'compress' ? 'Compressing Video...' : 'Uploading Story...'}
                  </p>
                  <p className="upload-modal-sub">
                    {uploadPhase === 'compress'
                      ? 'Reducing file size for faster upload'
                      : 'Please keep this window open'}
                  </p>
                </>
              )}
            </div>

            {/* Progress bar (linear, below ring) */}
            {uploadStatus === 'running' && (
              <div className="upload-linear-bar-wrap">
                <div
                  className={`upload-linear-bar-fill ${uploadPhase}`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════ CONFIRM DELETE MODAL ════════════ */}
      {showConfirmDelete && (
        <div className="upload-modal-overlay" onClick={() => setShowConfirmDelete(null)}>
          <div className="upload-modal-card confirm-delete-card" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🗑️</div>
            <p className="upload-modal-title" style={{ color: 'var(--danger, #e74c3c)' }}>Delete Story?</p>
            <p className="upload-modal-sub">This story will be permanently deleted and cannot be undone.</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '18px', width: '100%' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg,#e74c3c,#c0392b)' }} onClick={confirmDeleteStory}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Stories;
