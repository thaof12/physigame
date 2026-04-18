import { physicsLessons } from './physicsLessons';

const removeChapterPrefix = (chapterTitle = '') => {
  return String(chapterTitle || '')
    .replace(/^\s*chương\s*\d+\s*:\s*/i, '')
    .trim();
};

const buildYoutubeSearchUrl = (query) => {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

const buildChapterVideoEntries = (classId, chapter) => {
  const chapterTitle = removeChapterPrefix(chapter?.title || '');
  const chapterLabel = chapterTitle || `Chuong ${chapter?.id || ''}`.trim();
  const firstLesson = chapter?.lessons?.[0]?.title || '';

  return [
    {
      title: `Tong quan ${chapterLabel}`,
      url: buildYoutubeSearchUrl(`Vat ly lop ${classId} ${chapterLabel} tong quan`)
    },
    {
      title: `Bai giang trong tam ${chapterLabel}`,
      url: buildYoutubeSearchUrl(`Bai giang vat ly lop ${classId} ${chapterLabel} ${firstLesson}`)
    },
    {
      title: `On tap chuong ${chapter?.id || ''}`.trim(),
      url: buildYoutubeSearchUrl(`On tap vat ly lop ${classId} chuong ${chapter?.id || ''} ${chapterLabel}`)
    }
  ];
};

export const chapterVideoCatalog = Object.entries(physicsLessons).reduce((acc, [classId, classData]) => {
  const chapterMap = {};

  (classData?.chapters || []).forEach((chapter) => {
    chapterMap[String(chapter.id)] = buildChapterVideoEntries(classId, chapter);
  });

  acc[String(classId)] = chapterMap;
  return acc;
}, {});

export const getChapterVideoDefaults = (classId, chapterId) => {
  const normalizedClassId = String(classId || '').trim();
  const normalizedChapterId = String(chapterId || '').trim();

  if (!normalizedClassId || !normalizedChapterId) {
    return [];
  }

  return chapterVideoCatalog?.[normalizedClassId]?.[normalizedChapterId] || [];
};
