import { useState, useEffect } from 'react';

const MenuSettings = ({ settings, API_URL, setMessage }) => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (settings.menu_items) {
      try {
        setMenuItems(JSON.parse(settings.menu_items));
      } catch (e) {
        setMenuItems([]);
      }
    }
  }, [settings]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      <button type="submit" className="btn primary full-width">Save Menu Changes</button>
    </form>
  );
};

export default MenuSettings;
