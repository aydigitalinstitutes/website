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
    address: '',
    brand_name: 'AY Digital Institute',
    brand_logo: '',
    brand_display: 'both'
  });
  const [menuItems, setMenuItems] = useState([]);
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
          if (data.settings.menu_items) {
            try {
              setMenuItems(JSON.parse(data.settings.menu_items));
            } catch (e) {
              setMenuItems([]);
            }
          }
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

  const addMenuItem = () => {
    setMenuItems([...menuItems, { label: 'New Link', path: '/' }]);
  };

  const updateMenuItem = (index, field, value) => {
    const newItems = [...menuItems];
    newItems[index][field] = value;
    setMenuItems(newItems);
  };

  const removeMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const moveMenuItem = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menuItems.length - 1) return;
    
    const newItems = [...menuItems];
    const item = newItems[index];
    newItems.splice(index, 1);
    newItems.splice(direction === 'up' ? index - 1 : index + 1, 0, item);
    setMenuItems(newItems);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) { // Increased limit to 2MB (backend now supports 10MB)
        setMessage('Error: Image size too large (max 2MB)');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          brand_logo: reader.result
        }));
      };
      reader.readAsDataURL(file);
      
      // Clear input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Updating...');

    // Combine settings with current menu items
    const finalSettings = {
      ...settings,
      menu_items: JSON.stringify(menuItems)
    };

    try {
      const response = await fetch(`${API_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: finalSettings }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Update failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setMessage('Settings updated successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage('Error updating settings');
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || 'Network error');
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
            
            {/* Menu Management Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Navigation Menu</h4>
                <button type="button" onClick={addMenuItem} className="btn secondary small" style={{ fontSize: '0.8rem' }}>+ Add Link</button>
              </div>

              {menuItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    value={item.label} 
                    onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                    placeholder="Label"
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="text" 
                    value={item.path} 
                    onChange={(e) => updateMenuItem(index, 'path', e.target.value)}
                    placeholder="Path (e.g. /about)"
                    style={{ flex: 2 }}
                  />
                  <button type="button" onClick={() => moveMenuItem(index, 'up')} disabled={index === 0} style={{ padding: '0.5rem', cursor: 'pointer' }}>↑</button>
                  <button type="button" onClick={() => moveMenuItem(index, 'down')} disabled={index === menuItems.length - 1} style={{ padding: '0.5rem', cursor: 'pointer' }}>↓</button>
                  <button type="button" onClick={() => removeMenuItem(index)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
              {menuItems.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No menu items. Add one to get started.</p>}
            </div>

            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <h4 style={{ marginBottom: '1rem', marginTop: 0 }}>Branding & Logo</h4>
              
              <div className="form-group">
                <label>Brand Name</label>
                <input
                  type="text"
                  name="brand_name"
                  value={settings.brand_name || ''}
                  onChange={handleChange}
                  placeholder="Institute Name"
                />
              </div>

              <div className="form-group">
                <label>Upload Logo (Max 500KB)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ padding: '0.5rem' }}
                />
              </div>

              {settings.brand_logo && (
                <div style={{ margin: '1rem 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Logo Preview:</p>
                  <img 
                    src={settings.brand_logo} 
                    alt="Logo Preview" 
                    style={{ maxHeight: '60px', maxWidth: '100%', objectFit: 'contain' }} 
                  />
                </div>
              )}

              <div className="form-group">
                <label>Display Mode</label>
                <select
                  name="brand_display"
                  value={settings.brand_display || 'both'}
                  onChange={handleChange}
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
                >
                  <option value="name">Brand Name Only</option>
                  <option value="logo">Logo Only</option>
                  <option value="both">Both Name & Logo</option>
                </select>
              </div>

              {/* Live Preview */}
              <div style={{ marginTop: '1.5rem', padding: '1rem', border: '1px dashed #ccc', borderRadius: '0.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Login Page Header Preview:</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  {(settings.brand_display === 'logo' || settings.brand_display === 'both') && settings.brand_logo && (
                     <img src={settings.brand_logo} alt="Logo" style={{ height: '40px' }} />
                  )}
                  {(settings.brand_display === 'name' || settings.brand_display === 'both') && (
                     <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>{settings.brand_name}</span>
                  )}
                </div>
              </div>
            </div>

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
