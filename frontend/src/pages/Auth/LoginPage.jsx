import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import './Auth.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e, demoEmail, demoPw) => {
    e?.preventDefault();
    const loginEmail = demoEmail || email;
    const loginPw = demoPw || password;
    if (!loginEmail || !loginPw) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    const result = await login(loginEmail, loginPw);
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error || 'Login failed. Please check your credentials.');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="auth-container">
        {/* Left Hero */}
        <div className="auth-hero">
          <div className="auth-logo-wrap">
            <img src="/friendix-logo.svg" alt="Friendix" style={{ width: '64px', height: '64px', borderRadius: '16px' }} />
          </div>
          <h1 className="auth-brand">friendix</h1>
          <p className="auth-tagline">Connect with friends and the world around you on Friendix.</p>
        </div>

        {/* Login Card */}
        <div className="auth-card animate-slideUp">
          <form onSubmit={handleLogin} className="auth-form">
            {error && (
              <div className="auth-error">
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="Email address or phone number"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link to="/forgot-password" className="auth-link">Forgotten password?</Link>
            </div>

            <div className="auth-divider"><span>or</span></div>

            <button
              id="create-account-btn"
              type="button"
              className="btn btn-success btn-full btn-lg"
              onClick={() => navigate('/signup')}
            >
              Create new account
            </button>
          </form>

          {/* Demo Logins */}
          <div className="demo-logins">
            <p className="demo-logins-title">Demo Accounts</p>
            <div className="demo-logins-grid">
              {[
                { label: '👑 Admin', email: 'amar@friendix.com', pw: '123456' },
                { label: '👤 User', email: 'rahim@friendix.com', pw: '123456' },
              ].map(d => (
                <button
                  key={d.email}
                  className="demo-login-btn"
                  onClick={() => handleLogin(null, d.email, d.pw)}
                  disabled={loading}
                >
                  <span>{d.label}</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="auth-footer">
            <Link to="/signup" className="auth-footer-link">Create a Page</Link> for a celebrity, brand or business.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
