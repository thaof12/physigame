import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../config/api';
import { useAuth } from '../../../contexts/AuthContext';
import Card from '../../../components/ui/Card';
import ProgressBar from '../../../components/ui/ProgressBar';

const ClassDashboard = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [lessonsProgress, setLessonsProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [unlockedLessonIds, setUnlockedLessonIds] = useState(new Set());

  const gradeInfo = {
    8: { title: 'H├│a hß╗ìc 8', color: 'blue', icon: '≡ƒº¬' },
    9: { title: 'H├│a hß╗ìc 9', color: 'green', icon: 'ΓÜù∩╕Å' },
    10: { title: 'H├│a hß╗ìc 10', color: 'purple', icon: '≡ƒö¼' },
    11: { title: 'H├│a hß╗ìc 11', color: 'orange', icon: 'ΓÜ¢∩╕Å' },
    12: { title: 'H├│a hß╗ìc 12', color: 'pink', icon: '≡ƒÄô' }
  };

  const currentGrade = gradeInfo[classId] || gradeInfo[8];

  // Fetch lessons for this class
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/lessons/grouped`);
        
        // Filter lessons for current class
        const classData = response.data.find(c => c.classId === parseInt(classId));
        
        if (classData) {
          setChapters(classData.chapters);
        } else {
          setChapters([]);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [classId]);

  // Fetch user progress
  useEffect(() => {
    const fetchProgress = async () => {
      const userUid = user?.firebaseUid || user?.uid;
      if (!userUid) return;
      
      try {
        const response = await axios.get(`${API_URL}/users/firebase/${userUid}`);
        const userData = response.data;
        
        // Find chemistry program
        const chemProgram = userData.programs?.find(p => p.programId === 'chemistry');
        
        if (!chemProgram) {
          console.log('No chemistry program found for user');
          return;
        }
        
        // Parse completedLessons from format [8001, 8002] to lessonId map
        const progressMap = {};
        const currentClassId = parseInt(classId);
        
        // Get lessonStars Map (convert from object if needed)
        const lessonStarsMap = chemProgram.progress.lessonStars || {};
        
        console.log('≡ƒöì Debug lessonStars structure:', {
          raw: chemProgram.progress.lessonStars,
          type: typeof chemProgram.progress.lessonStars,
          keys: Object.keys(lessonStarsMap),
          values: Object.values(lessonStarsMap)
        });
        
        chemProgram.progress.completedLessons?.forEach(uniqueId => {
          // uniqueId format: classId * 1000 + lessonId
          // Example: 8001 = class 8, lesson 1
          const lessonClassId = Math.floor(uniqueId / 1000);
          const lessonId = uniqueId % 1000;
          
          // Only include lessons for current class
          if (lessonClassId === currentClassId) {
            const stars = lessonStarsMap[uniqueId.toString()] || 0;
            console.log(`Γ¡É Lesson ${lessonId} (${uniqueId}): stars = ${stars}`);
            progressMap[lessonId] = {
              lessonId: lessonId,
              completed: true,
              score: chemProgram.progress.totalScore,
              stars: stars
            };
          }
        });
        
        console.log('≡ƒôè Progress loaded:', {
          currentClass: currentClassId,
          completedLessons: chemProgram.progress.completedLessons,
          lessonStarsMap: lessonStarsMap,
          parsedProgress: progressMap
        });
        
        setLessonsProgress(progressMap);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [user, classId]);

  // Recompute unlocked lessons whenever chapters or progress change
  useEffect(() => {
    if (!chapters || chapters.length === 0) {
      setUnlockedLessonIds(new Set());
      return;
    }

    // Flatten all lessons preserving order by lessonId (assumed global incremental within class)
    const allLessons = chapters
      .flatMap(ch => (ch.lessons || []).map(ls => ({ ...ls, chapterRef: ch.chapterId })))
      .sort((a, b) => a.lessonId - b.lessonId);

    const unlocked = new Set();
    let lockAfterFirstIncomplete = false;
    for (const lesson of allLessons) {
      if (!lockAfterFirstIncomplete) {
        unlocked.add(lesson.lessonId); // Current lesson always accessible until an earlier incomplete found
        const prog = lessonsProgress[lesson.lessonId];
        if (!prog?.completed) {
          // First incomplete encountered; subsequent lessons locked
          lockAfterFirstIncomplete = true;
        }
      } else {
        // After first incomplete, only already completed lessons remain unlocked
        const prog = lessonsProgress[lesson.lessonId];
        if (prog?.completed) {
          unlocked.add(lesson.lessonId);
        }
      }
    }
    setUnlockedLessonIds(unlocked);
  }, [chapters, lessonsProgress]);

  const handleStartLesson = (chapterId, lessonId, isLocked) => {
    if (isLocked) return; // Guard: do nothing for locked lessons
    navigate(`/lesson/${classId}/${chapterId}/${lessonId}`);
  };

  const getLessonIcon = (lesson) => {
    if (lesson.title.includes('Mß╗ƒ ─æß║ºu')) return '≡ƒôÜ';
    if (lesson.title.includes('Chß║Ñt')) return '≡ƒö¼';
    if (lesson.title.includes('Nguy├¬n tß╗¡')) return 'ΓÜ¢∩╕Å';
    if (lesson.title.includes('Oxit') || lesson.title.includes('Oxi')) return '≡ƒÆ¿';
    if (lesson.title.includes('Axit')) return '≡ƒº¬';
    if (lesson.title.includes('Baz╞í')) return '≡ƒº½';
    if (lesson.title.includes('Muß╗æi')) return 'ΓÜ¬';
    if (lesson.title.includes('Kim loß║íi')) return '≡ƒö¿';
    if (lesson.title.includes('Ankan') || lesson.title.includes('Alkane')) return 'Γ¢╜';
    if (lesson.title.includes('Este')) return '≡ƒìÄ';
    if (lesson.title.includes('─Éiß╗çn li')) return 'ΓÜí';
    return '≡ƒôû';
  };

  const getChapterProgress = (chapter) => {
    if (!chapter.lessons || chapter.lessons.length === 0) return 0;
    
    const completedCount = chapter.lessons.filter(
      lesson => lessonsProgress[lesson.lessonId]?.completed
    ).length;
    
    return (completedCount / chapter.lessons.length) * 100;
  };

  const getTotalProgress = () => {
    let totalLessons = 0;
    let completedLessons = 0;

    chapters.forEach(chapter => {
      totalLessons += chapter.lessons?.length || 0;
      completedLessons += chapter.lessons?.filter(
        lesson => lessonsProgress[lesson.lessonId]?.completed
      ).length || 0;
    });

    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">ΓÅ│</div>
          <h2 className="text-2xl font-bold text-gray-700">─Éang tß║úi dß╗» liß╗çu...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/program/chemistry/dashboard')}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center"
          >
            ΓåÉ Quay lß║íi chß╗ìn lß╗¢p
          </button>
          
          <div className="flex items-center mb-4">
            <div className="text-5xl mr-4">{currentGrade.icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {currentGrade.title}
              </h1>
              <p className="text-gray-600">
                {chapters.length} ch╞░╞íng ΓÇó {chapters.reduce((sum, ch) => sum + (ch.lessons?.length || 0), 0)} b├ái hß╗ìc
              </p>
            </div>
          </div>

          {/* Overall Progress */}
          {user && (
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">Tiß║┐n ─æß╗Ö hß╗ìc tß║¡p</span>
                <span className="text-sm text-gray-600">{Math.round(getTotalProgress())}%</span>
              </div>
              <ProgressBar progress={getTotalProgress()} />
            </Card>
          )}
        </div>

        {/* Chapters and Lessons */}
        {chapters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">≡ƒôÜ</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Ch╞░a c├│ b├ái hß╗ìc n├áo
            </h3>
            <p className="text-gray-600 mb-6">
              Dß╗» liß╗çu b├ái hß╗ìc cho lß╗¢p {classId} ─æang ─æ╞░ß╗úc cß║¡p nhß║¡t
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              Quay lß║íi trang chß╗º
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {chapters.map((chapter) => (
              <div key={chapter.chapterId} className="bg-white rounded-xl shadow-lg p-6">
                {/* Chapter Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Ch╞░╞íng {chapter.chapterId}
                  </h2>
                  
                  {user && chapter.lessons && chapter.lessons.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {chapter.lessons.filter(l => lessonsProgress[l.lessonId]?.completed).length}/{chapter.lessons.length} b├ái ho├án th├ánh
                        </span>
                        <span className="text-sm text-gray-600">
                          {Math.round(getChapterProgress(chapter))}%
                        </span>
                      </div>
                      <ProgressBar progress={getChapterProgress(chapter)} />
                    </div>
                  )}
                </div>

                {/* Lessons Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chapter.lessons && chapter.lessons.map((lesson) => {
                    const progress = lessonsProgress[lesson.lessonId];
                    const isCompleted = progress?.completed;
                    const score = progress?.score || 0;
                    const isLocked = !unlockedLessonIds.has(lesson.lessonId);

                    return (
                      <div
                        key={lesson.lessonId}
                        onClick={() => handleStartLesson(chapter.chapterId, lesson.lessonId, isLocked)}
                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                          isCompleted
                            ? 'border-green-400 bg-green-50'
                            : isLocked
                              ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                              : 'border-gray-200 bg-white hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{getLessonIcon(lesson)}</div>
                          {isCompleted && (
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                              Γ£ô
                            </div>
                          )}
                          {!isCompleted && isLocked && (
                            <div className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm" title="Ho├án th├ánh b├ái tr╞░ß╗¢c ─æß╗â mß╗ƒ kh├│a">≡ƒöÆ</div>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                          {lesson.title}
                        </h3>
                        
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {lesson.description}
                          </p>
                        )}

                        {isCompleted && (
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              {progress?.stars > 0 && (
                                <div className="flex items-center">
                                  {[...Array(3)].map((_, i) => (
                                    <span key={i} className={i < progress.stars ? 'text-yellow-400' : 'text-gray-300'}>
                                      Γ¡É
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className={`mt-3 font-semibold text-sm ${isLocked ? 'text-gray-500' : 'text-blue-600'}`}>
                          {isCompleted ? '├ön tß║¡p lß║íi ΓåÆ' : isLocked ? '─É├ú kh├│a' : 'Bß║»t ─æß║ºu hß╗ìc ΓåÆ'}
                        </div>
                        {isLocked && (
                          <div className="absolute inset-0 rounded-lg bg-white/40 backdrop-blur-[1px]"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassDashboard;
