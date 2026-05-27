import React from 'react';
import { motion } from 'motion/react';
import { AppIdea, Platform } from '../types';
import LucideIcon from './LucideIcon';

interface AppCardProps {
  key?: string;
  app: AppIdea;
  hasVoted: boolean;
  onSelect: () => void;
  onVote: () => void;
  onOpenSimulator: () => void;
  theme?: 'light' | 'dark';
  isAdminMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function AppCard({ 
  app, 
  hasVoted, 
  onSelect, 
  onVote, 
  onOpenSimulator, 
  theme = 'dark',
  isAdminMode = false,
  onEdit,
  onDelete
}: AppCardProps) {
  // Helpers for styling tag status
  const getStatusColor = (status: AppIdea['status']) => {
    switch (status) {
      case 'Đã phát hành':
        return theme === 'dark'
          ? 'bg-emerald-500/10 text-emerald-405'
          : 'bg-emerald-50 text-emerald-700';
      case 'Đã phát hành (Beta)':
        return theme === 'dark'
          ? 'bg-teal-500/10 text-teal-400'
          : 'bg-teal-50 text-teal-700';
      case 'Đang cải tiến':
        return theme === 'dark'
          ? 'bg-amber-500/10 text-amber-400'
          : 'bg-amber-50 text-amber-700';
      case 'Đang phát triển':
        return theme === 'dark'
          ? 'bg-blue-500/10 text-blue-400'
          : 'bg-blue-50 text-blue-700';
      case 'Sắp ra mắt':
        return theme === 'dark'
          ? 'bg-indigo-500/10 text-indigo-400'
          : 'bg-indigo-50 text-indigo-705';
      case 'Sắp ra mắt (Alpha)':
        return theme === 'dark'
          ? 'bg-purple-500/10 text-purple-400'
          : 'bg-purple-50 text-purple-705';
      default:
        return theme === 'dark'
          ? 'bg-gray-500/10 text-gray-400'
          : 'bg-gray-50 text-gray-600';
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'Web':
        return 'Monitor';
      case 'Mobile':
        return 'Smartphone';
      case 'Tablet':
        return 'Tablet';
    }
  };

  const triggerMockSourceCodeDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const techBadges = app.techStack && app.techStack.length > 0
      ? app.techStack.map(t => `<span class="bg-indigo-500/10 text-indigo-300 px-3 py-1 text-xs rounded-full border border-indigo-500/20 font-semibold">${t}</span>`).join('\n                    ')
      : '<span class="bg-indigo-500/10 text-indigo-300 px-3 py-1 text-xs rounded-full border border-indigo-500/20 font-semibold">React</span>';

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${app.name} - Blueprint Source Code</title>
    <!-- Tailwind Custom CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-[#0b0f19] text-slate-100 min-h-screen flex flex-col justify-between">
    <header class="border-b border-white/10 px-6 py-5 flex items-center justify-between backdrop-blur-md bg-black/30 sticky top-0 z-50">
        <div class="flex items-center gap-3">
            <div class="p-3 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                <span class="text-xl font-bold">🚀</span>
            </div>
            <div>
                <h1 class="text-lg font-bold tracking-tight">${app.name}</h1>
                <p class="text-xs text-slate-400">Bản mẫu phát hành - v${app.currentVersion}</p>
            </div>
        </div>
        <div class="text-[11px] bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 font-bold uppercase tracking-wider">
            ${app.status}
        </div>
    </header>

    <main class="max-w-4xl mx-auto py-12 px-6 flex-1 flex flex-col justify-center w-full">
        <div class="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div class="absolute -top-12 -right-12 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
            
            <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider mb-4 inline-block">
                Mã nguồn đã phát hành mẫu thành công
            </span>
            
            <h2 class="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">Chào mừng đến với dự án ${app.name}!</h2>
            <p class="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                ${app.description}
            </p>

            <div class="mb-8">
                <h3 class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3 block">Công nghệ cốt lõi (Tech Stack)</h3>
                <div class="flex flex-wrap gap-2">
                    ${techBadges}
                </div>
            </div>

            <div class="border-t border-white/10 pt-6">
                <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Bắt đầu phát triển</h3>
                <code class="block bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-indigo-300 leading-relaxed mb-4 overflow-x-auto whitespace-pre"># Cài đặt các thư viện cần thiết
npm install

# Khởi chạy ứng dụng thử nghiệm (Dev Mode)
npm run dev</code>
                <p class="text-[11px] text-slate-500 leading-normal">
                    Mã nguồn này được sinh tự động bởi hệ điều hành danh mục <strong>AI Apps</strong>. Bản quyền thuộc về các lập trình viên cộng đồng. Cảm ơn bạn đã lựa chọn sử dụng.
                </p>
            </div>
        </div>
    </main>

    <footer class="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>&copy; 2026 AI Apps. Thiết kế tinh xảo và hỗ trợ lập trình tự động.</p>
    </footer>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${app.id}-source.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      id={`app-card-${app.id}`}
      onClick={onSelect}
      className={`group h-full relative backdrop-blur-xl border rounded-[22px] p-5 cursor-pointer flex flex-col justify-between overflow-hidden transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-900/40 border-sky-500/15 text-[#e0f2fe] shadow-[5px_5px_15px_rgba(0,0,0,0.4),_inset_1px_1px_0px_rgba(255,255,255,0.05)]' 
          : 'bg-white/50 border-white/80 text-slate-800 shadow-[6px_6px_20px_rgba(15,23,42,0.05),_inset_1px_1px_0px_rgba(255,255,255,0.8)]'
      }`}
      whileHover={{
        scale: 1.035,
        y: -5,
        borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.45)',
        boxShadow: theme === 'dark'
          ? "0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px 2px rgba(56, 189, 248, 0.15), inset 1px 1px 0px rgba(255,255,255,0.08)"
          : "0 15px 30px -5px rgba(14, 165, 233, 0.15), 0 2px 10px rgba(14, 165, 233, 0.05), inset 1px 1px 0px rgba(255,255,255,0.9)",
      }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 22
      }}
    >
      {/* Decorative gradient blur in card background */}
      <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/15 group-hover:scale-125 transition-all duration-500" />
      <div className="absolute -left-10 -bottom-10 w-24 h-24 rounded-full bg-cyan-500/5 blur-2xl group-hover:bg-cyan-500/10 group-hover:scale-125 transition-all duration-500" />

