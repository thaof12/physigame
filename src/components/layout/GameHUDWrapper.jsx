/**
 * GameHUDWrapper.jsx
 * Một wrapper UI bọc bên ngoài các game/thí nghiệm Phaser hoặc canvas.
 * Cung cấp: header điều hướng, breadcrumb, fullscreen toggle, thông tin game.
 * Sử dụng: bọc bất kỳ game/lab nào cần header đồng bộ với theme.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Maximize2, Minimize2, Home, ChevronRight,
  BookOpen, Gamepad2, FlaskConical, Info, X
} from 'lucide-react';

/**
 * @param {object} props
 * @param {React.ReactNode} props.children     - Nội dung game/lab canvas
 * @param {string}   props.title              - Tên game/thí nghiệm
 * @param {string}   [props.subtitle]         - Mô tả ngắn
 * @param {string}   [props.backPath]         - URL quay về (mặc định: -1)
 * @param {string}   [props.backLabel]        - Nhãn nút quay về
 * @param {'game'|'lab'} [props.type]         - Loại content để render icon phù hợp
 * @param {Array}    [props.breadcrumbs]      - [{label, path}] breadcrumb chain
 * @param {string}   [props.infoText]         - Nội dung modal hướng dẫn nhanh
 */
const GameHUDWrapper = ({
  children,
  title,
  subtitle,
  backPath,
  backLabel = 'Quay lại',
  type = 'game',
  breadcrumbs = [],
  infoText,
}) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleBack = useCallback(() => {
    if (backPath) navigate(backPath);
    else navigate(-1);
  }, [backPath, navigate]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const TypeIcon = type === 'lab' ? FlaskConical : Gamepad2;
  const iconColor = type === 'lab' ? 'text-emerald-400' : 'text-purple-400';
  const iconBg = type === 'lab'
    ? 'bg-emerald-500/10 border-emerald-500/20'
    : 'bg-purple-500/10 border-purple-500/20';
  const accentColor = type === 'lab' ? 'border-emerald-500/20' : 'border-purple-500/20';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans">

      {/* ── TOP HUD BAR ── */}
      <header className={`sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b ${accentColor} shadow-2xl`}>
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* LEFT: back + breadcumb */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-xl border border-slate-700 flex-shrink-0"
              title={backLabel}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm overflow-hidden">
              <button
                onClick={() => navigate('/program/physics')}
                className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                title="Trang chủ"
              >
                <Home className="w-4 h-4" />
              </button>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5 flex-shrink-0">
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                  <button
                    onClick={() => crumb.path && navigate(crumb.path)}
                    className={`${crumb.path ? 'text-slate-400 hover:text-slate-200 cursor-pointer' : 'text-slate-600 cursor-default'} transition-colors`}
                  >
                    {crumb.label}
                  </button>
                </span>
              ))}
              <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />
              <span className="text-white font-bold truncate">{title}</span>
            </nav>
          </div>

          {/* CENTER: title badge */}
          <div className="hidden xl:flex items-center gap-3 flex-shrink-0">
            <div className={`w-9 h-9 rounded-xl ${iconBg} border flex items-center justify-center`}>
              <TypeIcon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="text-left">
              <p className="text-white font-black text-sm leading-none">{title}</p>
              {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
            </div>
          </div>

          {/* RIGHT: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {infoText && (
              <button
                onClick={() => setShowInfo(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-all text-sm font-medium"
                title="Hướng dẫn"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Hướng dẫn</span>
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl transition-all"
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── GAME / LAB CANVAS AREA ── */}
      <main className="flex-1 relative overflow-hidden">
        {/* Subtle top glow line matching type */}
        <div
          className={`absolute top-0 left-0 right-0 h-px ${
            type === 'lab' ? 'bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent' : 'bg-gradient-to-r from-transparent via-purple-500/50 to-transparent'
          }`}
        />
        {children}
      </main>

      {/* ── INFO MODAL ── */}
      {showInfo && infoText && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl ${iconBg} border flex items-center justify-center`}>
                <Info className={`w-6 h-6 ${iconColor}`} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Hướng Dẫn</h3>
                <p className="text-slate-500 text-sm">{title}</p>
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
              {typeof infoText === 'string' ? (
                <p>{infoText}</p>
              ) : (
                infoText
              )}
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className={`mt-6 w-full py-3 rounded-2xl font-bold text-sm tracking-wider ${
                type === 'lab'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20'
              } transition-all`}
            >
              ĐÃ HIỂU — ĐẾN CHIẾN TRƯỜNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHUDWrapper;
