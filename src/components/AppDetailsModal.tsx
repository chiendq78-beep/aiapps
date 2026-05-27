import React, { useState } from 'react';
import { AppIdea, Changelog } from '../types';
import LucideIcon from './LucideIcon';

interface AppDetailsModalProps {
  app: AppIdea;
  hasVoted: boolean;
  onClose: () => void;
  onVote: () => void;
  onOpenSimulator: () => void;
  onSubmitBug: (bugTitle: string, bugDesc: string, severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng') => void;
  onSubmitRating: (stars: number) => void;
  isAdminMode?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function AppDetailsModal({
  app,
  hasVoted,
  onClose,
  onVote,
  onOpenSimulator,
  onSubmitBug,
  onSubmitRating,
  isAdminMode = false,
  onEdit,
  onDelete
}: AppDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'changelog' | 'bug'>('info');

  // Bug form states
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng'>('Trung bình');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  // User Rating Rating state
  const [usrStars, setUsrStars] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Thấp': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Trung bình': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Cao': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Nghiêm trọng': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center p-4 pt-10 sm:pt-16 md:pt-24 overflow-y-auto animate-fade-in">
      <div 
        id={`modal-${app.id}`} 
        className="backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border border-white/30 dark:border-slate-800/80 w-full max-w-xl rounded-[22px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col max-h-[82vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-850 flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/15">
              <LucideIcon name={app.icon} size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{app.name}</h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 font-mono">
                  v{app.currentVersion}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                <span>Khuyên dùng trên:</span>
                <strong>{app.platforms.join(', ')}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isAdminMode && (
              <div className="flex items-center gap-1.5 select-none mr-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEdit) onEdit();
                  }}
                  className="p-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all cursor-pointer flex items-center justify-center"
                  title="Sửa ứng dụng"
                >
                  <LucideIcon name="Pencil" size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete();
                  }}
                  className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 dark:text-rose-400 hover:bg-rose-500/20 hover:text-rose-600 dark:hover:text-rose-350 transition-all cursor-pointer flex items-center justify-center"
                  title="Xóa ứng dụng"
                >
                  <LucideIcon name="Trash2" size={14} />
                </button>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <LucideIcon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-850 px-5 bg-slate-50/50 dark:bg-slate-950/20">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'info' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <LucideIcon name="Sparkles" size={14} />
            Giới Thiệu Chung
          </button>
          <button
            onClick={() => setActiveTab('changelog')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'changelog' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <LucideIcon name="Clock" size={14} />
            Lịch Sử Cập Nhật
          </button>
          <button
            onClick={() => setActiveTab('bug')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bug' 
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' 
                : 'border-transparent text-gray-550 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            <LucideIcon name="Bug" size={14} />
            Báo lỗi & Đóng góp
          </button>
        </div>

        {/* Tabs Content */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: OVERVIEW INFO */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả chi tiết tính năng</h4>
                <p className="text-gray-700 dark:text-gray-350 text-xs leading-relaxed">
                  {app.description}
                </p>
              </div>

              {/* Compact bar: Votes, Ratings & Launch Simulator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80 text-xs">
                {/* Left side: Votes & Ratings compact and inline */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {/* Votes */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bình chọn:</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{app.voters.length}</span>
                    <button
                      onClick={onVote}
                      className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border transition-all cursor-pointer ${
                        hasVoted
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white hover:bg-slate-100 dark:bg-slate-850 hover:dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <LucideIcon name="ThumbsUp" size={10} className={hasVoted ? 'fill-current' : ''} />
                      {hasVoted ? 'Đã bình chọn' : 'Bình chọn'}
                    </button>
                  </div>

                  {/* Ratings */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Đánh giá:</span>
                    <div className="flex items-center gap-1">
                      <LucideIcon name="Star" className="text-amber-500 fill-current" size={12} />
                      <span className="font-bold text-gray-800 dark:text-slate-100">{app.rating}</span>
                      <span className="text-[10px] text-gray-500">({app.ratingCount})</span>
                    </div>

                    {!ratingSubmitted ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            onClick={() => {
                              onSubmitRating(stars);
                              setRatingSubmitted(true);
                            }}
                            className="p-0.5 text-gray-300 hover:text-amber-400 hover:scale-110 transition-all cursor-pointer"
                            title={`Đánh giá ${stars} sao`}
                          >
                            <LucideIcon name="Star" size={11} className={usrStars >= stars ? 'text-amber-400 fill-current' : ''} />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">Cảm ơn!</span>
                    )}
                  </div>
                </div>

                {/* Right side: Launch Simulator button */}
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 sm:self-stretch select-none">
                  <button
                    onClick={() => {
                      onOpenSimulator();
                      onClose();
                    }}
                    className="sm:self-stretch bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-700 hover:to-cyan-600 text-white font-bold py-1.5 px-3.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer text-[10px] uppercase tracking-wider"
                  >
                    <LucideIcon name="Sparkles" size={12} />
                    <span>Mở Trình Giả Lập</span>
                  </button>

                  {app.appUrl && (
                    <button
                      onClick={() => {
                        window.open(app.appUrl, '_blank');
                      }}
                      className="sm:self-stretch bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-1.5 px-3.5 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] cursor-pointer text-[10px] uppercase tracking-wider"
                      title="Mở liên kết ứng dụng trực tiếp trong tab mới"
                    >
                      <LucideIcon name="ExternalLink" size={12} />
                      <span>Mở Ứng Dụng</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGELOG / TIMELINE */}
          {activeTab === 'changelog' && (
            <div className="space-y-6">
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6 pb-4">
                {app.changelogs.map((changelog, cIdx) => (
                  <div key={changelog.version} className="relative pl-6 animate-fade-in" style={{ animationDelay: `${cIdx * 50}ms` }}>
                    {/* Ring timeline marker */}
                    <span className="absolute -left-[9px] top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-indigo-500 text-white ring-4 ring-white dark:ring-slate-900 shadow">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </span>

                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          Phiên bản {changelog.version} 
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            changelog.type === 'major' 
                              ? 'bg-rose-500/10 text-rose-500' 
                              : changelog.type === 'minor' 
                                ? 'bg-indigo-500/10 text-indigo-500' 
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            {changelog.type.toUpperCase()}
                          </span>
                        </h4>
                        <span className="text-xs text-gray-500">{changelog.date}</span>
                      </div>

                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1.5">{changelog.title}</p>
                      
                      <ul className="mt-2.5 space-y-1.5">
                        {changelog.changes.map((item, idx) => (
                          <li key={idx} className="text-xs text-gray-650 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">&#8226;</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REPORT BUG */}
          {activeTab === 'bug' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Đóng góp báo cáo lỗ hoặc sáng kiến</h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                  Ý kiến của quý vị trực tiếp cải thiện độ tin cậy của mã nguồn! Gửi báo lỗi của bạn ở đây và đồng bộ trực tiếp lên hệ sinh thái của nhà phát triển.
                </p>
              </div>

              {!bugSubmitted ? (
                <div className="space-y-4 border border-slate-200 dark:border-slate-800 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-400 block mb-1">
                      Mô tả ngắn lỗi gặp phải *
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Lỗi tràn bộ nhớ khi lọc, lỗi đơ nút bấm đăng ảnh..."
                      required
                      value={bugTitle}
                      onChange={(e) => setBugTitle(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-850 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-400 block mb-1">
                        Mức độ nghiêm trọng
                      </label>
                      <select
                        value={bugSeverity}
                        onChange={(e) => setBugSeverity(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-850 dark:text-white"
                      >
                        <option value="Thấp">Thấp (Lỗi UI nhỏ, thụt lề...)</option>
                        <option value="Trung bình">Trung bình (Lỗi tính năng không khẩn...)</option>
                        <option value="Cao">Cao (Khách không thể in hóa đơn, sai lệch điểm...)</option>
                        <option value="Nghiêm trọng">Nghiêm trọng (Crash sập app, mất trắng dữ liệu...)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-400 block mb-1">
                        Email liên lạc phản hồi
                      </label>
                      <input
                        type="email"
                        value="chiendq78@gmail.com"
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 dark:text-gray-400 block mb-1">
                      Chi tiết hành vi lỗi & Cách thức tái hiện *
                    </label>
                    <textarea
                      placeholder="Mô tả cụ thể chuyện gì đã diễn khi khi bạn bấm phím, dòng máy điện thoại hoặc trình duyệt nào..."
                      rows={4}
                      value={bugDesc}
                      onChange={(e) => setBugDesc(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-850 dark:text-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!bugTitle || !bugDesc) {
                        alert('Vui lòng điền đủ tiêu đề và nội dung mô tả lỗi nhé!');
                        return;
                      }
                      onSubmitBug(bugTitle, bugDesc, bugSeverity);
                      setBugSubmitted(true);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Gửi Báo Cáo Lỗi Lên Nhà Phát Triển
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-6 rounded-xl text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                    <LucideIcon name="CheckCircle2" size={24} />
                  </div>
                  <h4 className="font-bold text-sm">GỬI BÁO CÁO LỖI THÀNH CÔNG!</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Cảm ơn bạn đã đóng góp phần giúp ứng dụng ngày một thông suốt. Hệ thống soát lỗi tự động đã chuyển đến máy chủ nhà phát triển. Một email cập nhật sẽ tự động gửi tới chiendq78@gmail.com khi trạng thái khắc phục thay đổi.
                  </p>
                  <button
                    onClick={() => {
                      setBugTitle('');
                      setBugDesc('');
                      setBugSubmitted(false);
                    }}
                    className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Gộp thêm một lỗi khác
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="py-2.5 border-t border-slate-200/50 dark:border-slate-850 flex items-center justify-between bg-slate-55/80 dark:bg-slate-950/20 px-5 gap-2">
          <span className="text-[9px] text-gray-400/80">Copyright &copy; 2026 App Portfolio Hub. All rights reserved.</span>
          <button 
            onClick={onClose} 
            className="px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-650 dark:text-gray-300 rounded-md text-[11px] font-bold cursor-pointer transition-all"
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}
