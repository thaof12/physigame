import { useState } from 'react';
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
  Cloud
} from 'lucide-react';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    siteName: 'PhysiGame',
    siteDescription: 'Nền tảng học Vật lý tương tác',
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxUploadSize: 10,
    sessionTimeout: 30
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'Tổng quan', icon: Settings },
    { id: 'security', label: 'Bảo mật', icon: Shield },
    { id: 'notifications', label: 'Thông báo', icon: Bell },
    { id: 'database', label: 'Dữ liệu', icon: Database }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Cài đặt hệ thống</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý cấu hình và tùy chọn hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Khôi phục</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-medium"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Đã lưu' : 'Lưu thay đổi'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 text-white border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-indigo-400' : ''}`} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800/50 rounded-2xl p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Thông tin website</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tên website</label>
                      <input
                        type="text"
                        value={settings.siteName}
                        onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả</label>
                      <textarea
                        value={settings.siteDescription}
                        onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                        rows={3}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/50 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Chế độ hoạt động</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Chế độ bảo trì</p>
                          <p className="text-sm text-slate-400">Tạm dừng truy cập cho người dùng</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.maintenanceMode ? 'bg-blue-500' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.maintenanceMode ? 'left-7' : 'left-1'
                        }`}></span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <Globe className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Cho phép đăng ký</p>
                          <p className="text-sm text-slate-400">Người dùng mới có thể tạo tài khoản</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, allowRegistration: !settings.allowRegistration })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.allowRegistration ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.allowRegistration ? 'left-7' : 'left-1'
                        }`}></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Bảo mật phiên</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Thời gian hết hạn phiên (phút)</label>
                      <input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/50 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Tùy chọn bảo mật</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <Key className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Xác thực 2 yếu tố</p>
                          <p className="text-sm text-slate-400">Bắt buộc cho tài khoản admin</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">Bật</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                          <Shield className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Mã hóa dữ liệu</p>
                          <p className="text-sm text-slate-400">Mã hóa AES-256</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">Hoạt động</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Email thông báo</h3>
                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Mail className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Gửi email thông báo</p>
                        <p className="text-sm text-slate-400">Thông báo cho người dùng qua email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-cyan-500' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.emailNotifications ? 'left-7' : 'left-1'
                      }`}></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'database' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Sao lưu dữ liệu</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                          <Cloud className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Tự động sao lưu</p>
                          <p className="text-sm text-slate-400">Sao lưu định kỳ lên cloud</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSettings({ ...settings, autoBackup: !settings.autoBackup })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings.autoBackup ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.autoBackup ? 'left-7' : 'left-1'
                        }`}></span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Tần suất sao lưu</label>
                      <select
                        value={settings.backupFrequency}
                        onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none"
                      >
                        <option value="hourly">Mỗi giờ</option>
                        <option value="daily">Hàng ngày</option>
                        <option value="weekly">Hàng tuần</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/50 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Trạng thái hệ thống</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg">
                          <Server className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Server</p>
                          <p className="text-sm text-slate-400">Uptime: 99.9%</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Online
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-500/20 rounded-lg">
                          <Database className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Database</p>
                          <p className="text-sm text-slate-400">MongoDB Atlas</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                        Connected
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


