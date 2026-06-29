import { useEffect, useCallback } from 'react';
import { FiX, FiTrendingUp, FiBarChart2, FiUsers, FiGlobe } from 'react-icons/fi';
import './ProfessionalModeModal.css';

const ProfessionalModeModal = ({ isOpen, onClose, onConfirm, mode = 'on', loading = false }) => {
  const isTurningOn = mode === 'on';

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay pro-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pro-modal-container">
        <div className="pro-modal-header">
          <button className="pro-modal-close" onClick={onClose}><FiX size={16} /></button>
          <div className={`pro-modal-icon ${isTurningOn ? 'on' : 'off'}`}>
            <FiTrendingUp size={30} />
          </div>
          <h2 className="pro-modal-title">
            {isTurningOn ? 'Turn on Professional Mode?' : 'Turn off Professional Mode?'}
          </h2>
          <p className="pro-modal-subtitle">
            {isTurningOn
              ? 'Grow your audience and unlock powerful tools to manage your presence.'
              : 'You will lose access to insights, analytics, and follower features.'}
          </p>
        </div>

        <div className="pro-modal-divider" />

        <div className="pro-modal-features">
          {isTurningOn ? (
            <>
              <div className="pro-modal-feature">
                <div className="pro-modal-feature-icon purple"><FiBarChart2 size={18} /></div>
                <div className="pro-modal-feature-text">
                  <h4>Professional Dashboard</h4>
                  <p>Track post performance, engagement, and audience growth.</p>
                </div>
              </div>
              <div className="pro-modal-feature">
                <div className="pro-modal-feature-icon blue"><FiUsers size={18} /></div>
                <div className="pro-modal-feature-text">
                  <h4>Followers & Insights</h4>
                  <p>People can follow you. See who's engaging with your content.</p>
                </div>
              </div>
              <div className="pro-modal-feature">
                <div className="pro-modal-feature-icon green"><FiGlobe size={18} /></div>
                <div className="pro-modal-feature-text">
                  <h4>Public Profile</h4>
                  <p>Your posts can reach a wider audience beyond your friends.</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="pro-modal-feature">
                <div className="pro-modal-feature-icon orange"><FiBarChart2 size={18} /></div>
                <div className="pro-modal-feature-text">
                  <h4>Lose Analytics Access</h4>
                  <p>Professional dashboard and content insights will no longer be available.</p>
                </div>
              </div>
              <div className="pro-modal-feature">
                <div className="pro-modal-feature-icon orange"><FiUsers size={18} /></div>
                <div className="pro-modal-feature-text">
                  <h4>Followers Feature Removed</h4>
                  <p>Your followers list will be hidden. Friends stay as friends.</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pro-modal-divider" />

        <div className="pro-modal-actions">
          <button className="pro-modal-btn pro-modal-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={`pro-modal-btn pro-modal-btn-confirm ${!isTurningOn ? 'turning-off' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? 'Processing...'
              : isTurningOn
                ? 'Turn On'
                : 'Turn Off'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalModeModal;
