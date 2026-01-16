import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../App.css';

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setAddress(user.address || '');
      setPhone(user.phone || '');
    }
  }, [user, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('Updating...');
    
    const result = await updateProfile(address, phone);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } else {
      setMessage('Error: ' + result.error);
    }
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      <div className="section-inner">
        <div className="dashboard-header">
          <h2>Welcome, {user.name}</h2>
          <button onClick={() => { logout(); navigate('/'); }} className="btn secondary">
            Logout
          </button>
        </div>
        
        <div className="dashboard-grid">
          <div className="main-content">
             <div className="cards">
              <div className="card">
                <h3>My Courses</h3>
                <p>Access your enrolled courses and materials.</p>
              </div>
              <div className="card">
                <h3>Assignments</h3>
                <p>Check pending assignments and submit work.</p>
              </div>
            </div>
          </div>
          
          <div className="sidebar">
            <div className="card profile-card">
              <h3>My Profile</h3>
              
              {!isEditing ? (
                <div className="profile-view">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Phone:</strong> {user.phone || 'Not set'}</p>
                  <p><strong>Address:</strong> {user.address || 'Not set'}</p>
                  
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="btn primary small"
                    style={{marginTop: '1rem'}}
                  >
                    Edit Contact Info
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="profile-form">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address</label>
                    <textarea 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Your full address"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn primary small">Save</button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="btn secondary small"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              
              {message && <p className="status-message">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
