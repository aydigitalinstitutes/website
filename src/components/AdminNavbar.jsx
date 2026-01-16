import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ 
      background: '#1f2937', 
      color: 'white', 
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #374151'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <span style={{ fontWeight: 'bold', color: '#9ca3af' }}>Admin Console</span>
          <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
          <Link to="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none' }}>Dashboard</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.9rem' }}>
            View Site
          </Link>
          <button 
            onClick={handleLogout}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
