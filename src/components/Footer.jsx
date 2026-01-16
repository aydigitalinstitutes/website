import { Link } from 'react-router-dom';
import '../App.css';

const Footer = ({ settings }) => {
  return (
    <footer className="site-footer">
      <div className="footer-content section-inner">
        <div className="footer-section brand">
          <h3>AY Digital Institute</h3>
          <p>
            Empowering students with practical digital skills and computer education. 
            Building the future, one byte at a time.
          </p>
        </div>

        <div className="footer-section links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/courses">Our Courses</Link></li>
            <li><Link to="/enroll">Enroll Now</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h4>Contact Us</h4>
          <p><strong>📍 Address:</strong><br />{settings.address || 'Loading...'}</p>
          <p><strong>📞 Phone:</strong><br />{settings.phone || 'Loading...'}</p>
          <p><strong>📧 Email:</strong><br />{settings.email || 'Loading...'}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AY Digital Institute. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
