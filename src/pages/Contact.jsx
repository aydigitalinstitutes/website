import { useState, useEffect } from 'react';
import '../App.css';

const Contact = () => {
  const [settings, setSettings] = useState({
    email: 'Loading...',
    phone: 'Loading...',
    whatsapp: '',
    address: 'Loading...'
  });

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

  return (
    <div className="page-content">
      <div className="section-inner">
        <h2>Contact & Admission</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }} className="contact-grid">
          
          <div className="card">
            <h3>Get in Touch</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              Visit our center or contact us to know batch timings, fees, and
              course details. We help students choose the right course based on
              their goals.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📞</span>
                <div>
                  <strong>Phone</strong>
                  <p>{settings.phone}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>📧</span>
                <div>
                  <strong>Email</strong>
                  <p>{settings.email}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💬</span>
                <div>
                  <strong>WhatsApp</strong>
                  <p>{settings.whatsapp}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-board" style={{ marginTop: 0 }}>
            <h3>AY Digital Institute</h3>
            <p>Computer Education Center</p>
            <p style={{ margin: '1.5rem 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
              {settings.address}
            </p>
            <p className="tagline">Learn • Practice • Succeed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
