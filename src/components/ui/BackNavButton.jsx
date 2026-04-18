import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackNavButton = ({
  fallbackPath = '/home',
  label = 'Quay lại',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    const hasHistory = window.history.state && window.history.state.idx > 0;
    if (hasHistory) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-sm transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
};

export default BackNavButton;
