import React from 'react';
import { SystemNotification } from '../types';
import LucideIcon from './LucideIcon';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  isOpen: boolean;
  onClearAll: () => void;
  onClose: () => void;
}

export default function NotificationCenter({
  notifications,
  isOpen,
  onClearAll,
  onClose
}: NotificationCenterProps) {
  if (!isOpen) return null;

  return (
    <div 
      id="notification-center-drawer"
      className="fixed top-0 right-0 h-full w-full max-w-sm backdrop-blur-2xl bg-white/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/20">
        <div className="flex items-center gap-2">
          <LucideIcon name="Bell" className="text-indigo-500 animate-bounce" size={18} />
          <h3 className="font-bold text-sm text-gray-950 dark:text-white">Trung Tâm Thông Báo Đẩy</h3>
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-gray-400 hover:text-white hover:bg-slate-850 cursor-pointer"
        >
          <LucideIcon name="X" size={16} />
        </button>
      </div>

      {/* Notifications feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
            <LucideIcon name="CheckCircle2" size={32} className="text-gray-300 dark:text-slate-755" />
            <p className="text-xs font-semibold">Tất cả thông báo đã đọc!</p>
            <p className="text-[10px] text-gray-500">Chúng tôi sẽ báo cho bạn khi có bản phát hành lớn.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className="p-4 rounded-xl backdrop-blur-md bg-slate-50/80 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-850 flex gap-3 shadow-sm hover:border-indigo-500/30 transition-all"
            >
              <div className="shrink-0">
                <div className={`p-2 rounded-lg ${
                  notif.type === 'update' 
                    ? 'bg-indigo-500/10 text-indigo-500' 
                    : notif.type === 'bug' 
                      ? 'bg-red-500/10 text-red-500' 
                      : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  <LucideIcon name={notif.type === 'update' ? 'Sparkles' : notif.type === 'bug' ? 'Bug' : 'ThumbsUp'} size={14} />
                </div>
              </div>
              <div className="space-y-1 overflow-hidden">
                <h4 className="text-xs font-bold text-gray-950 dark:text-white truncate">
                  {notif.title}
                </h4>
                <p className="text-[11px] text-gray-650 dark:text-gray-400 leading-normal">
                  {notif.message}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] text-gray-400 pt-1">
                  <LucideIcon name="Clock" size={10} />
                  <span>{new Date(notif.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  {notif.appName && (
                    <span className="font-semibold bg-slate-200/50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded truncate max-w-[120px]">
                      {notif.appName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer controls */}
      {notifications.length > 0 && (
        <div className="p-4 bg-slate-50 dark:bg-slate-955 border-t border-slate-200 dark:border-slate-850">
          <button
            onClick={onClearAll}
            className="w-full text-center bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
          >
            Đánh dấu đã đọc tất cả ({notifications.length})
          </button>
        </div>
      )}
    </div>
  );
}
