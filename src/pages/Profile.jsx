import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
  }, [user, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    try {
      const res = await fetch(`${API_URL}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: user.id, 
          phone: formData.phone, 
          address: formData.address 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Profile updated successfully!');
        // Ideally update context user here
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          oldPassword: passwordData.oldPassword, 
          newPassword: passwordData.newPassword 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Change failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <div className="section-inner">
        <div className="dashboard-header">
          <h2>My Profile</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
             {user.role === 'admin' ? (
               <button onClick={() => navigate('/admin')} className="btn secondary">Admin Dashboard</button>
             ) : (
               <button onClick={() => navigate('/dashboard')} className="btn secondary">Dashboard</button>
             )}
             <button onClick={() => { logout(); navigate('/'); }} className="btn secondary">Logout</button>
          </div>
        </div>

        <div className="login-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {message && <div className="status-message">{message}</div>}
          {error && <div className="error-message">{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Profile Info Form */}
            <div>
              <h3>Personal Details</h3>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label>Name (Read Only)</label>
                  <input type="text" value={formData.name} disabled style={{ background: '#f3f4f6' }} />
                </div>
                <div className="form-group">
                  <label>Email (Read Only)</label>
                  <input type="email" value={formData.email} disabled style={{ background: '#f3f4f6' }} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea rows="3" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <button type="submit" className="btn primary full-width">Update Details</button>
              </form>
            </div>

            {/* Change Password Form */}
            <div>
              <h3>Change Password</h3>
              <form onSubmit={handleChangePassword} className="profile-form" style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={passwordData.oldPassword} 
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                    required 
                  />
                </div>
                <button type="submit" className="btn secondary full-width">Change Password</button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
