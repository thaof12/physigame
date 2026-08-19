import { lectureData } from '../data/lectureData';

export const saveAdminLessons = (lessons) => {
  try {
    localStorage.setItem('admin_lessons_data', JSON.stringify(lessons));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('admin_lessons_updated', { detail: lessons }));
  } catch (e) {
    console.error('Error saving admin lessons:', e);
  }
};

export const getAllLessonsFromStorage = () => {
  const saved = localStorage.getItem('admin_lessons_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing admin_lessons_data', e);
    }
  }

  // Default fallback from lectureData
  const list = [];
  if (lectureData?.physics) {
    Object.entries(lectureData.physics).forEach(([gradeStr, chapters]) => {
      const grade = parseInt(gradeStr, 10);
      Object.entries(chapters).forEach(([chapterKey, chapter]) => {
        (chapter.lessons || []).forEach((l, idx) => {
          const rawNum = l.id ? l.id.replace('b', '') : (idx + 1);
          list.push({
            id: `phy-${grade}-${chapterKey}-${l.id || idx}`,
            rawId: l.id || `b${idx + 1}`,
            lessonNumber: rawNum,
            title: l.title,
            videoId: l.videoId || '',
            grade: grade,
            chapterKey: chapterKey,
            chapterTitle: chapter.title,
            description: chapter.description || `Nội dung chi tiết bài học ${l.title} thuộc ${chapter.title}`,
            subject: 'physics',
            status: 'published'
          });
        });
      });
    });
  }
  return list;
};

export const getPublishedLessons = () => {
  const all = getAllLessonsFromStorage();
  return all.filter(l => l.status === 'published');
};

export const getCurriculumStructure = (gradeNum) => {
  const published = getPublishedLessons().filter(l => String(l.grade) === String(gradeNum));
  
  const chapters = {};
  published.forEach((l, idx) => {
    const chTitle = l.chapterTitle || 'Bài giảng chung';
    if (!chapters[chTitle]) {
      chapters[chTitle] = {
        title: chTitle,
        description: l.description,
        lessons: []
      };
    }
    chapters[chTitle].lessons.push({
      id: l.rawId || `b${idx + 1}`,
      fullId: l.id,
      title: l.title,
      videoId: l.videoId,
      grade: l.grade,
      chapterTitle: l.chapterTitle,
      description: l.description
    });
  });
  return chapters;
};
