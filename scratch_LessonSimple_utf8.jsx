import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import BackNavButton from '../../../components/ui/BackNavButton';

const LessonSimple = () => {
  const { classId, chapterId, lessonId } = useParams();
  const navigate = useNavigate();
  const [lessonData, setLessonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Bß║»t ─æß║ºu tr├▓ ch╞íi (kh├┤ng c├▓n c╞í chß║┐ bß╗Å qua tß╗▒ ─æß╗Öng khi ─æ├ú ─æß╗ìc tr╞░ß╗¢c ─æ├│)
  const handleStartGame = () => {
    navigate(`/gameplay/${classId}/${chapterId}/${lessonId}`);
  };

  useEffect(() => {
    console.log('Fetching lesson...', { classId, chapterId, lessonId });
    console.log('API_URL:', API_URL);
    
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const url = `${API_URL}/lessons/class/${classId}/chapter/${chapterId}/lesson/${lessonId}`;
        console.log('Making request to:', url);
        
        const response = await axios.get(url);
        console.log('Lesson data:', response.data);
        setLessonData(response.data);
        setError(null);

        // Bß╗Å c╞í chß║┐ tß╗▒ ─æß╗Öng chuyß╗ân sang gameplay nß║┐u ─æ├ú ─æß╗ìc tr╞░ß╗¢c ─æ├│
      } catch (err) {
        console.error('Error fetching lesson:', err);
        console.error('Error details:', err.response);
        setError(err.response?.data?.message || 'Kh├┤ng thß╗â tß║úi b├ái hß╗ìc');
      } finally {
        setLoading(false);
      }
    };

    if (classId && chapterId && lessonId) {
      fetchLesson();
    }
  }, [classId, chapterId, lessonId, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#f0f9ff' }}>
        <h2>ΓÅ│ ─Éang tß║úi b├ái hß╗ìc...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#fee' }}>
        <h2 style={{ color: 'red' }}>ΓÜá∩╕Å C├│ lß╗ùi xß║úy ra</h2>
        <p>{error}</p>
        <div style={{ marginTop: '12px', color: '#444' }}>
          <div>Khß║ú n─âng cao l├á dß╗» liß╗çu b├ái hß╗ìc ─æang trß╗æng.</div>
          <div>H├úy chß║íy lß║íi lß╗çnh seed ─æß╗â tß║ío dß╗» liß╗çu mß║½u:</div>
          <pre style={{ background: '#111', color: '#fff', padding: '10px', borderRadius: '6px', display: 'inline-block' }}>npm run seed</pre>
          <div style={{ marginTop: '6px' }}>Sau ─æ├│ F5 trang v├á thß╗¡ lß║íi.</div>
        </div>
        <button style={{ marginTop: '16px' }} onClick={() => navigate('/program/chemistry/dashboard')}>Quay vß╗ü Dashboard</button>
      </div>
    );
  }

  if (!lessonData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>≡ƒôÜ Kh├┤ng t├¼m thß║Ñy b├ái hß╗ìc</h2>
        <button onClick={() => navigate('/program/chemistry/dashboard')}>Quay vß╗ü Dashboard</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '16px' }}>
        <BackNavButton fallbackPath={`/class/${classId}`} />
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{lessonData.title}</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>{lessonData.description}</p>

      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '20px' }}>≡ƒôû L├╜ thuyß║┐t</h2>
        <div dangerouslySetInnerHTML={{ __html: lessonData.theory }} />
        
        {/* N├║t ─æ├ú ─æß╗ìc */}
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={handleStartGame}
            style={{
              padding: '15px 40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            ≡ƒÄ« Bß║»t ─æß║ºu tr├▓ ch╞íi
          </button>
          <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
            Bß║ín cß║ºn ─æß╗ìc nß╗Öi dung tr╞░ß╗¢c rß╗ôi chß╗º ─æß╗Öng chß╗ìn bß║»t ─æß║ºu tr├▓ ch╞íi.
          </p>
        </div>
      </div>

      
    </div>
  );
};

export default LessonSimple;
