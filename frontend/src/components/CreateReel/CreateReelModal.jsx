import { useState, useRef, useEffect } from 'react';
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
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Funny');
  const [musicTrack, setMusicTrack] = useState('none');
  const [hasCaptions, setHasCaptions] = useState(false);
  const [hasAudioDesc, setHasAudioDesc] = useState(false);
  const [trimRange, setTrimRange] = useState({ start: 0, end: 15 });

  // Accordion menus states
  const [activeAccordion, setActiveAccordion] = useState(null);

  const videoRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setStep(1);
      setVideoUrl(null);
      setDescription('');
      setCategory('Funny');
      setMusicTrack('none');
      setHasCaptions(false);
      setHasAudioDesc(false);
      setActiveAccordion(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
      setStep(1);
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!videoUrl) return;

    const newReel = {
      id: `r_${Date.now()}`,
      videoUrl: videoUrl,
      description: description,
      category: category,
      audio: musicTrack !== 'none' ? PRESET_MUSIC.find(m => m.id === musicTrack)?.label : 'Original Audio',
      isHdr: true,
      is4k: false,
      emojiSticker: '',
      comments: []
    };

    onUpload(newReel);
    onClose();
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
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Create reel</h3>
              <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
            </div>

            <div className="reel-uploader-split-start">
              {/* Left Select panel */}
              <div className="reel-uploader-left-start">
                <label className="reel-upload-dropzone">
                  <div className="reel-upload-circle">
                    <FiVideo size={28} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '12px' }}>Add Video</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>or drag and drop</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%' }} disabled>Upload</button>
              </div>

              {/* Right empty preview */}
              <div className="reel-uploader-right-preview-empty">
                <span className="story-preview-label">Preview</span>
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 8px 0' }}>Your video preview</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Upload your video in order to see a preview here.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Video Preview Loaded */}
        {step === 2 && (
          <div className="reel-editor-layout">
            {/* Left controller */}
            <aside className="reel-editor-sidebar">
              <div className="reel-uploader-header" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Create reel</h3>
                <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
              </div>

              <div className="reel-upload-status-row" style={{ marginTop: '20px' }}>
                <div className="reel-upload-status-icon">
                  <FiVideo size={20} />
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>Video Loaded</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>Ready to edit and customize</p>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', gap: '12px' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrevStep}>Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleNextStep}>Next</button>
              </div>
            </aside>

            {/* Right Video Viewport */}
            <main className="reel-editor-preview-pane">
              <span className="story-preview-label">Preview</span>
              <div className="reel-editor-preview-frame">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  autoPlay
                  loop
                  muted
                  controls
                />
              </div>
            </main>
          </div>
        )}

        {/* Step 3: Edit details page */}
        {step === 3 && (
          <div className="reel-editor-layout">
            {/* Left controller sidebar */}
            <aside className="reel-editor-sidebar" style={{ overflowY: 'auto' }}>
              <div className="reel-uploader-header" style={{ padding: '0 0 12px 0', borderBottom: '1px solid var(--border-light)', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>Edit reel</h3>
                <button className="icon-btn" onClick={onClose}><FiX size={18} /></button>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '20px' }}>
                {/* Simulated Thumbnail */}
                <div className="reel-edit-thumb-wrap">
                  <video src={videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  <span className="reel-edit-thumb-label">Edit</span>
                </div>
                {/* Description Textarea */}
                <div style={{ flex: 1 }}>
                  <textarea
                    id="reel-description-input-modal"
                    className="form-input"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe your reel..."
                    style={{ minHeight: '80px', resize: 'none', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Accordion Settings Menus */}
              <div className="reel-editor-accordions">
                {/* Trim video */}
                <div className={`reel-accordion-item ${activeAccordion === 'trim' ? 'open' : ''}`}>
                  <button type="button" className="reel-accordion-trigger" onClick={() => toggleAccordion('trim')}>
                    <span className="reel-accordion-title"><FiScissors /> Trim video</span>
                    <FiChevronRight className="chevron-icon" />
                  </button>
                  {activeAccordion === 'trim' && (
                    <div className="reel-accordion-content">
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Select trim range (seconds):</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Start</label>
                          <input
                            type="number"
                            className="form-input"
                            value={trimRange.start}
                            onChange={e => setTrimRange({ ...trimRange, start: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>End</label>
                          <input
                            type="number"
                            className="form-input"
                            value={trimRange.end}
                            onChange={e => setTrimRange({ ...trimRange, end: parseInt(e.target.value) || 15 })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Closed Captions */}
                <div className={`reel-accordion-item ${activeAccordion === 'captions' ? 'open' : ''}`}>
                  <button type="button" className="reel-accordion-trigger" onClick={() => toggleAccordion('captions')}>
                    <span className="reel-accordion-title"><FiType /> Closed captions</span>
                    <FiChevronRight className="chevron-icon" />
                  </button>
                  {activeAccordion === 'captions' && (
                    <div className="reel-accordion-content">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={hasCaptions}
                          onChange={e => setHasCaptions(e.target.checked)}
                        />
                        Auto-generate captions from audio
                      </label>
                    </div>
                  )}
                </div>

                {/* Audio description */}
                <div className={`reel-accordion-item ${activeAccordion === 'audiodesc' ? 'open' : ''}`}>
                  <button type="button" className="reel-accordion-trigger" onClick={() => toggleAccordion('audiodesc')}>
                    <span className="reel-accordion-title"><FiDisc /> Audio description</span>
                    <FiChevronRight className="chevron-icon" />
                  </button>
                  {activeAccordion === 'audiodesc' && (
                    <div className="reel-accordion-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>Viewers can listen to an audio description of your content.</p>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={() => setHasAudioDesc(!hasAudioDesc)}>
                        <FiUpload size={14} /> {hasAudioDesc ? '✔️ Audio description uploaded' : 'Upload audio description'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Music Overlay */}
                <div className={`reel-accordion-item ${activeAccordion === 'music' ? 'open' : ''}`}>
                  <button type="button" className="reel-accordion-trigger" onClick={() => toggleAccordion('music')}>
                    <span className="reel-accordion-title"><FiMusic /> Music</span>
                    <FiChevronRight className="chevron-icon" />
                  </button>
                  {activeAccordion === 'music' && (
                    <div className="reel-accordion-content">
                      <select
                        className="form-input"
                        value={musicTrack}
                        onChange={e => setMusicTrack(e.target.value)}
                      >
                        {PRESET_MUSIC.map(m => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Category Selection */}
                <div className={`reel-accordion-item ${activeAccordion === 'category' ? 'open' : ''}`}>
                  <button type="button" className="reel-accordion-trigger" onClick={() => toggleAccordion('category')}>
                    <span className="reel-accordion-title"><FiSliders /> Category</span>
                    <FiChevronRight className="chevron-icon" />
                  </button>
                  {activeAccordion === 'category' && (
                    <div className="reel-accordion-content">
                      <select
                        className="form-input"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                      >
                        {['Funny', 'Comedy', 'Gaming', 'Music', 'Tech', 'Travel'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrevStep}>Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePublish} id="submit-reel-btn-modal">Next</button>
              </div>
            </aside>

            {/* Right video Preview */}
            <main className="reel-editor-preview-pane">
              <span className="story-preview-label">Preview</span>
              <div className="reel-editor-preview-frame">
                <video
                  src={videoUrl}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  autoPlay
                  loop
                  muted
                />
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateReelModal;
