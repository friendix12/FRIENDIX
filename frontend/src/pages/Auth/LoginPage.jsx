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
        {/* Left Side: Brand & Hero Image */}
        <div className="auth-hero-col">
          <div className="auth-brand-wrap">
            <h1 className="brand-name">friendix</h1>
            <p className="brand-tagline">Explore the things you love.</p>
          </div>
          <div className="login-collage-wrap">
            <img 
              src="/src/assets/login_hero.png" 
              alt="Explore the things you love" 
              className="login-hero-img animate-fadeIn" 
            />
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="auth-card-col animate-slideUp">
          <div className="auth-card">
            <h2 className="auth-card-title">Log in to Friendix</h2>
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
                  className="auth-input"
                  placeholder="Email address or mobile number"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
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

              <button
                id="login-submit"
                type="submit"
                className="btn btn-primary auth-submit btn-lg"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>

              <div className="auth-forgot">
                <Link to="/forgot-password" className="auth-link">Forgotten password?</Link>
              </div>

              <div className="auth-divider"><span>or</span></div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  id="create-account-btn"
                  type="button"
                  className="auth-create-btn"
                  onClick={() => navigate('/signup')}
                >
                  Create new account
                </button>
              </div>
            </form>
          </div>

          <div className="auth-footer">
            <Link to="/signup" className="auth-footer-link" style={{ fontWeight: 'bold', textDecoration: 'none' }}>Create a Page</Link> for a celebrity, brand or business.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
