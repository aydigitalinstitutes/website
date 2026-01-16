import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    email: '',
    phone: '',
    whatsapp: '',
    address: ''
  });
  const [message, setMessage] = useState('');

  // Fetch API URL from env or default
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    // Fetch current settings
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, [user, navigate, API_URL]);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Updating...');

    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage('Settings updated successfully!');
        // Ideally trigger a refresh in App.jsx, but reload works for now
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage('Error updating settings');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="dashboard-page">
      <div className="section-inner">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button onClick={() => { logout(); navigate('/'); }} className="btn secondary">
            Logout
          </button>
        </div>

        <div className="login-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>Site Configuration</h3>
          <p>Update contact details visible on the website.</p>

          {message && <p className={message.includes('Error') ? 'error-message' : 'status-message'}>{message}</p>}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Call)</label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                value={settings.whatsapp}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Physical Address</label>
              <textarea
                name="address"
                rows="3"
                value={settings.address}
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="btn primary full-width">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
