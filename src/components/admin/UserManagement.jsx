import { useState, useEffect } from 'react';

const UserManagement = ({ API_URL, setMessage }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Reset Password State
  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    fetch(`${API_URL}/users`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
      })
      .catch(() => setMessage('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [API_URL]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`User ${newUser.name} created!`);
        setNewUser({ name: '', email: '', password: '', role: 'student' });
        setShowAddForm(false);
        fetchUsers();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetId, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Password reset successfully!');
        setResetId(null);
        setNewPassword('');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Network error');
    }
  };

  return (
    <div className="user-management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>Registered Users</h3>
        <button className="btn primary small" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateUser} style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h4>Add New User</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn primary full-width" style={{ marginTop: '1rem' }}>Create User</button>
        </form>
      )}

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>ID</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Email</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Role</th>
              <th style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{user.id}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{user.name}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>{user.email}</td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    background: user.role === 'admin' ? '#e0e7ff' : '#ecfccb',
                    color: user.role === 'admin' ? '#3730a3' : '#3f6212'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '0.75rem', borderBottom: '1px solid #e5e7eb' }}>
                  <button 
                    onClick={() => setResetId(user.id)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Reset Password Modal (Simplified inline) */}
      {resetId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '300px' }}>
            <h4>Reset Password for User #{resetId}</h4>
            <input 
              type="text" 
              placeholder="New Password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn primary" onClick={handleResetPassword}>Save</button>
              <button className="btn secondary" onClick={() => { setResetId(null); setNewPassword(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
