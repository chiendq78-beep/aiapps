import React, { useState } from 'react';
import { BugReport } from '../types';
import LucideIcon from './LucideIcon';

interface BugTrackerProps {
  bugs: BugReport[];
  onSubmitBugDirectly: (appId: string, title: string, desc: string, severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng') => void;
  appsList: { id: string; name: string }[];
  theme?: 'light' | 'dark';
}

export default function BugTracker({
  bugs,
  onSubmitBugDirectly,
  appsList,
  theme = 'dark'
}: BugTrackerProps) {
  const [selectedAppId, setSelectedAppId] = useState(appsList[0]?.id || '');
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSeverity, setBugSeverity] = useState<'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng'>('Trung bình');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorWord, setErrorWord] = useState('');
  const [successWord, setSuccessWord] = useState('');

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'Thấp': 
        return theme === 'dark'
          ? 'bg-white/5 text-gray-400 border-white/10'
          : 'bg-slate-100 text-slate-500 border-slate-200';
      case 'Trung bình': 
        return theme === 'dark'
          ? 'bg-blue-550/10 text-blue-400 border-blue-500/20'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cao': 
        return theme === 'dark'
          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Nghiêm trọng': 
        return theme === 'dark'
          ? 'bg-red-500/10 text-red-400 border-red-500/20'
          : 'bg-red-50 text-red-700 border-red-200';
      default: 
        return theme === 'dark'
          ? 'bg-white/5 text-gray-300 border-white/10'
          : 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mới tiếp nhận': 
        return theme === 'dark'
          ? 'bg-white/5 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20'
          : 'bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded border border-yellow-200';
      case 'Đang phân tích': 
        return theme === 'dark'
          ? 'bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20'
          : 'bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200';
      case 'Đang sửa': 
        return theme === 'dark'
          ? 'bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20'
          : 'bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200';
      case 'Đã hoàn thành': 
        return theme === 'dark'
          ? 'bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20'
          : 'bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200';
      default: 
        return theme === 'dark'
          ? 'bg-white/5 text-gray-400 px-2 py-0.5 rounded'
          : 'bg-slate-100 text-slate-500 px-2 py-0.5 rounded';
    }
  };

  const isFormValid = bugTitle.trim().length > 0 && bugDesc.trim().length > 0 && selectedAppId !== '';

  return (
    <div className="space-y-6 select-none font-sans animate-fade-in">
      
      {/* Overview Banner for Bug Tracker */}
      <div className={`p-6 rounded-2xl bg-gradient-to-r ${theme === 'dark' ? 'from-sky-950/20 via-sky-900/10 to-transparent border-sky-500/15' : 'from-sky-100/40 via-sky-50/10 to-transparent border-sky-200/50'} border backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div>
          <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-805'} flex items-center gap-2`}>
            <LucideIcon name="Bug" className="text-red-400 animate-pulse" />
            Hệ Thống Tiếp Nhận & Khắc Phục Lỗi Hệ Thống
          </h3>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-650'} mt-1 max-w-xl leading-relaxed`}>
            Khi phát hiện lỗi hoặc sai sót hiển thị của bất kỳ ứng dụng nào trong hệ sinh thái, vui lòng gửi phản ánh tại đây. Đội kỹ thuật sẽ khắc phục sớm nhất và cập nhật trạng thái xử lý công khai.
          </p>
        </div>

        <button
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setErrorWord('');
            setSuccessWord('');
          }}
          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-red-650/20 cursor-pointer self-stretch md:self-auto text-center justify-center border border-red-550/20"
        >
          <LucideIcon name={isFormOpen ? 'X' : 'Plus'} size={14} />
          {isFormOpen ? 'Đóng bảng báo lỗi' : 'Báo cáo lỗi kỹ thuật'}
        </button>
      </div>

      {/* Embedded Bug Reporting Form */}
      {isFormOpen && (
        <div className={`p-5 rounded-2xl border backdrop-blur-xl space-y-4 animate-fade-in text-xs font-sans ${
          theme === 'dark' 
            ? 'bg-slate-900/45 border-sky-500/15 text-white shadow-[0_10px_35px_rgba(0,0,0,0.45),_inset_1px_1px_0px_rgba(255,255,255,0.05)]' 
            : 'bg-white/60 border-white/80 text-slate-800 shadow-[0_15px_35px_rgba(14,165,233,0.06),_inset_1px_1px_0px_rgba(255,255,255,1)]'
        }`}>
          <h4 className={`text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-white' : 'text-red-600'}`}>Phiếu Gửi Báo Cáo Lỗi Trực Tiếp</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={`text-[11px] font-bold block mb-1 font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-slate-505'}`}>ỨNG DỤNG PHÁT SINH LỖI *</label>
              <select
                value={selectedAppId}
                onChange={(e) => {
                  setSelectedAppId(e.target.value);
                  setErrorWord('');
                }}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-sans ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {appsList.map(app => (
                  <option key={app.id} value={app.id}>{app.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`text-[11px] font-bold block mb-1 font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-slate-505'}`}>TIÊU ĐỀ LỖI NGẮN GỌN *</label>
              <input
                type="text"
                placeholder="VD: Không đồng bộ lịch, hỏng app..."
                value={bugTitle}
                onChange={(e) => {
                  setBugTitle(e.target.value);
                  setErrorWord('');
                  setSuccessWord('');
                }}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`text-[11px] font-bold block mb-1 font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-slate-505'}`}>ĐỘ KHẨN CẤP</label>
              <select
                value={bugSeverity}
                onChange={(e) => setBugSeverity(e.target.value as any)}
                className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer font-sans ${
                  theme === 'dark' 
                    ? 'bg-neutral-900 border-white/10 text-white' 
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="Thấp">Thấp (Thẩm mỹ & Văn bản)</option>
                <option value="Trung bình">Trung bình (Khó thao tác)</option>
                <option value="Cao">Cao (Hỏng tính năng phụ)</option>
                <option value="Nghiêm trọng">🚨 Nghiêm trọng (Treo luồng chính)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`text-[11px] font-bold block mb-1 font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-slate-505'}`}>NỘI DUNG CHI TIẾT VỀ HÀNH VI LỖI *</label>
            <textarea
              placeholder="Vui lòng tả cụ thể hành động bạn vừa thực hiện, lỗi phát sinh cụ thể là gì..."
              rows={3}
              value={bugDesc}
              onChange={(e) => {
                setBugDesc(e.target.value);
                setErrorWord('');
                setSuccessWord('');
              }}
              className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-all font-sans ${
                theme === 'dark' 
                  ? 'bg-white/5 border-white/10 text-white' 
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {errorWord && (
            <p className="text-[11px] text-rose-450 font-bold bg-rose-500/10 p-2.5 rounded-lg flex items-center gap-1.5 animate-pulse font-sans">
              <LucideIcon name="AlertTriangle" size={13} />
              {errorWord}
            </p>
          )}

          {successWord && (
            <p className="text-[11px] text-emerald-455 font-bold bg-emerald-500/10 p-2.5 rounded-lg flex items-center gap-1.5 font-sans">
              <LucideIcon name="CheckCircle2" size={13} />
              {successWord}
            </p>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              onClick={() => {
                setBugTitle('');
                setBugDesc('');
                setIsFormOpen(false);
                setErrorWord('');
                setSuccessWord('');
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
                if (!bugTitle.trim() || !bugDesc.trim() || !selectedAppId) {
                  setErrorWord('Vui lòng điền đủ tiêu đề và nội dung mô tả hành vi lỗi nhé.');
                  return;
                }
                onSubmitBugDirectly(selectedAppId, bugTitle.trim(), bugDesc.trim(), bugSeverity);
                setBugTitle('');
                setBugDesc('');
                setErrorWord('');
                setSuccessWord('Khởi tạo lỗi thành công! Đã gửi email cập nhật lập tức tới hệ thống quản trị viên.');
                
                // Keep success visible brief time then retract form
                setTimeout(() => {
                  setSuccessWord('');
                  setIsFormOpen(false);
                }, 3500);
              }}
              disabled={!isFormValid}
              className={`font-semibold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-all ${
                isFormValid 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/15'
                  : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              Gửi báo lỗi khẩn
            </button>
          </div>
        </div>
      )}

      {/* Active bugs timeline list */}
      <div className="space-y-4">
        <h4 className={`text-xs font-bold uppercase tracking-widest px-1 font-mono ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Danh sách lỗi đang vận hành xử lý ({bugs.length})</h4>
        
        <div className="space-y-3">
          {bugs.map((bug) => (
            <div
              key={bug.id}
              className={`p-5 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.025] flex flex-col md:flex-row justify-between gap-4 ${
                theme === 'dark' 
                  ? 'bg-slate-900/40 border-sky-500/15 hover:border-sky-450 hover:bg-slate-900/50 hover:shadow-[0_12px_25px_rgba(0,0,0,0.5),_inset_1px_1px_0px_rgba(255,255,255,0.08)] shadow-[4px_4px_12px_rgba(0,0,0,0.4),_inset_1px_1px_0px_rgba(255,255,255,0.05)] text-[#e0f2fe]' 
                  : 'bg-white/50 border-white/80 hover:bg-white/60 hover:shadow-[0_12px_25px_rgba(14,165,233,0.1),_inset_1px_1px_0px_rgba(255,255,255,0.9)] shadow-[6px_6px_20px_rgba(15,23,42,0.05),_inset_1px_1px_0px_rgba(255,255,255,0.8)] text-slate-800'
              }`}
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getSeverityStyle(bug.severity)}`}>
                    🛡️ {bug.severity.toUpperCase()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono border truncate max-w-[150px] ${
                    theme === 'dark'
                      ? 'bg-white/5 text-indigo-300 border-white/10'
                      : 'bg-indigo-50/70 text-indigo-700 border-indigo-200'
                  }`}>
                    {bug.appName}
                  </span>
                  <span className={`text-[10px] truncate max-w-[180px] ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>bởi {bug.reporterEmail}</span>
                </div>

                <div>
                  <h5 className={`font-bold text-sm leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    {bug.title}
                  </h5>
                  <p className={`text-xs mt-2 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>
                    {bug.description}
                  </p>
                </div>

                {/* Developer Notes */}
                {bug.notes && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 max-w-3xl leading-relaxed border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-indigo-300'
                      : 'bg-indigo-50/50 border-indigo-100 text-indigo-700'
                  }`}>
                    <span className="text-base select-none">🧑‍💻</span>
                    <div>
                      <strong className={`font-sans text-xs ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Phản hồi từ kỹ thuật viên:</strong>
                      <p className={`mt-1 text-[11px] leading-relaxed font-sans ${theme === 'dark' ? 'text-gray-400' : 'text-slate-600'}`}>{bug.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status flag section */}
              <div className="flex flex-col items-start md:items-end justify-between shrink-0 font-sans">
                <span className={`text-[10px] font-bold ${getStatusColor(bug.status)}`}>
                  {bug.status}
                </span>
                <span className={`text-[9px] font-mono mt-2 md:mt-0 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                  {new Date(bug.createdAt).toLocaleDateString('vi-VN')} {new Date(bug.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
