import { useState } from 'react';

const GeneralSettings = ({ settings, setSettings, API_URL, setMessage }) => {
  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2000000) {
        setMessage('Error: Image size too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, brand_logo: reader.result }));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
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
      
      if (!response.ok) throw new Error('Update failed');

      const data = await response.json();
      if (data.success) {
        setMessage('Settings updated successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage('Error updating settings');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <h4 style={{ marginBottom: '1rem', marginTop: 0 }}>Branding & Logo</h4>
        
        <div className="form-group">
          <label>Brand Name</label>
          <input type="text" name="brand_name" value={settings.brand_name || ''} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Upload Logo (Max 2MB)</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ padding: '0.5rem' }} />
        </div>

        {settings.brand_logo && (
          <div style={{ margin: '1rem 0', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>Logo Preview:</p>
            <img src={settings.brand_logo} alt="Preview" style={{ maxHeight: '60px' }} />
          </div>
        )}

        <div className="form-group">
          <label>Display Mode</label>
          <select name="brand_display" value={settings.brand_display || 'both'} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
            <option value="name">Brand Name Only</option>
            <option value="logo">Logo Only</option>
            <option value="both">Both Name & Logo</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Contact Email</label>
        <input type="email" name="email" value={settings.email} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="text" name="phone" value={settings.phone} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>WhatsApp Number</label>
        <input type="text" name="whatsapp" value={settings.whatsapp} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Physical Address</label>
        <textarea name="address" rows="3" value={settings.address} onChange={handleChange}></textarea>
      </div>

      <button type="submit" className="btn primary full-width">Save Changes</button>
    </form>
  );
};

export default GeneralSettings;
