import '../App.css';

const Courses = () => {
  return (
    <div className="page-content">
      <div className="section-inner">
        <h2>Courses We Offer</h2>
        <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-gray)' }}>
          Explore our wide range of computer courses designed for all skill levels.
        </p>
        
        <div className="cards">
          <div className="card">
            <h3>CCC</h3>
            <p>Course on Computer Concepts for essential digital literacy. Covers basics of computer hardware, software, and internet usage.</p>
          </div>
          <div className="card">
            <h3>DCA</h3>
            <p>Diploma in Computer Applications. A comprehensive course covering office automation, operating systems, and basic programming.</p>
          </div>
          <div className="card">
            <h3>ADCA</h3>
            <p>
              Advanced Diploma in Computer Applications. Deep dive into programming, database management, web design, and advanced office tools.
            </p>
          </div>
          <div className="card">
            <h3>MS Office</h3>
            <p>Master the essential office suite: Word, Excel, PowerPoint, and Outlook for professional documentation and data management.</p>
          </div>
          <div className="card">
            <h3>Internet & Digital Skills</h3>
            <p>
              Learn safe browsing, email etiquette, online payments, filling government forms, and effective digital communication.
            </p>
          </div>
          <div className="card">
            <h3>Basic Computer Training</h3>
            <p>Perfect starting point for beginners. Learn typing, file management, and how to operate a computer with confidence.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