      <div>
        {/* Top Header Row of Card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Elegant glowing app icon */}
            <div className="p-3 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-lg shadow-indigo-550/20">
              <LucideIcon name={app.icon} size={22} />
            </div>
            <div>
              <h3 className={`font-semibold group-hover:text-indigo-400 transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                {app.name}
              </h3>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>Phiên bản {app.currentVersion}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start">
            {/* Admin control actions */}
            {isAdminMode && (
              <div className="flex items-center gap-1 select-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit();
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                      : 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-3xs'
                  }`}
                  title="Sửa ứng dụng"
                >
                  <LucideIcon name="Pencil" size={11} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete();
                  }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-3xs'
                  }`}
                  title="Xóa ứng dụng"
                >
                  <LucideIcon name="Trash2" size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Short Summary Section */}
        <p className={`text-xs leading-relaxed mb-4 line-clamp-3 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
          {app.description}
        </p>
      </div>

      {/* Footer Controls of Card */}
      <div className={`border-t pt-4 flex items-center justify-between gap-2 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
        {/* Supporting Platform Badges replaced with Tải xuống button */}
        <div>
          {app.sourceCodeUrl ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.sourceCodeUrl, '_blank');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              }`}
              title="Tải mã nguồn đầy đủ từ máy chủ"
            >
              <LucideIcon name="Download" size={12} />
              <span>Tải xuống</span>
            </button>
          ) : (
            <button
              onClick={triggerMockSourceCodeDownload}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-100 shadow-3xs'
              }`}
              title="Tải xuống mã nguồn mẫu tự động của ứng dụng này"
            >
              <LucideIcon name="Download" size={12} />
              <span>Tải xuống (Mẫu)</span>
            </button>
          )}
        </div>

        {/* Dynamic Voting & Simulators Section */}
        <div className="flex items-center gap-2">
          {/* Direct App Link if present */}
          {app.appUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(app.appUrl, '_blank');
              }}
              className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/10 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer"
              title="Mở liên kết ứng dụng trực tiếp"
            >
              <LucideIcon name="ExternalLink" size={12} className="text-emerald-400" />
              <span>Mở Link</span>
            </button>
          )}

          {/* Simulation Playground trigger */}
          <button
            id={`btn-sim-${app.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenSimulator();
            }}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-550/20 rounded-lg px-2.5 py-1.5 transition-all"
          >
            <LucideIcon name="Sparkles" size={12} className="text-cyan-400 animate-pulse" />
            Giả Lập
          </button>

          {/* Upvote score button */}
          <button
            id={`btn-vote-${app.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            className={`flex items-center gap-1 text-[11px] font-medium py-1.5 px-2.5 rounded-lg transition-all border ${
              hasVoted
                ? 'bg-indigo-600 text-white border-indigo-550/30 hover:bg-indigo-700 shadow-md shadow-indigo-500/20'
                : theme === 'dark'
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
                  : 'bg-slate-50 hover:bg-slate-100/80 text-slate-650 border-slate-200'
            }`}
          >
            <LucideIcon name="ThumbsUp" size={11} className={hasVoted ? 'fill-current' : ''} />
            <span>{app.voters.length}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
