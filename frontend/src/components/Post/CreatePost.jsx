import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiImage, FiSmile, FiMapPin, FiTag, FiVideo, FiX } from 'react-icons/fi';
import { postsAPI } from '../../services/api';
import './CreatePost.css';

const FEELINGS = ['😊 Happy', '😢 Sad', '😍 In Love', '😎 Feeling Great', '🎉 Celebrating', '😤 Angry', '😴 Tired', '🙏 Grateful'];
const BG_COLORS = [
  null,
  'linear-gradient(135deg, #1877F2, #7B2FBE)',
  'linear-gradient(135deg, #F33E58, #FF8C42)',
  'linear-gradient(135deg, #42B72A, #00D4AA)',
  'linear-gradient(135deg, #F7B125, #F33E58)',
  'linear-gradient(135deg, #7B2FBE, #1877F2)',
  '#1877F2',
  '#42B72A',
];

const CreatePost = ({ onPost }) => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bgColor, setBgColor] = useState(null);
  const [feeling, setFeeling] = useState('');
  const [showFeelings, setShowFeelings] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const fileRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setBgColor(null);
    }
  };

  const handlePost = async () => {
    if (!text.trim() && !image) return;
    
    try {
      setSubmitting(true);
      let uploadedUrl = null;
      if (image) {
        const uploadRes = await postsAPI.uploadFile(image);
        uploadedUrl = uploadRes.url;
      }

      const res = await postsAPI.createPost({
        content: text.trim(),
        image: uploadedUrl,
        bgColor: uploadedUrl ? null : bgColor,
        feeling: feeling || null,
        privacy: 'public'
      });

      if (res.post) {
        onPost?.(res.post);
        setText(''); setImage(null); setImagePreview(null);
        setBgColor(null); setFeeling(''); setOpen(false);
        setShowFeelings(false); setShowBgPicker(false);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      alert(err.message || 'পোস্ট ক্রিয়েট করা যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Create Post Trigger Box */}
      <div className="create-post-box card" id="create-post-box">
        <div className="create-post-trigger">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser?.fullName} className="avatar avatar-md" />
          ) : (
            <div className="avatar-placeholder avatar-md">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
          )}
          <button
            className="create-post-input-btn"
            onClick={() => setOpen(true)}
            id="open-create-post"
          >
            What's on your mind, {currentUser?.firstName}?
          </button>
        </div>

        <div className="create-post-divider" />

        <div className="create-post-actions">
          <button className="create-post-action-btn" onClick={() => { setOpen(true); setTimeout(() => fileRef.current?.click(), 100); }}>
            <FiVideo size={18} color="#F33E58" />
            <span>Live Video</span>
          </button>
          <button className="create-post-action-btn" onClick={() => { setOpen(true); setTimeout(() => fileRef.current?.click(), 100); }}>
            <FiImage size={18} color="#42B72A" />
            <span>Photo/Video</span>
          </button>
          <button className="create-post-action-btn" onClick={() => { setOpen(true); setShowFeelings(true); }}>
            <FiSmile size={18} color="#F7B125" />
            <span>Feeling/Activity</span>
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal create-post-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create post</h3>
              <button className="modal-close" onClick={() => setOpen(false)}><FiX size={18} /></button>
            </div>

            <div className="modal-body">
              <div className="post-author-row">
                {currentUser?.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser?.fullName} className="avatar avatar-md" />
                ) : (
                  <div className="avatar-placeholder avatar-md">
                    {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                  </div>
                )}
                <div>
                  <p className="post-author-name">{currentUser?.fullName}</p>
                  <button className="privacy-btn">🌐 Public ▾</button>
                </div>
              </div>

              <div
                className="post-text-area-wrap"
                style={{ background: bgColor || 'transparent', borderRadius: bgColor ? '8px' : '0' }}
              >
                <textarea
                  className={`post-text-area ${bgColor ? 'with-bg' : ''}`}
                  placeholder={`What's on your mind, ${currentUser?.firstName}?`}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={bgColor ? 4 : 5}
                  autoFocus
                />
              </div>

              {feeling && (
                <p style={{ fontSize: '0.87rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Feeling <strong>{feeling}</strong>
                </p>
              )}

              {imagePreview && (
                <div className="post-image-preview">
                  <img src={imagePreview} alt="preview" />
                  <button className="remove-img-btn" onClick={() => { setImage(null); setImagePreview(null); }}>
                    <FiX size={14} />
                  </button>
                </div>
              )}

              {showBgPicker && !imagePreview && (
                <div className="bg-color-picker">
                  {BG_COLORS.map((color, i) => (
                    <div
                      key={i}
                      className={`bg-color-option ${bgColor === color ? 'selected' : ''}`}
                      style={{ background: color || 'var(--bg-card)', border: color ? 'none' : '2px solid var(--border-color)' }}
                      onClick={() => setBgColor(color)}
                    >
                      {!color && <FiX size={12} color="var(--text-secondary)" />}
                    </div>
                  ))}
                </div>
              )}

              {showFeelings && (
                <div className="feelings-picker">
                  <p style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.93rem' }}>How are you feeling?</p>
                  <div className="feelings-grid">
                    {FEELINGS.map(f => (
                      <button
                        key={f}
                        className={`feeling-btn ${feeling === f ? 'selected' : ''}`}
                        onClick={() => { setFeeling(f); setShowFeelings(false); }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="add-to-post-row">
                <p style={{ fontWeight: 700, fontSize: '0.93rem', color: 'var(--text-primary)' }}>Add to your post</p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button className="add-to-post-btn" title="Photo/Video" onClick={() => fileRef.current?.click()}><FiImage size={20} color="#42B72A" /></button>
                  <button className="add-to-post-btn" title="Tag Friends"><FiTag size={20} color="#1877F2" /></button>
                  <button className="add-to-post-btn" title="Feeling" onClick={() => setShowFeelings(!showFeelings)}><FiSmile size={20} color="#F7B125" /></button>
                  <button className="add-to-post-btn" title="Location"><FiMapPin size={20} color="#F33E58" /></button>
                </div>
              </div>

              <input
                type="file"
                ref={fileRef}
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />

              <button
                id="submit-post-btn"
                className="btn btn-primary btn-full"
                style={{ padding: '12px', fontSize: '1rem', borderRadius: '8px', marginTop: '8px' }}
                disabled={submitting || (!text.trim() && !image)}
                onClick={handlePost}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
