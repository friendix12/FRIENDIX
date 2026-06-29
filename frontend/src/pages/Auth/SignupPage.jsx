import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import loginHero from '../../assets/login_hero.jpg';
import './Auth.css';

const GENDERS = ['Female', 'Male', 'Custom'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    day: '1', month: 'Jan', year: '2000', gender: '',
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const updateField = (name, value) => setForm(prev => ({ ...prev, [name]: value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('What is your name?');
      return;
    }
    if (!form.email.trim()) {
      setError('You will use this email to log in.');
      return;
    }
    if (form.password.length < 6) {
      setError('Enter a combination of at least 6 numbers and letters.');
      return;
    }
    if (!form.gender) {
      setError('Please choose a gender.');
      return;
    }

    setLoading(true);
    setError('');
    const dob = `${form.day} ${form.month} ${form.year}`;
    const result = await signup({ ...form, dob });
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
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
              src={loginHero} 
              alt="Explore the things you love" 
              className="login-hero-img animate-fadeIn" 
            />
          </div>
        </div>

        {/* Right Side: Signup Card */}
        <div className="auth-card-col animate-slideUp">
          <div className="signup-modal">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 className="signup-title" style={{ textAlign: 'left' }}>Create a new account</h2>
              <p className="signup-subtitle" style={{ textAlign: 'left', marginBottom: '12px' }}>It's quick and easy.</p>
              <div style={{ height: '1px', background: '#dddfe2', margin: '10px 0' }} />
            </div>

            {error && (
              <div className="auth-error" style={{ marginBottom: '16px' }}>
                <FiAlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="auth-form">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={e => updateField('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Surname"
                    value={form.lastName}
                    onChange={e => updateField('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  className="auth-input"
                  placeholder="Mobile number or email address"
                  value={form.email}
                  onChange={e => updateField('email', e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="New password"
                  value={form.password}
                  onChange={e => updateField('password', e.target.value)}
                  style={{ paddingRight: '44px' }}
                  required
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem', color: '#606770', display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  Date of birth <span style={{ cursor: 'pointer', color: '#1877f2' }}>?</span>
                </label>
                <div className="dob-row">
                  <select className="dob-select" value={form.day} onChange={e => updateField('day', e.target.value)}>
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="dob-select" value={form.month} onChange={e => updateField('month', e.target.value)}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="dob-select" value={form.year} onChange={e => updateField('year', e.target.value)}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.78rem', color: '#606770', display: 'flex', gap: '4px', marginBottom: '6px' }}>
                  Gender <span style={{ cursor: 'pointer', color: '#1877f2' }}>?</span>
                </label>
                <div className="gender-options">
                  {GENDERS.map(g => (
                    <label key={g} className={`gender-option ${form.gender === g ? 'selected' : ''}`}>
                      <span>{g}</span>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={form.gender === g}
                        onChange={e => updateField('gender', e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '0.7rem', color: '#777777', lineHeight: 1.4, margin: '8px 0 12px 0' }}>
                People who use our service may have uploaded your contact information to Facebook. <a href="#" className="auth-link" style={{ fontSize: '0.7rem' }}>Learn more</a>.
                <br /><br />
                By clicking Sign Up, you agree to our <a href="#" className="auth-link" style={{ fontSize: '0.7rem' }}>Terms</a>, <a href="#" className="auth-link" style={{ fontSize: '0.7rem' }}>Privacy Policy</a> and <a href="#" className="auth-link" style={{ fontSize: '0.7rem' }}>Cookies Policy</a>. You may receive SMS notifications from us and can opt out at any time.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="submit" className="auth-create-btn" disabled={loading} style={{ background: '#00a400', color: 'white', padding: '10px 48px', fontSize: '1.15rem' }}>
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
              <Link to="/login" className="auth-link" style={{ fontWeight: 'bold' }}>Already have an account?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
