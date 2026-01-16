import { useState, useEffect } from 'react';

const MenuSettings = ({ settings, API_URL, setMessage }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (settings.menu_items) {
      try {
        const items = JSON.parse(settings.menu_items);
        // Ensure legacy items have new properties
        const normalizedItems = items.map(item => ({
          ...item,
          visible: item.visible !== undefined ? item.visible : true,
          fixed: item.fixed !== undefined ? item.fixed : false
        }));
        setMenuItems(normalizedItems);
      } catch (e) {
        setMenuItems([]);
      }
    }
  }, [settings]);

  const addMenuItem = () => {
    setMenuItems([...menuItems, { label: 'New Link', path: '/', visible: true, fixed: false }]);
  };

  const updateMenuItem = (index, field, value) => {
    // Validation for label
    if (field === 'label') {
      if (value.length > 20) {
        setError('Label must be under 20 characters');
        return;
      }
      // Simple regex: Allow letters, numbers, spaces, and hyphens
      if (!/^[a-zA-Z0-9\s-]*$/.test(value)) {
        setError('Label contains invalid characters');
        return;
      }
      setError('');
    }

    const newItems = [...menuItems];
    newItems[index][field] = value;
    setMenuItems(newItems);
  };

  const toggleVisibility = (index) => {
    const newItems = [...menuItems];
    newItems[index].visible = !newItems[index].visible;
    setMenuItems(newItems);
  };

  const removeMenuItem = (index) => {
    if (menuItems[index].fixed) return; // Double check protection
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error) {
      setMessage('Please fix validation errors');
      return;
    }
    setMessage('Updating Menu...');

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
      
      if (!response.ok) throw new Error('Update failed');

      const data = await response.json();
      if (data.success) {
        setMessage('Menu updated successfully!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage('Error updating menu');
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0 }}>Navigation Menu</h4>
          <button type="button" onClick={addMenuItem} className="btn secondary small" style={{ fontSize: '0.8rem' }}>+ Add Link</button>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}

        {menuItems.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginBottom: '0.75rem', 
            alignItems: 'center',
            padding: '0.75rem',
            background: item.fixed ? '#eff6ff' : 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            opacity: item.visible ? 1 : 0.6
          }}>
            {/* Visibility Toggle */}
            <button 
              type="button" 
              onClick={() => toggleVisibility(index)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '1.2rem',
                padding: '0 0.5rem'
              }}
              title={item.visible ? "Hide Item" : "Show Item"}
            >
              {item.visible ? '👁️' : '🚫'}
            </button>

            {/* Label Input */}
            <input 
              type="text" 
              value={item.label} 
              onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
              placeholder="Label"
              style={{ flex: 1, border: '1px solid #d1d5db', padding: '0.5rem', borderRadius: '4px' }}
            />

            {/* Path Input (Read-only if fixed) */}
            <input 
              type="text" 
              value={item.path} 
              onChange={(e) => updateMenuItem(index, 'path', e.target.value)}
              placeholder="Path (e.g. /about)"
              readOnly={item.fixed}
              title={item.fixed ? "Fixed System Link" : "Editable Link"}
              style={{ 
                flex: 2, 
                border: '1px solid #d1d5db', 
                padding: '0.5rem', 
                borderRadius: '4px',
                background: item.fixed ? '#f3f4f6' : 'white',
                color: item.fixed ? '#6b7280' : 'black',
                cursor: item.fixed ? 'not-allowed' : 'text'
              }}
            />

            {/* Reorder Controls */}
            <div style={{ display: 'flex', gap: '2px' }}>
              <button type="button" onClick={() => moveMenuItem(index, 'up')} disabled={index === 0} style={{ padding: '0.5rem', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px 0 0 4px' }}>↑</button>
              <button type="button" onClick={() => moveMenuItem(index, 'down')} disabled={index === menuItems.length - 1} style={{ padding: '0.5rem', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '0 4px 4px 0' }}>↓</button>
            </div>

            {/* Remove Button (Hidden for fixed items) */}
            {item.fixed ? (
              <div style={{ width: '32px', textAlign: 'center', color: '#6b7280', fontSize: '0.8rem' }} title="Fixed Item">🔒</div>
            ) : (
              <button type="button" onClick={() => removeMenuItem(index)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '32px' }}>✕</button>
            )}
          </div>
        ))}
        {menuItems.length === 0 && <p style={{ color: '#666', fontStyle: 'italic' }}>No menu items. Add one to get started.</p>}
      </div>
      <button type="submit" className="btn primary full-width">Save Menu Changes</button>
    </form>
  );
};

export default MenuSettings;
