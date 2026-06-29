import { useState, useRef, useEffect } from 'react';
import { postsAPI } from '../../services/api';
import { FiX, FiVideo, FiMusic, FiType, FiScissors, FiSliders, FiCheck, FiUpload, FiDisc, FiChevronRight } from 'react-icons/fi';
import './CreateReelModal.css';

const PRESET_MUSIC = [
  { id: 'none', label: '🤫 No Music' },
  { id: 'lofi', label: '🎧 Lofi Gaming Beats' },
  { id: 'electro', label: '⚡ Synthwave Electro' },
  { id: 'dance', label: '💃 Pop Club Anthem' }
];

const CreateReelModal = ({ isOpen, onClose, onUpload }) => {
  const [step, setStep] = useState(1); // 1: Uploader dropzone, 2: Uploaded preview, 3: Edit/Details
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Funny');
  const [musicTrack, setMusicTrack] = useState('none');
  const [trimRange, setTrimRange] = useState({ start: 0, end: 15 });
  const [publishing, setPublishing] = useState(false);

  // Accordion menus states
  const [activeAccordion, setActiveAccordion] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep(1);
      setVideoUrl(null);
      setVideoFile(null);
      setDescription('');
      setCategory('Funny');
      setMusicTrack('none');
      setActiveAccordion(null);
      setPublishing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setStep(2);
    }
  };

  const handleNextStep = () => {
    if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setVideoUrl(null);
      setVideoFile(null);
      setStep(1);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!videoFile) return;

    try {
      setPublishing(true);
      // 1. Upload video to zero-cost storage
      const uploadRes = await postsAPI.uploadFile(videoFile);
      
      // 2. Create feed post with the video URL
      await postsAPI.createPost(
        description || 'Reel video',
        uploadRes.url
      );

      alert('Reel uploaded successfully!');
      onUpload();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to upload reel.');
    } finally {
      setPublishing(false);
    }
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(prev => (prev === name ? null : name));
  };

  return (
    <div className="story-modal-overlay" onClick={onClose}>
      <div
        className="card create-reel-modal-container"
        onClick={e => e.stopPropagation()}
      >
        {/* Step 1: Add Video Dropzone */}
        {step === 1 && (
          <div className="reel-uploader-start-pane">
            <div className="reel-uploader-header">
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem' }}>Create Reel</h3>
              <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
            </div>
            <label className="reel-upload-dropzone">
              <FiVideo size={48} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Upload Video</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Drag and drop or click to choose video</span>
              <input
                id="reel-video-file-input"
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        )}

        {/* Step 2: Preview & Basic Edit */}
        {step === 2 && (
          <div className="reel-creator-layout">
            <div className="reel-creator-header">
              <button className="btn btn-secondary btn-sm" onClick={handlePrevStep}>Back</button>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Preview Reel</h3>
              <button className="btn btn-primary btn-sm" onClick={handleNextStep}>Next</button>
            </div>
            <div className="reel-preview-viewport">
              <video ref={videoRef} src={videoUrl} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          </div>
        )}

        {/* Step 3: Add Details & Publish */}
        {step === 3 && (
          <div className="reel-details-layout">
            <div className="reel-creator-header">
              <button className="btn btn-secondary btn-sm" onClick={handlePrevStep}>Back</button>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Post Details</h3>
              <button className="btn btn-primary btn-sm" onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
            <div className="reel-details-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Description / Caption</label>
                <textarea
                  className="form-input"
                  placeholder="Write a description for your reel..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="Funny">Funny</option>
                  <option value="Travel">Travel</option>
                  <option value="Music">Music</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReelModal;
