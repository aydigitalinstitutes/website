import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Enroll from './pages/Enroll';
import About from './pages/About';
import Courses from './pages/Courses';
import Contact from './pages/Contact';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Footer from './components/Footer';
import AdminNavbar from './components/AdminNavbar';
import './App.css';

// Separate the Home content into a component
const Home = ({ settings }) => {
  const [showContact, setShowContact] = useState(false);

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-kicker">Computer Education Center</p>
          <h1>Learn Digital. Build Future.</h1>
          <p className="hero-text">
            AY Digital Institute is a professional computer education center
            offering CCC, DCA, ADCA, and practical digital skills for
            students and job seekers.
          </p>
          <div className="hero-actions">
            <Link to="/courses" className="btn primary">
              View Courses
            </Link>
            <Link to="/enroll" className="btn secondary">
              Enroll Now
            </Link>
          </div>
        </div>
      </section>

      <section className="section highlight">
        <div className="section-inner">
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome to AY Digital Institute</h2>
          <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
             <div className="card" style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
               <h3>Expert Faculty</h3>
               <p>Learn from experienced professionals dedicated to your success.</p>
             </div>
             <div className="card" style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💻</div>
               <h3>Practical Learning</h3>
               <p>Hands-on training with modern computer labs and real-world projects.</p>
             </div>
             <div className="card" style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📜</div>
               <h3>Certified Courses</h3>
               <p>Government recognized certifications to boost your career prospects.</p>
             </div>
          </div>
        </div>
      </section>
      
      <div className={`floating-contact-container ${showContact ? 'active' : ''}`}>
        {showContact && (
          <div className="floating-options">
            <a
              href={`https://wa.me/${settings.whatsapp?.replace(/[^0-9]/g, '')}`}
              className="btn whatsapp floating-btn option"
              target="_blank"
              rel="noreferrer"
              title="WhatsApp"
            >
              WA
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="btn email floating-btn option"
              title="Email"
            >
              @
            </a>
            <a href={`tel:${settings.phone}`} className="btn call floating-btn option" title="Call">
              📞
            </a>
          </div>
        )}
        
        <button 
          className="btn primary floating-btn main-toggle"
          onClick={() => setShowContact(!showContact)}
        >
          {showContact ? '✕' : '💬'}
        </button>
      </div>
    </>
  );
};

function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [settings, setSettings] = useState({
    email: 'anshulyadav32@icloud.com',
    phone: '',
    whatsapp: '',
    address: ''
  });
  const [menuItems, setMenuItems] = useState([]);

  // Fetch settings on mount
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (data.settings.menu_items) {
            try {
              setMenuItems(JSON.parse(data.settings.menu_items));
            } catch (e) {
              console.error('Failed to parse menu items');
            }
          }
        }
      })
      .catch(err => console.log('Using default settings'));
  }, []);

  // Dynamic Nav Links
  const navLinks = menuItems.length > 0 ? menuItems : [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Courses', path: '/courses' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div className="site">
      {user && user.role === 'admin' && <AdminNavbar />}
      
      <header className="site-header">
        <Link to="/" className="logo-text">{settings.brand_name || 'AY Digital Institute'}</Link>
        <nav className="nav">
          {navLinks.map((link, idx) => (
            <Link key={idx} to={link.path}>{link.label}</Link>
          ))}
          
          {user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="btn secondary small">Admin</Link>
              ) : (
                <Link to="/dashboard" className="btn secondary small">Dashboard</Link>
              )}
            </>
          ) : (
            <Link to="/login" className="btn secondary small">Login</Link>
          )}
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <Footer settings={settings} />
    </div>
  );
}

export default App;
