import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiX, FiEye, FiEyeOff, FiAlertCircle, FiChevronRight } from 'react-icons/fi';
import './Auth.css';

const STEP1_FIELDS = [
  { name: 'firstName', label: 'First name', placeholder: 'First name', type: 'text', half: true },
  { name: 'lastName', label: 'Surname', placeholder: 'Surname', type: 'text', half: true },
  { name: 'email', label: 'Mobile number or email address', placeholder: 'Mobile number or email address', type: 'email' },
  { name: 'password', label: 'New password', placeholder: 'New password', type: 'password' },
];

const GENDERS = ['Female', 'Male', 'Custom'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
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

  const validateStep1 = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) return 'Please enter your full name.';
    if (!form.email.trim()) return 'Please enter your email or mobile number.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const validateStep2 = () => {
    if (!form.gender) return 'Please select your gender.';
    return null;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError('');
    setStep(2);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const err = validateStep2();
    if (err) { setError(err); return; }
    setLoading(true); setError('');
    const dob = `${form.day} ${form.month} ${form.year}`;
    const result = await signup({ ...form, dob });
    setLoading(false);
    if (result.success) navigate('/');
    else setError(result.error || 'Something went wrong. Please try again.');
  };

  return (
    <div className="auth-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-bg-blobs">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <div className="signup-modal animate-slideUp">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img src="/friendix-logo.svg" alt="Friendix" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>friendix</span>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 className="signup-title">Create a new account</h2>
          <p className="signup-subtitle">It's quick and easy.</p>
        </div>

        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        {error && (
          <div className="auth-error">
            <FiAlertCircle size={16} /><span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNext} className="auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div className="form-group">
                <input
                  id="signup-firstName"
                  type="text"
                  className="form-input"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={e => updateField('firstName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <input
                  id="signup-lastName"
                  type="text"
                  className="form-input"
                  placeholder="Surname"
                  value={form.lastName}
                  onChange={e => updateField('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <input
                id="signup-email"
                type="email"
                className="form-input"
                placeholder="Mobile number or email address"
                value={form.email}
                onChange={e => updateField('email', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                id="signup-password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="New password"
                value={form.password}
                onChange={e => updateField('password', e.target.value)}
                style={{ paddingRight: '44px' }}
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                {showPw ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <button id="signup-next-btn" type="submit" className="btn btn-primary btn-full btn-lg">
              Next <FiChevronRight size={18} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSignup} className="auth-form">
            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label">
                Date of birth <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 400 }}>Why do we ask for this?</span>
              </label>
              <div className="dob-row">
                <select id="signup-day" className="form-input dob-select" value={form.day} onChange={e => updateField('day', e.target.value)}>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select id="signup-month" className="form-input dob-select" value={form.month} onChange={e => updateField('month', e.target.value)}>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select id="signup-year" className="form-input dob-select" value={form.year} onChange={e => updateField('year', e.target.value)}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">
                Gender <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 400 }}>Why do we ask for this?</span>
              </label>
              <div className="gender-row">
                {GENDERS.map(g => (
                  <label key={g} className={`gender-option ${form.gender === g ? 'selected' : ''}`}>
                    <input
                      id={`signup-gender-${g}`}
                      type="radio"
                      name="gender"
                      value={g}
                      checked={form.gender === g}
                      onChange={e => updateField('gender', e.target.value)}
                    />
                    {g}
                  </label>
                ))}
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              By clicking Sign Up, you agree to our{' '}
              <a href="#" className="auth-link">Terms</a>,{' '}
              <a href="#" className="auth-link">Privacy Policy</a> and{' '}
              <a href="#" className="auth-link">Cookies Policy</a>.
            </p>

            <button id="signup-submit-btn" type="submit" className="btn btn-success btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-full"
              onClick={() => { setStep(1); setError(''); }}
              style={{ marginTop: '8px' }}
            >
              ← Back
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.93rem' }}>Already have an account? </span>
          <Link to="/login" className="auth-link" style={{ fontWeight: 700 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
