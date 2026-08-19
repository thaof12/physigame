import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { getPublishedLessons } from '../utils/lessonStorage';

const LectureClassSelector = () => {
  const { subject, grade } = useParams();
  const navigate = useNavigate();
  const [lectures, setLectures] = useState([]);
  const [subjectName, setSubjectName] = useState('Vật Lý');

  useEffect(() => {
    const loadLectures = () => {
      const gradeNum = grade.startsWith('class') ? parseInt(grade.replace('class', ''), 10) : parseInt(grade, 10);
      const published = getPublishedLessons().filter(l => String(l.grade) === String(gradeNum));
      setLectures(published);
      setSubjectName('Vật Lý');
    };

    loadLectures();

    window.addEventListener('storage', loadLectures);
    window.addEventListener('admin_lessons_updated', loadLectures);

    return () => {
      window.removeEventListener('storage', loadLectures);
      window.removeEventListener('admin_lessons_updated', loadLectures);
    };
  }, [subject, grade]);

  if (lectures.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-body pt-24">
        <div className="text-center p-8 bg-slate-50 rounded-3xl border border-slate-100 max-w-md">
          <div className="mb-4 text-5xl">📚</div>
          <h2 className="font-heading text-2xl font-bold text-slate-800 mb-2">
            Chưa có bài giảng cho Lớp {grade.replace('class', '')}
          </h2>
          <p className="text-slate-500 font-medium mb-6 text-sm">
            Bài giảng cho lớp này đang được quản trị viên cập nhật.
          </p>
          <button
            onClick={() => navigate('/interactive-lectures')}
            className="px-6 py-3 bg-[#274dad] hover:bg-[#2099e9] text-white rounded-2xl font-bold transition-all"
          >
            Quay lại thư viện
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-28 pb-20 font-body">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/interactive-lectures')}
            className="p-3 bg-slate-50 hover:bg-blue-50 text-[#2099e9] rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-extrabold text-[#1E293B]">
              {subjectName} - Lớp {grade.replace('class', '')}
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Danh sách bài giảng được phát hành từ ban quản trị
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lectures.map((lecture, index) => (
            <div
              key={lecture.id}
              onClick={() => navigate(`/interactive-lectures/${subject}/${grade}/${lecture.rawId || lecture.id}`)}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-[#274dad] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                    BÀI {lecture.lessonNumber || (index + 1)}
                  </span>
                  <Play className="w-5 h-5 text-[#2099e9] group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="font-heading text-lg font-bold text-[#1E293B] mb-2 group-hover:text-[#274dad] transition-colors leading-snug">
                  {lecture.title}
                </h3>
                <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-4">
                  {lecture.chapterTitle}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-[#274dad]">
                <span>XEM BÀI HỌC</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LectureClassSelector;
