import '../App.css';

const About = () => {
  return (
    <div className="page-content">
      <div className="section-inner">
        <h2>About Us</h2>
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            AY Digital Institute is dedicated to providing quality computer
            education with a focus on practical learning. We offer CCC, DCA,
            and advanced computer courses designed to build strong digital
            foundations and career-ready skills for students.
          </p>
          <p style={{ fontSize: '1.1rem' }}>
            Our mission is to bridge the digital divide by offering affordable, 
            high-quality technical education to students and job seekers in our community.
            With experienced faculty and a hands-on approach, we ensure every student 
            gains the confidence to succeed in the digital world.
          </p>
        </div>

        <section id="why-us" className="section highlight" style={{ marginTop: '3rem', borderRadius: '1rem' }}>
          <div className="section-inner">
            <h2 style={{ fontSize: '1.8rem' }}>Why Choose AY Digital Institute?</h2>
            <ul className="list">
              <li>Practical training with real-world focus.</li>
              <li>Experienced and supportive faculty.</li>
              <li>Government and career-oriented computer courses.</li>
              <li>Friendly learning environment for beginners.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
