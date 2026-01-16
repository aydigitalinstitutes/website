import '../App.css';
import { useNavigate } from 'react-router-dom';

const Courses = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: 'CCC',
      description: 'Course on Computer Concepts for essential digital literacy. Covers basics of computer hardware, software, and internet usage.',
      fee: '₹2,500'
    },
    {
      id: 2,
      title: 'DCA',
      description: 'Diploma in Computer Applications. A comprehensive course covering office automation, operating systems, and basic programming.',
      fee: '₹4,500'
    },
    {
      id: 3,
      title: 'ADCA',
      description: 'Advanced Diploma in Computer Applications. Deep dive into programming, database management, web design, and advanced office tools.',
      fee: '₹8,000'
    },
    {
      id: 4,
      title: 'MS Office',
      description: 'Master the essential office suite: Word, Excel, PowerPoint, and Outlook for professional documentation and data management.',
      fee: '₹2,000'
    },
    {
      id: 5,
      title: 'Internet & Digital Skills',
      description: 'Learn safe browsing, email etiquette, online payments, filling government forms, and effective digital communication.',
      fee: '₹1,500'
    },
    {
      id: 6,
      title: 'Basic Computer Training',
      description: 'Perfect starting point for beginners. Learn typing, file management, and how to operate a computer with confidence.',
      fee: '₹1,200'
    }
  ];

  const handleApply = (courseName) => {
    navigate('/enroll', { state: { selectedCourse: courseName } });
  };

  return (
    <div className="page-content">
      <div className="section-inner">
        <h2>Courses We Offer</h2>
        <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-gray)' }}>
          Explore our wide range of computer courses designed for all skill levels.
        </p>
        
        <div className="cards">
          {courses.map((course) => (
            <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>{course.title}</h3>
              <p style={{ flex: 1 }}>{course.description}</p>
              
              <div style={{ 
                margin: '1.5rem 0 1rem', 
                padding: '0.75rem', 
                background: '#f3f4f6', 
                borderRadius: '0.5rem',
                textAlign: 'center',
                fontWeight: '600',
                color: 'var(--primary)'
              }}>
                Fee: {course.fee}
              </div>

              <button 
                className="btn primary small" 
                style={{ width: '100%' }}
                onClick={() => handleApply(course.title)}
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
