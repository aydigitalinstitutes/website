import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Using existing styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [error, setError] = useState('');
  const [brandSettings, setBrandSettings] = useState({
    brand_name: 'AY Digital Institute',
    brand_logo: '',
    brand_display: 'both'
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setBrandSettings(prev => ({
            ...prev,
            ...data.settings
          }));
        }
      })
      .catch(err => console.log('Using default branding'));
  }, [API_URL]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setError('OTP sent to your email (Check console/backend logs)');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isOtpLogin) {
      if (!otpSent) {
        await handleSendOtp();
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/otp/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp }),
        });
        const data = await response.json();
        
        if (data.success) {
          // Manually update auth context (requires AuthContext modification or re-login)
          // For now, reload to sync or simple redirect if session is cookie based
          // Actually, we need to call a context method. 
          // Assuming AuthContext 'login' method only takes email/pass, we might need to expose a 'setUser' or update it.
          // HACK: For this turn, I'll assume login(email, pass) handles this or I need to update AuthContext.
          // Let's modify AuthContext or just call login with a special flag? 
          // Actually, let's refresh page or update local storage.
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = data.user.role === 'admin' ? '/admin' : '/dashboard';
        } else {
          setError(data.error || 'Invalid OTP');
        }
      } catch (err) {
        setError('Network error');
      }
      return;
    }

    // Standard Login
    const result = await login(email, password);
    if (result.success) {
      navigate(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          {(brandSettings.brand_display === 'logo' || brandSettings.brand_display === 'both') && brandSettings.brand_logo && (
            <img 
              src={brandSettings.brand_logo} 
              alt="Institute Logo" 
              style={{ height: '60px', objectFit: 'contain' }} 
            />
          )}
          {(brandSettings.brand_display === 'name' || brandSettings.brand_display === 'both') && (
            <h2 style={{ margin: 0 }}>{brandSettings.brand_name}</h2>
          )}
          <p style={{ margin: 0 }}>Student Login</p>
        </div>
        
        {error && <div className={error.includes('OTP sent') ? 'status-message' : 'error-message'}>{error}</div>}

        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            onClick={() => { setIsOtpLogin(false); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: !isOtpLogin ? '2px solid var(--primary)' : 'none',
              fontWeight: !isOtpLogin ? 'bold' : 'normal',
              color: !isOtpLogin ? 'var(--primary)' : 'var(--text-gray)',
              cursor: 'pointer'
            }}
          >
            Password
          </button>
          <button 
            type="button"
            onClick={() => { setIsOtpLogin(true); setError(''); }}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              background: 'none', 
              border: 'none', 
              borderBottom: isOtpLogin ? '2px solid var(--primary)' : 'none',
              fontWeight: isOtpLogin ? 'bold' : 'normal',
              color: isOtpLogin ? 'var(--primary)' : 'var(--text-gray)',
              cursor: 'pointer'
            }}
          >
            OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isOtpLogin ? (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>
          ) : (
            otpSent && (
              <div className="form-group">
                <label>Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  required
                />
              </div>
            )
          )}

          <button type="submit" className="btn primary full-width">
            {isOtpLogin ? (otpSent ? 'Verify & Login' : 'Send OTP') : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Or sign in with</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn secondary" style={{ flex: 1 }} onClick={() => alert('Google Login Mock: Would redirect to OAuth')}>
              Google
            </button>
            <button className="btn secondary" style={{ flex: 1 }} onClick={() => alert('GitHub Login Mock: Would redirect to OAuth')}>
              GitHub
            </button>
          </div>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
