export type Platform = 'Web' | 'Mobile' | 'Tablet';

export type AppStatus = 'Đang phát triển' | 'Đang cải tiến' | 'Đã phát hành' | 'Đã phát hành (Beta)' | 'Sắp ra mắt' | 'Sắp ra mắt (Alpha)';

export interface Changelog {
  version: string;
  date: string;
  title: string;
  changes: string[];
  type: 'major' | 'minor' | 'patch';
}

export interface AppIdea {
  id: string;
  name: string;
  description: string;
  icon: string;
  platforms: Platform[];
  status: AppStatus;
  techStack: string[];
  currentVersion: string;
  changelogs: Changelog[];
  voters: string[]; // List of user emails who voted
  rating: number; // Avg rating out of 5
  ratingCount: number;
  sourceCodeUrl?: string; // Optional download or source code URL
  appUrl?: string; // Optional URL to open the application
}

export interface CommunitySuggestion {
  id: string;
  title: string;
  description: string;
  suggestedBy: string;
  createdAt: string;
  votes: number;
  votedEmails: string[];
  category: 'Feature' | 'New App' | 'Improvement' | 'UI/UX';
  targetAppId?: string; // Optional reference if suggesting a feature for an existing app
}

export interface BugReport {
  id: string;
  appId: string;
  appName: string;
  title: string;
  description: string;
  severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng';
  reporterEmail: string;
  createdAt: string;
  status: 'Mới tiếp nhận' | 'Đang phân tích' | 'Đang sửa' | 'Đã hoàn thành';
  notes?: string;
}

export interface SystemNotification {
  id: string;
  appId?: string;
  appName?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'update' | 'vote' | 'system' | 'bug';
}

export interface SyncLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  direction: 'local_to_cloud' | 'cloud_to_local' | 'cloud_listen' | 'system';
  message: string;
}

