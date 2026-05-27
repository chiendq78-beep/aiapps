import React, { useState } from 'react';
import { CommunitySuggestion, AppIdea } from '../types';
import LucideIcon from './LucideIcon';

interface CommunityBoardProps {
  suggestions: CommunitySuggestion[];
  onVoteSuggestion: (id: string) => void;
  onSubmitSuggestion: (title: string, desc: string, category: 'Feature' | 'New App' | 'Improvement' | 'UI/UX', targetAppId?: string) => void;
  onEditSuggestion?: (id: string, title: string, desc: string, category: 'Feature' | 'New App' | 'Improvement' | 'UI/UX', targetAppId?: string) => void;
  onDeleteSuggestion?: (id: string) => void;
  apps?: AppIdea[];
  theme?: 'light' | 'dark';
  isAdminMode?: boolean;
}

export default function CommunityBoard({
  suggestions,
  onVoteSuggestion,
  onSubmitSuggestion,
  onEditSuggestion,
  onDeleteSuggestion,
  apps = [],
  theme = 'dark',
  isAdminMode = false
}: CommunityBoardProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'Feature' | 'New App' | 'Improvement' | 'UI/UX'>('New App');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasVotedSet, setHasVotedSet] = useState<Record<string, boolean>>({});
  const [errorWord, setErrorWord] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<'Feature' | 'New App' | 'Improvement' | 'UI/UX'>('New App');
  const [editSelectedAppId, setEditSelectedAppId] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    type: 'vote' | 'suggest' | 'delete-suggestion' | 'edit-suggestion';
    suggestionId?: string;
    title?: string;
    desc?: string;
    category?: 'Feature' | 'New App' | 'Improvement' | 'UI/UX';
    targetAppId?: string;
  } | null>(null);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'New App': 
        return theme === 'dark' 
          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
          : 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Feature': 
        return theme === 'dark' 
          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
          : 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Improvement': 
        return theme === 'dark' 
          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
          : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'UI/UX': 
        return theme === 'dark' 
          ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' 
          : 'bg-pink-50 text-pink-700 border-pink-200';
      default: 
        return theme === 'dark' 
          ? 'bg-white/5 text-gray-300 border-white/10' 
          : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const isFormValid = newTitle.trim().length > 0 && newDesc.trim().length > 0;

  return (
    <div className="space-y-6 select-none">
      
      {/* Top Banner introducing community roadmap ideas */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r ${theme === 'dark' ? 'from-sky-950/20 via-sky-900/10 to-transparent border-sky-500/15' : 'from-sky-100/40 via-sky-50/10 to-transparent border-sky-200/50'} border backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-850'} flex items-center gap-2`}>
            <LucideIcon name="Sparkles" className="text-indigo-400 animate-pulse" />
            Vườn Ươm Ý Tưởng & Đề Xuất Cộng Đồng
          </h3>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'} mt-1 max-w-xl leading-relaxed`}>
            Hãy đóng góp hoặc bỏ phiếu cho dự án/tính năng mà quý vị mong muốn chúng tôi thiết kế tiếp theo! Ý tưởng có số phiếu bầu cao nhất sẽ được đưa vào lộ trình phát triển chính thức.
          </p>
        </div>

        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setErrorWord('');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer self-stretch md:self-auto text-center justify-center border border-indigo-550/30"
        >
          <LucideIcon name={isFormOpen ? 'X' : 'Plus'} size={14} />
          {isFormOpen ? 'Đóng bảng' : 'Đóng góp ý tưởng'}
        </button>
      </div>

      {/* Idea Contribution Form */}
      {isFormOpen && (
        <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-4 animate-fade-in text-xs ${
          theme === 'dark' 
            ? 'bg-slate-900/45 border-sky-500/15 text-white shadow-[0_10px_35px_rgba(0,0,0,0.45),_inset_1px_1px_0px_rgba(255,255,255,0.05)]' 
            : 'bg-white/60 border-white/80 text-slate-800 shadow-[0_15px_35px_rgba(14,165,233,0.06),_inset_1px_1px_0px_rgba(255,255,255,1)]'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-indigo-600'}`}>Mẫu Đề Xuất Phát Triển Ý Tưởng</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
            <div className="sm:col-span-2">
              <label className={`text-[11px] font-bold block mb-1 ${theme === 'dark' ? 'text-gray-455' : 'text-slate-500'}`}>Tên đề xuất / Sáng kiến học tập *</label>
              <input
                type="text"
                placeholder="VD: Mô-đun tự kiểm tra ôn thi tiếng anh trực tuyến..."
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (e.target.value) setErrorWord('');
                }}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`text-[11px] font-bold block mb-1 ${theme === 'dark' ? 'text-gray-455' : 'text-slate-500'}`}>Phân mục đề tài</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-505 transition-all cursor-pointer font-sans ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="New App">⚙️ Ứng dụng mới (New App)</option>
                <option value="Feature">🚀 Tính năng mới (Feature)</option>
                <option value="Improvement">🔄 Cải tiến cốt lõi (Improvement)</option>
                <option value="UI/UX">🎨 Thẩm mỹ Giao diện (UI/UX)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`text-[11px] font-bold block mb-1 ${theme === 'dark' ? 'text-gray-455' : 'text-slate-500'}`}>Gợi ý cách triển khai, giải pháp đề xuất *</label>
            <textarea
              placeholder="Ghi cụ thể tính năng đó sẽ hỗ trợ người dùng giải quyết bài toán gì, giao diện dự kiến ra sao..."
              rows={3}
              value={newDesc}
              onChange={(e) => {
                setNewDesc(e.target.value);
                if (e.target.value) setErrorWord('');
              }}
              className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {newCategory !== 'New App' && (
            <div className="animate-fade-in font-sans">
              <label className={`text-[11px] font-bold block mb-1 ${theme === 'dark' ? 'text-gray-455' : 'text-slate-500'}`}>Liên kết với ứng dụng trong danh mục</label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-505 transition-all cursor-pointer font-sans ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="">-- Chọn ứng dụng cần đóng góp ý kiến (Tùy chọn) --</option>
                {apps.map(app => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {errorWord && (
            <p className="text-[11px] text-rose-400 font-bold bg-rose-500/10 p-2 rounded-lg flex items-center gap-1.5 animate-pulse">
              <LucideIcon name="AlertTriangle" size={12} />
              {errorWord}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => {
                setNewTitle('');
                setNewDesc('');
                setSelectedAppId('');
                setIsFormOpen(false);
                setErrorWord('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                theme === 'dark' 
                  ? 'hover:bg-white/5 text-gray-400 hover:text-white' 
                  : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => {
                if (!newTitle.trim() || !newDesc.trim()) {
                  setErrorWord('Vui lòng điền đầy đủ tiêu đề và mô tả triển khai sáng kiến của bạn nhé.');
                  return;
                }
                setConfirmAction({
                  type: 'suggest',
                  title: newTitle.trim(),
                  desc: newDesc.trim(),
                  category: newCategory,
                  targetAppId: selectedAppId || undefined
                });
              }}
              disabled={!isFormValid}
              className={`font-semibold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all ${
                isFormValid 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15'
                  : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              Phát ý tưởng ngay
            </button>
          </div>
        </div>
      )}

      {/* Suggestion list */}
      <div className="space-y-4">
        <h4 className={`text-xs font-bold uppercase tracking-widest px-1 font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Danh sách ý tưởng đóng góp ({suggestions.length})</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => {
            if (editingId === suggestion.id) {
              const editFormValid = editTitle.trim().length > 0 && editDesc.trim().length > 0;
              return (
                <div
                  key={suggestion.id}
                  className={`p-5 rounded-2xl border font-sans space-y-3 ${
                    theme === 'dark' 
                      ? 'bg-neutral-900 border-indigo-500/30 text-white' 
                      : 'bg-white border-indigo-200 shadow-md text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-505 dark:text-indigo-405 font-mono">Sửa Đóng Góp Ý Tưởng</span>
                    <span className={`text-[9px] ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'} font-mono`}>bởi {suggestion.suggestedBy}</span>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/10 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      placeholder="Tên đề xuất..."
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value as any)}
                        className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-550 transition-all cursor-pointer font-sans ${
                          theme === 'dark' 
                            ? 'bg-neutral-950 border-white/10 text-white' 
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="New App">💡 Ứng dụng mới</option>
                        <option value="Feature">🚀 Tính năng mới</option>
                        <option value="Improvement">🔄 Cải tiến</option>
                        <option value="UI/UX">🎨 Giao diện</option>
                      </select>

                      <select
                        value={editSelectedAppId}
                        disabled={editCategory === 'New App'}
                        onChange={(e) => setEditSelectedAppId(e.target.value)}
                        className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-550 transition-all font-sans cursor-pointer ${
                          editCategory === 'New App' ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          theme === 'dark' 
                            ? 'bg-neutral-950 border-white/10 text-white' 
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">-- Liên kết ứng dụng --</option>
                        {apps.map(app => (
                          <option key={app.id} value={app.id}>
                            {app.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className={`w-full border rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans ${
                        theme === 'dark' 
                          ? 'bg-white/5 border-white/10 text-white' 
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      placeholder="Mô tả triển khai..."
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans cursor-pointer transition-colors ${
                        theme === 'dark' 
                          ? 'hover:bg-white/5 text-gray-400 hover:text-white' 
                          : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Hủy bỏ
                    </button>
                     <button
                      onClick={() => {
                        if (editFormValid) {
                          setConfirmAction({
                            type: 'edit-suggestion',
                            suggestionId: suggestion.id,
                            title: editTitle.trim(),
                            desc: editDesc.trim(),
                            category: editCategory,
                            targetAppId: editSelectedAppId || undefined
                          });
                        }
                      }}
                      disabled={!editFormValid}
                      className={`font-semibold text-xs px-4 py-1.5 rounded-lg cursor-pointer transition-all ${
                        editFormValid 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                      }`}
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              );
            }

            const hasVoted = hasVotedSet[suggestion.id] || suggestion.votedEmails.includes('chiendq78@gmail.com');
            const linkedApp = apps.find(a => a.id === suggestion.targetAppId);
            return (
              <div
                key={suggestion.id}
                className={`p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.025] flex justify-between items-start gap-4 ${
                  theme === 'dark' 
                    ? 'bg-slate-900/40 border-sky-500/15 hover:border-sky-450 hover:bg-slate-900/50 hover:shadow-[0_12px_25px_rgba(0,0,0,0.5),_inset_1px_1px_0px_rgba(255,255,255,0.08)] shadow-[4px_4px_12px_rgba(0,0,0,0.4),_inset_1px_1px_0px_rgba(255,255,255,0.05)] text-[#e0f2fe]' 
                    : 'bg-white/50 border-white/80 hover:bg-white/60 hover:shadow-[0_12px_25px_rgba(14,165,233,0.1),_inset_1px_1px_0px_rgba(255,255,255,0.9)] shadow-[6px_6px_20px_rgba(15,23,42,0.05),_inset_1px_1px_0px_rgba(255,255,255,0.8)] text-slate-800'
                }`}
              >
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(suggestion.category)}`}>
                      {suggestion.category === 'New App' ? '💡 Ứng dụng mới' : suggestion.category === 'Feature' ? '🚀 Tính năng mới' : suggestion.category === 'Improvement' ? '🔄 Cải tiến' : '🎨 Giao diện'}
                    </span>
                    {linkedApp && (
                      <span className={`text-[10px] inline-flex items-center px-2 py-0.5 rounded-full border font-semibold ${
                        theme === 'dark'
                          ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-150'
                      }`}>
                        <LucideIcon name={linkedApp.icon as any} size={10} className="mr-1 bg-indigo-500/10 dark:bg-transparent rounded" />
                        {linkedApp.name}
                      </span>
                    )}
                    <span className={`text-[10px] truncate max-w-[150px] ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`} title={suggestion.suggestedBy}>bởi {suggestion.suggestedBy}</span>

                    {/* Admin Actions */}
                    {isAdminMode && (
                      <div className="flex items-center gap-1.5 ml-auto select-none">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(suggestion.id);
                            setEditTitle(suggestion.title);
                            setEditDesc(suggestion.description);
                            setEditCategory(suggestion.category);
                            setEditSelectedAppId(suggestion.targetAppId || '');
                          }}
                          className="p-1 rounded hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                          title="Sửa đóng góp"
                        >
                          <LucideIcon name="Edit" size={11} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmAction({
                              type: 'delete-suggestion',
                              suggestionId: suggestion.id,
                              title: suggestion.title,
                              desc: 'Bạn có chắc chắn muốn xóa vĩnh viễn ý tưởng đề xuất này khỏi hệ thống không?'
                            });
                          }}
                          className="p-1 rounded hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Xóa đóng góp"
                        >
                          <LucideIcon name="Trash2" size={11} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className={`font-bold text-sm leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {suggestion.title}
                    </h5>
                    <p className={`text-xs mt-2 leading-relaxed line-clamp-3 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-650'}`}>
                      {suggestion.description}
                    </p>
                  </div>

                  <span className={`text-[9px] font-mono block ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                    Khởi tạo: {new Date(suggestion.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                {/* Vote button panel */}
                <button
                  onClick={() => {
                    const hasVoted = hasVotedSet[suggestion.id] || suggestion.votedEmails.includes('chiendq78@gmail.com');
                    setConfirmAction({
                      type: 'vote',
                      suggestionId: suggestion.id,
                      title: suggestion.title,
                      desc: hasVoted 
                        ? 'Bạn có chắc chắn muốn hủy bỏ bình chọn đã gửi cho sáng kiến này?' 
                        : 'Bạn có chắc chắn muốn gửi bình chọn của mình cho sáng kiến này?'
                    });
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border w-14 shrink-0 transition-all hover:scale-[1.05] cursor-pointer ${
                    hasVoted
                      ? 'bg-sky-650 text-white border-sky-500/30 hover:bg-sky-750 shadow-md shadow-sky-650/40'
                      : theme === 'dark'
                        ? 'bg-sky-500/5 hover:bg-sky-500/15 border-sky-500/15 text-sky-200'
                        : 'bg-sky-50/50 hover:bg-sky-100/55 border-sky-200/50 text-sky-700 shadow-3xs'
                  }`}
                >
                  <LucideIcon name="ThumbsUp" size={14} className={hasVoted ? 'fill-current' : ''} />
                  <span className="text-xs font-bold mt-1 leading-none">{suggestion.votes}</span>
                  <span className="text-[8px] text-gray-500 h-2 mt-1.5 leading-none font-mono tracking-widest font-bold">VOTE</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom 'Are you sure?' Confirmation Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in select-none">
          <div 
            className={`w-full max-w-sm rounded-2xl border p-6 shadow-2xl transition-all scale-100 ${
              theme === 'dark'
                ? 'bg-slate-900 border-white/10 text-white shadow-indigo-500/10'
                : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
            }`}
          >
            {/* Header with Icon */}
            <div className="flex items-center gap-3 border-b pb-4 mb-4 border-slate-200/50 dark:border-white/10">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                <LucideIcon name="HelpCircle" size={20} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-600 dark:text-indigo-400 font-mono">Xác thực hành động</h4>
                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Bạn có chắc chắn không?</p>
              </div>
            </div>

            {/* Login Status & Profile verification */}
            <div className={`p-3 rounded-xl border flex items-center gap-2.5 mb-4 ${
              theme === 'dark' 
                ? 'bg-emerald-500/5 border-emerald-500/20' 
                : 'bg-emerald-50 border-emerald-100'
            }`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                <LucideIcon name="Check" size={10} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider font-mono">Tài khoản quản trị</p>
                <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-slate-350' : 'text-slate-600'}`}>chiendq78@gmail.com</p>
              </div>
            </div>

            {/* Decision Details block */}
            <div className={`p-4 rounded-xl mb-6 text-xs space-y-2.5 border ${
              theme === 'dark'
                ? 'bg-white/5 border-white/5 text-slate-300'
                : 'bg-slate-50 border-slate-100 text-slate-600'
            }`}>
              {confirmAction.type === 'suggest' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono">Phân mục:</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(confirmAction.category!)}`}>
                      {confirmAction.category === 'New App' ? '💡 Ứng dụng mới' : confirmAction.category === 'Feature' ? '🚀 Tính năng mới' : confirmAction.category === 'Improvement' ? '🔄 Cải tiến' : '🎨 Giao diện'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono block mb-0.5">Ý tưởng:</span>
                    <p className={`font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{confirmAction.title}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono block mb-0.5">Triển khai & Giải pháp:</span>
                    <p className="text-[11px] leading-relaxed line-clamp-3">{confirmAction.desc}</p>
                  </div>
                </>
              ) : confirmAction.type === 'edit-suggestion' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono">Thao tác:</span>
                    <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-405 font-mono">CẬP NHẬT Ý TƯỞNG</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono">Phân mục mới:</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(confirmAction.category!)}`}>
                      {confirmAction.category === 'New App' ? '💡 Ứng dụng mới' : confirmAction.category === 'Feature' ? '🚀 Tính năng mới' : confirmAction.category === 'Improvement' ? '🔄 Cải tiến' : '🎨 Giao diện'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono block mb-0.5">Ý tưởng mới:</span>
                    <p className={`font-bold ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{confirmAction.title}</p>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono block mb-0.5">Triển khai mới:</span>
                    <p className="text-[11px] leading-relaxed line-clamp-3">{confirmAction.desc}</p>
                  </div>
                </>
              ) : confirmAction.type === 'delete-suggestion' ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono">Thao tác:</span>
                    <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 font-mono">XÓA ĐÓNG GÓP Ý TƯỞNG</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono block mb-0.5">Ý tưởng:</span>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{confirmAction.title}</p>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-500 font-semibold">{confirmAction.desc}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono">Thao tác:</span>
                    <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 font-mono">BẦU CHỌN Ý TƯỞNG</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider font-mono block mb-0.5">Ý tưởng:</span>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{confirmAction.title}</p>
                  </div>
                  <p className="text-[11px] leading-relaxed">{confirmAction.desc}</p>
                </>
              )}
            </div>

            {/* Button Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold font-sans cursor-pointer transition-colors text-center border ${
                  theme === 'dark'
                    ? 'border-white/10 hover:bg-white/5 text-gray-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                }`}
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'suggest') {
                    onSubmitSuggestion(confirmAction.title!, confirmAction.desc!, confirmAction.category!, confirmAction.targetAppId);
                    setNewTitle('');
                    setNewDesc('');
                    setSelectedAppId('');
                    setIsFormOpen(false);
                    setErrorWord('');
                  } else if (confirmAction.type === 'edit-suggestion') {
                    if (onEditSuggestion) {
                      onEditSuggestion(confirmAction.suggestionId!, confirmAction.title!, confirmAction.desc!, confirmAction.category!, confirmAction.targetAppId);
                    }
                    setEditingId(null);
                  } else if (confirmAction.type === 'vote') {
                    onVoteSuggestion(confirmAction.suggestionId!);
                    setHasVotedSet(prev => ({ ...prev, [confirmAction.suggestionId!]: !prev[confirmAction.suggestionId!] }));
                  } else if (confirmAction.type === 'delete-suggestion') {
                    if (onDeleteSuggestion) {
                      onDeleteSuggestion(confirmAction.suggestionId!);
                    }
                  }
                  setConfirmAction(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer text-center font-sans tracking-wide transition-all hover:scale-[1.01] ${
                  confirmAction.type === 'delete-suggestion'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-650/10'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-650/10'
                }`}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

