import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css'; // Using existing styles

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [brandSettings, setBrandSettings] = useState({
    brand_name: 'AY Digital Institute',
    brand_logo: '',
    brand_display: 'both'
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
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
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>
          
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
          </div>
          
          <button type="submit" className="btn primary full-width">
            Sign In
          </button>
          
          <p style={{ marginTop: '1.5rem', marginBottom: 0 }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
