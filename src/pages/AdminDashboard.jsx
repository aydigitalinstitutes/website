import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GeneralSettings from '../components/admin/GeneralSettings';
import MenuSettings from '../components/admin/MenuSettings';
import UserManagement from '../components/admin/UserManagement';
import '../App.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [message, setMessage] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || '/api';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.error('Error fetching settings:', err));
  }, [user, navigate, API_URL]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="dashboard-page">
      <div className="section-inner">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <button onClick={() => navigate('/profile')} className="btn secondary">My Profile</button>
             <button onClick={() => { logout(); navigate('/'); }} className="btn secondary">Logout</button>
          </div>
        </div>

        <div className="login-container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
            <button 
              onClick={() => setActiveTab('general')}
              style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'general' ? 'white' : 'transparent', fontWeight: activeTab === 'general' ? 'bold' : 'normal', borderBottom: activeTab === 'general' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
            >
              General Settings
            </button>
            <button 
              onClick={() => setActiveTab('menu')}
              style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'menu' ? 'white' : 'transparent', fontWeight: activeTab === 'menu' ? 'bold' : 'normal', borderBottom: activeTab === 'menu' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
            >
              Navigation Menu
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ flex: 1, padding: '1rem', border: 'none', background: activeTab === 'users' ? 'white' : 'transparent', fontWeight: activeTab === 'users' ? 'bold' : 'normal', borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none', cursor: 'pointer' }}
            >
              User Management
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {message && <p className={message.includes('Error') ? 'error-message' : 'status-message'}>{message}</p>}

            {activeTab === 'general' && (
              <GeneralSettings 
                settings={settings} 
                setSettings={setSettings} 
                API_URL={API_URL} 
                setMessage={setMessage} 
              />
            )}

            {activeTab === 'menu' && (
              <MenuSettings 
                settings={settings} 
                API_URL={API_URL} 
                setMessage={setMessage} 
              />
            )}

            {activeTab === 'users' && (
              <UserManagement 
                API_URL={API_URL} 
                setMessage={setMessage} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
