import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Enroll from './pages/Enroll';
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
            <a href="#courses" className="btn primary">
              View Courses
            </a>
            <Link to="/enroll" className="btn secondary">
              Enroll Now
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="section-inner">
          <h2>About Us</h2>
          <p>
            AY Digital Institute is dedicated to providing quality computer
            education with a focus on practical learning. We offer CCC, DCA,
            and advanced computer courses designed to build strong digital
            foundations and career-ready skills for students.
          </p>
        </div>
      </section>

      <section id="courses" className="section">
        <div className="section-inner">
          <h2>Courses We Offer</h2>
          <div className="cards">
            <div className="card">
              <h3>CCC</h3>
              <p>Course on Computer Concepts for essential digital literacy.</p>
            </div>
            <div className="card">
              <h3>DCA</h3>
              <p>Diploma in Computer Applications for office and IT skills.</p>
            </div>
            <div className="card">
              <h3>ADCA</h3>
              <p>
                Advanced Diploma in Computer Applications for deeper practical
                knowledge.
              </p>
            </div>
            <div className="card">
              <h3>MS Office</h3>
              <p>Hands-on training in Word, Excel, PowerPoint, and more.</p>
            </div>
            <div className="card">
              <h3>Internet & Digital Skills</h3>
              <p>
                Learn safe browsing, email, online forms, and digital
                communication.
              </p>
            </div>
            <div className="card">
              <h3>Basic Computer Training</h3>
              <p>Perfect starting point for beginners to become confident users.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="why-us" className="section highlight">
        <div className="section-inner">
          <h2>Why Choose AY Digital Institute?</h2>
          <ul className="list">
            <li>Practical training with real-world focus.</li>
            <li>Experienced and supportive faculty.</li>
            <li>Government and career-oriented computer courses.</li>
            <li>Friendly learning environment for beginners.</li>
          </ul>
        </div>
      </section>

      <section id="contact" className="section">
        <div className="section-inner">
          <h2>Contact & Admission</h2>
          <p>
            Visit our center or contact us to know batch timings, fees, and
            course details. We help students choose the right course based on
            their goals.
          </p>
          <div className="contact-board">
            <h3>AY Digital Institute</h3>
            <p>Computer Education Center</p>
            <p>{settings.address || 'Loading Address...'}</p>
            <p className="tagline">Learn • Practice • Succeed</p>
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

  // Fetch settings on mount
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || '/api';
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(err => console.log('Using default settings'));
  }, []);

  // Helper to scroll to section if on home page
  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      return; // Or navigate to /#id
    }
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="site">
      <header className="site-header">
        <Link to="/" className="logo-text">AY Digital Institute</Link>
        <nav className="nav">
          <Link to="/" onClick={() => scrollToSection('about')}>About</Link>
          <Link to="/" onClick={() => scrollToSection('courses')}>Courses</Link>
          <Link to="/" onClick={() => scrollToSection('why-us')}>Why Us</Link>
          <Link to="/" onClick={() => scrollToSection('contact')}>Contact</Link>
          
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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/enroll" element={<Enroll />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>AY Digital Institute • Computer Education Center • {settings.email}</p>
      </footer>
    </div>
  );
}

export default App;
