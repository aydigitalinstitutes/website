import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Enroll = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: 'CCC',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });

  // Pre-fill if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const courses = [
    'CCC', 'DCA', 'ADCA', 'MS Office', 'Internet & Digital Skills', 'Basic Computer Training'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', msg: 'Submitting...' });

    const API_URL = import.meta.env.VITE_API_URL || '/api';

    try {
      const response = await fetch(`${API_URL}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        setStatus({ type: 'success', msg: 'Enrollment successful! We will contact you soon.' });
        // Optional: Redirect home after a few seconds
        setTimeout(() => navigate('/'), 3000);
      } else {
        setStatus({ type: 'error', msg: data.error || 'Submission failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Network error. Please try again.' });
    }
  };

  return (
    <div className="login-page">
      <div className="login-container" style={{ maxWidth: '500px' }}>
        <h2>Course Enrollment</h2>
        <p>Start your journey with AY Digital Institute</p>

        {status.msg && (
          <div className={status.type === 'error' ? 'error-message' : 'status-message'}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91..."
              required
            />
          </div>

          <div className="form-group">
            <label>Select Course</label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}
            >
              {courses.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Message (Optional)</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              placeholder="Any specific queries?"
            ></textarea>
          </div>

          <button type="submit" className="btn primary full-width">
            Submit Enrollment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Enroll;
