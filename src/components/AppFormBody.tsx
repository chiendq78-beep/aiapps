import React, { useState } from 'react';
import { AppIdea, Platform, AppStatus } from '../types';
import LucideIcon from './LucideIcon';

interface AppFormBodyProps {
  mode: 'add' | 'edit';
  initialData?: Partial<AppIdea>;
  onSave: (data: Partial<AppIdea>) => void;
  onCancel: () => void;
  theme: 'light' | 'dark';
}

const AVAILABLE_ICONS = [
  'Home', 'Pill', 'GraduationCap', 'Shirt', 'HeartPulse', 
  'Briefcase', 'School', 'Languages', 'ClipboardCheck', 'Printer', 
  'UserCheck', 'Sparkles', 'Calculator', 'Calendar', 'Flame', 
  'Activity', 'Code', 'Cloud', 'Smile', 'Layout'
];

const PLATFORMS_LIST: Platform[] = ['Web', 'Mobile', 'Tablet'];

const STATUS_LIST: AppStatus[] = [
  'Đang phát triển',
  'Đang cải tiến',
  'Đã phát hành',
  'Đã phát hành (Beta)',
  'Sắp ra mắt',
  'Sắp ra mắt (Alpha)'
];

export default function AppFormBody({ mode, initialData = {}, onSave, onCancel, theme }: AppFormBodyProps) {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [icon, setIcon] = useState(initialData.icon || 'Sparkles');
  const [platforms, setPlatforms] = useState<Platform[]>(initialData.platforms || ['Web']);
  const [status, setStatus] = useState<AppStatus>(initialData.status || 'Đang phát triển');
  const [currentVersion, setCurrentVersion] = useState(initialData.currentVersion || '1.0.0');
  const [sourceCodeUrl, setSourceCodeUrl] = useState(initialData.sourceCodeUrl || '');
  const [appUrl, setAppUrl] = useState(initialData.appUrl || '');

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) { // Guard against empty platforms array
        setPlatforms(platforms.filter(item => item !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      icon,
      platforms,
      status,
      currentVersion,
      sourceCodeUrl: sourceCodeUrl.trim() || undefined,
      appUrl: appUrl.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 font-sans leading-relaxed text-xs">
      
      {/* Name Input */}
      <div className="space-y-1.5 focus-within:text-indigo-400 transition-colors">
        <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          Tên Ứng dụng <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="v.d. Sổ Tay Việt, Super Calc..."
          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10 hover:border-white/20 text-white placeholder-gray-500'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          Mô tả tóm tắt ứng dụng <span className="text-rose-500">*</span>
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả chức năng cốt lõi của ứng dụng, lợi ích mang lại..."
          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10 hover:border-white/20 text-white placeholder-gray-500'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400'
          }`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Version */}
        <div className="space-y-1.5">
          <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
            Phiên bản hiện tại
          </label>
          <input
            type="text"
            required
            value={currentVersion}
            onChange={(e) => setCurrentVersion(e.target.value)}
            placeholder="v.d. 1.0.0"
            className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550 ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:border-white/20 text-white placeholder-gray-500'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Status Selection */}
        <div className="space-y-1.5">
          <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
            Trạng thái phát triển
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AppStatus)}
            className={`w-full border rounded-xl p-2.5 text-xs transition-all focus:outline-none focus:border-indigo-500 cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#181d2a] border-white/10 text-gray-300'
                : 'bg-white border-slate-200 text-slate-755'
            }`}
          >
            {STATUS_LIST.map((stat) => (
              <option key={stat} value={stat}>
                {stat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Source Code Download URL Input Field */}
      <div className="space-y-1.5 focus-within:text-indigo-400 transition-colors">
        <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          Liên kết Tải mã nguồn (Source Code URL - Tùy chọn)
        </label>
        <input
          type="url"
          value={sourceCodeUrl}
          onChange={(e) => setSourceCodeUrl(e.target.value)}
          placeholder="v.d. https://github.com/username/ten-du-an"
          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10 hover:border-white/20 text-white placeholder-gray-500'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400'
          }`}
        />
      </div>

      {/* App Link Input Field */}
      <div className="space-y-1.5 focus-within:text-indigo-400 transition-colors">
        <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          Trường Link ứng dụng (cho phép thêm link để mở ứng dụng)
        </label>
        <input
          type="url"
          value={appUrl}
          onChange={(e) => setAppUrl(e.target.value)}
          placeholder="v.d. https://ten-ung-dung.example.com"
          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-all focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 ${
            theme === 'dark'
              ? 'bg-white/5 border-white/10 hover:border-white/20 text-white placeholder-gray-500'
              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400'
          }`}
        />
      </div>

      {/* Target Platforms Toggle Buttons */}
      <div className="space-y-2">
        <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          Nền tảng hỗ trợ (được chọn nhiều)
        </label>
        <div className="flex gap-2 select-none">
          {PLATFORMS_LIST.map((plat) => {
            const isActive = platforms.includes(plat);
            return (
              <button
                key={plat}
                type="button"
                onClick={() => togglePlatform(plat)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                    : theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                <LucideIcon 
                  name={plat === 'Web' ? 'Monitor' : plat === 'Mobile' ? 'Smartphone' : 'Tablet'} 
                  size={13} 
                />
                <span>{plat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Elegant Applet Icon Selection Grid */}
      <div className="space-y-2">
        <label className={`block font-bold truncate ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
          Biểu tượng đại diện ({icon})
        </label>
        <div className={`grid grid-cols-5 gap-1.5 p-3.5 border rounded-xl max-h-[140px] overflow-y-auto ${
          theme === 'dark' ? 'border-white/10 bg-black/10' : 'border-slate-200 bg-slate-50/50'
        }`}>
          {AVAILABLE_ICONS.map((ic) => {
            const isSelected = icon === ic;
            return (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`p-2.5 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-tr from-indigo-600 to-purple-550 border-indigo-500 text-white shadow shadow-indigo-600/30 font-bold scale-[1.08]'
                    : theme === 'dark'
                      ? 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
                title={ic}
              >
                <LucideIcon name={ic} size={15} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Buttons Action bar layout */}
      <div className={`flex items-center justify-end gap-2 pt-4 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            theme === 'dark'
              ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
              : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-650 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition-all cursor-pointer border border-indigo-600/20"
        >
          {mode === 'add' ? 'Tạo Ứng dụng' : 'Lưu Thay đổi'}
        </button>
      </div>

    </form>
  );
}
