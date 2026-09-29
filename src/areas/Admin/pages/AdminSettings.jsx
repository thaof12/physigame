import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Palette,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  Key,
  Server,
  Cloud,
  Image as ImageIcon,
  Upload,
  Share2,
  Sparkles
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  siteName: 'Eureka - Vật lý',
  siteDescription: 'Nền tảng học Vật lý tương tác',
  siteOgImage: '/images/eureka_og_share.png',
  customOgImageData: '',
  maintenanceMode: false,
  allowRegistration: true,
  emailNotifications: true,
  autoBackup: true,
  backupFrequency: 'daily',
  maxUploadSize: 10,
  sessionTimeout: 30
};

const API_URL = '/api/settings';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(API_URL);
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await axios.post(API_URL, settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Không thể lưu cài đặt. Lỗi kết nối đến máy chủ.');
    }
  };

  const handleRestore = async () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục tất cả cài đặt về mặc định?')) {
      try {
        await axios.post(API_URL, DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
      } catch (error) {
        console.error('Error restoring settings:', error);
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1200;
        const maxH = 630;
        let width = img.width;
        let height = img.height;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSettings((prev) => ({
          ...prev,
          siteOgImage: '/api/og-image',
          customOgImageData: compressedDataUrl
        }));
      };
    };
    reader.readAsDataURL(file);
  };

  const currentPreviewImage = settings.customOgImageData || settings.siteOgImage || '/images/eureka_og_share.png';

  const tabs = [
    { id: 'general', label: 'Tổng quan', icon: Settings },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'database', label: 'Dữ liệu', icon: Database }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-extrabold text-[#0f172a]">Cài đặt hệ thống</h1>
          <p className="font-body text-slate-500 font-bold text-sm">Quản lý cấu hình và tùy chọn vận hành</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRestore}
            className="font-heading flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-slate-700 hover:text-[#4f46e5] hover:border-indigo-200 hover:bg-indigo-50/50 transition-all font-extrabold text-xs uppercase tracking-widest shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục</span>
          </button>
          <button
            onClick={handleSave}
            className="font-heading flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4f46e5] to-[#6366f1] rounded-[1.25rem] text-white text-sm font-extrabold shadow-xl shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest"
          >
            {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            <span>{saved ? 'Đã lưu' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-200/80 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`font-heading w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === tab.id
                    ? 'bg-[#4f46e5] text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-700 hover:text-[#4f46e5] hover:bg-indigo-50/60 font-extrabold'
                    }`}
                >
                  <Icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-slate-500'}`} />
                  <span className="font-extrabold text-sm uppercase tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-[3rem] shadow-sm border border-[#e2e8f0]/20 p-10">
            {activeTab === 'general' && (
              <div className="space-y-10">
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Thông tin website</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="font-heading block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Tên website</label>
                      <input
                        type="text"
                        value={settings.siteName || ''}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="font-body w-full bg-[#f8fafc]/30 border border-[#f8fafc] rounded-2xl px-6 py-4 text-[#0f172a] font-bold focus:outline-none focus:border-[#4f46e5]/50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="font-heading block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Mô tả</label>
                      <textarea
                        value={settings.siteDescription || ''}
                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                        rows={3}
                        className="font-body w-full bg-[#f8fafc]/30 border border-[#f8fafc] rounded-2xl px-6 py-4 text-[#0f172a] font-bold focus:outline-none focus:border-[#4f46e5]/50 transition-all resize-none"
                      />
                    </div>

                    {/* Ảnh hiển thị link website */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-indigo-600" />
                          <label className="font-heading text-xs font-extrabold text-[#0f172a] uppercase tracking-wider">
                            Ảnh đại diện hiển thị khi gửi link (Open Graph / Mạng xã hội)
                          </label>
                        </div>
                      </div>

                      {/* Image Source Input & Upload */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="flex flex-col justify-end">
                          <label className="font-heading block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 h-5 flex items-center">
                            Đường dẫn ảnh (URL)
                          </label>
                          <input
                            type="text"
                            placeholder="vd: /images/eureka_og_share.png hoặc https://..."
                            value={settings.siteOgImage || ''}
                            onChange={(e) => setSettings({ ...settings, siteOgImage: e.target.value, customOgImageData: '' })}
                            className="font-body w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm text-[#0f172a] font-medium focus:outline-none focus:border-[#4f46e5] transition-all"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <label className="font-heading block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 h-5 flex items-center">
                            Tải ảnh từ máy tính
                          </label>
                          <label className="flex items-center justify-center gap-2.5 h-12 px-4 bg-white border border-dashed border-indigo-300 rounded-xl text-indigo-600 font-extrabold text-xs uppercase tracking-wider cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-500 transition-all shadow-sm select-none">
                            <Upload className="w-4 h-4" />
                            <span>Chọn tệp ảnh tải lên...</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Presets */}
                      <div className="pt-2">
                        <p className="font-heading text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2.5">
                          Mẫu ảnh có sẵn trong hệ thống:
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, siteOgImage: '/images/eureka_og_share.png', customOgImageData: '' })}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${(settings.siteOgImage === '/images/eureka_og_share.png' && !settings.customOgImageData)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                              }`}
                          >
                            Logo Eureka chuẩn OG (Mặc định)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, siteOgImage: '/images/eureka_official_logo.png', customOgImageData: '' })}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${(settings.siteOgImage === '/images/eureka_official_logo.png' && !settings.customOgImageData)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                              }`}
                          >
                            Logo Eureka gốc
                          </button>
                          <button
                            type="button"
                            onClick={() => setSettings({ ...settings, siteOgImage: '/robot-eureka-banner.jpg', customOgImageData: '' })}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${(settings.siteOgImage === '/robot-eureka-banner.jpg' && !settings.customOgImageData)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                              }`}
                          >
                            Banner Robot Eureka
                          </button>
                        </div>
                      </div>

                      {/* Real-time Card Mockup */}
                      <div className="pt-4 border-t border-slate-200/80">
                        <div className="flex items-center gap-2 mb-3">
                          <Share2 className="w-4 h-4 text-slate-500" />
                          <span className="font-heading text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                            Xem trước mô phỏng thẻ hiển thị trên Zalo / Facebook / Telegram:
                          </span>
                        </div>
                        <div className="max-w-md mx-auto sm:mx-0 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                          {/* Image preview */}
                          <div className="aspect-[1.91/1] w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
                            <img
                              src={currentPreviewImage}
                              alt="Preview Open Graph"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/eureka_og_share.png';
                              }}
                            />
                            {settings.customOgImageData && (
                              <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                                Ảnh vừa tải lên
                              </span>
                            )}
                          </div>
                          {/* Card Content */}
                          <div className="p-4 space-y-1 bg-white">
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              eureka-th.vercel.app
                            </div>
                            <h4 className="font-heading font-extrabold text-[#0f172a] text-base leading-snug line-clamp-1">
                              {settings.siteName || 'Eureka - Vật lý'}
                            </h4>
                            <p className="font-body text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                              {settings.siteDescription || 'Nền tảng học Vật lý tương tác'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f8fafc] pt-10">
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Chế độ hoạt động</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl">
                          <AlertTriangle className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Chế độ bảo trì</p>
                          <p className="font-body text-xs font-bold text-slate-400">Tạm dừng truy cập cho người dùng</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`relative w-14 h-8 rounded-full transition-all ${settings.maintenanceMode ? 'bg-blue-500' : 'bg-slate-200'
                          }`}
                      >
                        <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'
                          }`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl">
                          <Globe className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Cho phép đăng ký</p>
                          <p className="font-body text-xs font-bold text-slate-400">Người dùng mới có thể tạo tài khoản</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                        className={`relative w-14 h-8 rounded-full transition-all ${settings.allowRegistration ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                      >
                        <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.allowRegistration ? 'left-7' : 'left-1'
                          }`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-10">
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Bảo mật phiên</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="font-heading block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Thời gian hết hạn phiên (phút)</label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                        className="font-body w-full bg-[#f8fafc]/30 border border-[#f8fafc] rounded-2xl px-6 py-4 text-[#0f172a] font-bold focus:outline-none focus:border-[#4f46e5]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f8fafc] pt-10">
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Tùy chọn bảo mật cao cấp</h3>
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-50 rounded-2xl">
                          <Key className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Xác thực 2 yếu tố</p>
                          <p className="font-body text-xs font-bold text-slate-400">Bắt buộc cho tài khoản admin</p>
                        </div>
                      </div>
                      <span className="font-heading px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest">Đã bật</span>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-violet-50 rounded-2xl">
                          <Shield className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Mã hóa dữ liệu</p>
                          <p className="font-body text-xs font-bold text-slate-400">Tiêu chuẩn quân đội AES-256</p>
                        </div>
                      </div>
                      <span className="font-heading px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest">Hoạt động</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-10">
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Hệ thống thông báo</h3>
                  <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-cyan-50 rounded-2xl">
                        <Mail className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div>
                        <p className="font-heading font-extrabold text-[#0f172a]">Gửi email thông báo</p>
                        <p className="font-body text-xs font-bold text-slate-400">Thông báo tự động cho người dùng</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                      className={`relative w-14 h-8 rounded-full transition-all ${settings.emailNotifications ? 'bg-[#4f46e5]' : 'bg-slate-200'
                        }`}
                    >
                      <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.emailNotifications ? 'left-7' : 'left-1'
                        }`}></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-10">
                <div>
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Quản trị dữ liệu</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-emerald-50 rounded-2xl">
                          <Cloud className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Tự động sao lưu</p>
                          <p className="font-body text-xs font-bold text-slate-400">Bảo mật dữ liệu trên đám mây</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                        className={`relative w-14 h-8 rounded-full transition-all ${settings.autoBackup ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                      >
                        <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.autoBackup ? 'left-7' : 'left-1'
                          }`}></span>
                      </button>
                    </div>

                    <div>
                      <label className="font-heading block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Tần suất sao lưu</label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                        className="font-body w-full bg-[#f8fafc]/30 border border-[#f8fafc] rounded-2xl px-6 py-4 text-[#0f172a] font-bold focus:outline-none focus:border-[#4f46e5]/50 transition-all"
                      >
                        <option value="hourly">Mỗi giờ</option>
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#f8fafc] pt-10">
                  <h3 className="font-heading text-xl font-extrabold text-[#0f172a] mb-8">Tình trạng máy chủ</h3>
                  <div className="grid gap-6">
                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-50 rounded-2xl">
                          <Server className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Node Server</p>
                          <p className="font-body text-xs font-bold text-slate-400">Uptime: 99.9% - Latency: 24ms</p>
                        </div>
                      </div>
                      <span className="font-heading flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        ONLINE
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-[#f8fafc]/30 rounded-[2rem] border border-[#f8fafc]">
                      <div className="flex items-center gap-4">
                        <div className="p-4 bg-violet-50 rounded-2xl">
                          <Database className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                          <p className="font-heading font-extrabold text-[#0f172a]">Supabase DB</p>
                          <p className="font-body text-xs font-bold text-slate-400">PostgreSQL - 100% Availability</p>
                        </div>
                      </div>
                      <span className="font-heading flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        CONNECTED
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;


