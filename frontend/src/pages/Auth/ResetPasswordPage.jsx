import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiLock, FiUser } from 'react-icons/fi';
import './Auth.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('change'); // 'change' or 'recovery'
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email || !newPassword || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const payload = {
      email,
      newPassword,
      type: activeMode
    };

    if (activeMode === 'change') {
      if (!oldPassword) {
        setError('Please enter your current password.');
        return;
      }
      payload.oldPassword = oldPassword;
    } else {
      if (!firstName.trim() || !lastName.trim()) {
        setError('Please enter your full registered name.');
        return;
      }
      payload.firstName = firstName.trim();
      payload.lastName = lastName.trim();
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const res = await authAPI.resetPassword(payload);
      setSuccess(res.message || 'Password successfully updated! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to verify account details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="auth-bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="signup-modal animate-slideUp" style={{ maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-1.5px' }}>friendix</span>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 className="signup-title">Reset your password</h2>
          <p className="signup-subtitle">Choose how you want to reset your account password.</p>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px', background: '#f0f2f5', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeMode === 'change' ? '#ffffff' : 'transparent',
              color: activeMode === 'change' ? 'var(--primary)' : '#65676b',
              boxShadow: activeMode === 'change' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => { setActiveMode('change'); setError(''); setSuccess(''); }}
          >
            <FiLock /> Change Password
          </button>
          <button
            type="button"
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeMode === 'recovery' ? '#ffffff' : 'transparent',
              color: activeMode === 'recovery' ? 'var(--primary)' : '#65676b',
              boxShadow: activeMode === 'recovery' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
            onClick={() => { setActiveMode('recovery'); setError(''); setSuccess(''); }}
          >
            <FiUser /> Account Recovery
          </button>
        </div>

        {error && (
          <div className="auth-error" style={{ marginBottom: '16px' }}>
            <FiAlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-error" style={{ background: '#eafaf1', borderColor: '#c7f3d6', color: '#2ecc71', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleReset} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {activeMode === 'change' ? (
            <div className="form-group">
              <input
                type="password"
                className="auth-input"
                placeholder="Current password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="First name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Surname"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              className="auth-input"
              placeholder="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ paddingRight: '44px' }}
              required
            />
            <button
              type="button"
              className="pass-toggle"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>

          <div className="form-group">
            <input
              type={showPw ? 'text' : 'password'}
              className="auth-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit btn-lg"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <Link to="/login" className="auth-link" style={{ fontWeight: 'bold' }}>Back to Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
