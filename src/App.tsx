import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { INITIAL_APPS, INITIAL_SUGGESTIONS, INITIAL_BUGS, SYSTEM_NOTIFICATIONS } from './data';
import { AppIdea, CommunitySuggestion, BugReport, SystemNotification, Platform, SyncLog } from './types';
import AppCard from './components/AppCard';
import AppDetailsModal from './components/AppDetailsModal';
import AppFormBody from './components/AppFormBody';
import Simulator from './components/Simulator';
import CommunityBoard from './components/CommunityBoard';
import BugTracker from './components/BugTracker';
import NotificationCenter from './components/NotificationCenter';
import LucideIcon from './components/LucideIcon';
import { getFirestoreDB, isFirebaseEnabled } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

export default function App() {
  const [activeDbId, setActiveDbId] = useState<string>(() => {
    return localStorage.getItem('nexus_selected_db_id') || 'backend';
  });
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const db = isFirebaseEnabled && activeDbId !== 'backend' && activeDbId !== 'local' ? getFirestoreDB(activeDbId) : null;

  // Real-time Sync Logging Engine
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => {
    const local = localStorage.getItem('nexus_sync_logs');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
    }
    return [
      {
        id: 'initial',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
        type: 'info',
        direction: 'system',
        message: 'Hệ thống giám sát đồng bộ (Sync Monitoring Panel) đã được khởi tạo.'
      }
    ];
  });
  const [isSyncLogsOpen, setIsSyncLogsOpen] = useState(false);
  const [syncFilterType, setSyncFilterType] = useState<'all' | 'info' | 'success' | 'warning' | 'error'>('all');
  const [syncFilterDirection, setSyncFilterDirection] = useState<'all' | 'local_to_cloud' | 'cloud_to_local' | 'cloud_listen' | 'system'>('all');

  const addSyncLog = (
    type: 'info' | 'success' | 'warning' | 'error',
    direction: 'local_to_cloud' | 'cloud_to_local' | 'cloud_listen' | 'system',
    message: string
  ) => {
    const time = new Date().toLocaleTimeString('vi-VN', { hour12: false });
    const newLog: SyncLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: time,
      type,
      direction,
      message
    };
    setSyncLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // Keep last 50 logs
      localStorage.setItem('nexus_sync_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Global & Persistent Database States
  const [apps, setApps] = useState<AppIdea[]>(() => {
    const local = localStorage.getItem('nexus_ecosystem_apps');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_APPS;
  });
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>(() => {
    const local = localStorage.getItem('nexus_ecosystem_suggestions');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SUGGESTIONS;
  });
  const [bugs, setBugs] = useState<BugReport[]>(() => {
    const local = localStorage.getItem('nexus_ecosystem_bugs');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BUGS;
  });
  const [notifications, setNotifications] = useState<SystemNotification[]>(SYSTEM_NOTIFICATIONS);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true); // Pre-enable admin mode for chiendq78@gmail.com

  // Admin interactive forms and confirmation prompts
  const [appFormModal, setAppFormModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    appId?: string;
    appData?: Partial<AppIdea>;
  }>({ isOpen: false, mode: 'add' });

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    appId: string;
    appName: string;
  } | null>(null);

  const [saveConfirmation, setSaveConfirmation] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    appId?: string;
    appData: Partial<AppIdea>;
  } | null>(null);

  // Sync state variables to the local database store
  useEffect(() => {
    localStorage.setItem('nexus_ecosystem_apps', JSON.stringify(apps));
  }, [apps]);

  useEffect(() => {
    localStorage.setItem('nexus_ecosystem_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('nexus_ecosystem_bugs', JSON.stringify(bugs));
  }, [bugs]);

  // Firebase Real-time Synchronization Listener with Intelligent Local-to-Cloud Auto-Sync & Seeding
  useEffect(() => {
    if (activeDbId === 'backend') {
      addSyncLog('info', 'system', 'Hệ thống đang chạy chế độ Enterprise Backend API.');
      return;
    }
    if (activeDbId === 'local') {
      addSyncLog('warning', 'system', 'Hệ thống đang chạy ở chế độ Lưu trữ cục bộ LocalStorage.');
      return;
    }
    if (!isFirebaseEnabled || !db) {
      addSyncLog('warning', 'system', 'Chế độ Lưu trữ cục bộ đang chạy. Để đồng bộ đám mây, hãy kích hoạt Firestore.');
      return;
    }

    setFirestoreError(null);
    addSyncLog('info', 'cloud_listen', `Đang thiết lập kết nối thời gian thực tới Firestore (DB ID: ${activeDbId})...`);

    // 1. Sync & Listen to Apps collection
    const unsubApps = onSnapshot(collection(db, 'apps'), (snapshot) => {
      const dbApps: AppIdea[] = [];
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          dbApps.push(doc.data() as AppIdea);
        }
      });

      if (dbApps.length > 0) {
        setApps(dbApps);
        addSyncLog('success', 'cloud_to_local', `Đồng bộ thành công ${dbApps.length} ứng dụng từ Firestore.`);
        
        // Push any local storage apps (e.g. locally created in AI Studio before DB connected) that are missing in Firestore
        const localRaw = localStorage.getItem('nexus_ecosystem_apps');
        if (localRaw) {
          try {
            const localApps = JSON.parse(localRaw) as AppIdea[];
            const dbIds = new Set(dbApps.map(app => app.id));
            let pushCount = 0;
            localApps.forEach((app) => {
              if (app && app.id && !dbIds.has(app.id)) {
                pushCount++;
                addSyncLog('info', 'local_to_cloud', `Đang tải lên ứng dụng nội bộ mới: "${app.name}"`);
                setDoc(doc(db, 'apps', app.id), app)
                  .then(() => {
                    addSyncLog('success', 'local_to_cloud', `Đã tải lên thành công: "${app.name}"`);
                  })
                  .catch(err => {
                    console.error('Syncing missing local app to cloud failed:', err);
                    addSyncLog('error', 'local_to_cloud', `Lỗi tải lên "${app.name}": ${err.message}`);
                  });
              }
            });
            if (pushCount > 0) {
              addSyncLog('info', 'local_to_cloud', `Đã phát hiện và đang tải lên ${pushCount} ứng dụng mới chưa có trên Cloud.`);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        // Auto-seed empty cloud Firestore with ecosystem templates AND any custom local storage apps
        addSyncLog('warning', 'system', `Phát hiện bộ sưu tập 'apps' trên Cloud trống! Đang chuẩn bị nạp dữ liệu mẫu...`);
        const localRaw = localStorage.getItem('nexus_ecosystem_apps');
        let localApps: AppIdea[] = [];
        if (localRaw) {
          try {
            localApps = JSON.parse(localRaw);
          } catch (e) {
            console.error(e);
          }
        }

        const combinedMap = new Map<string, AppIdea>();
        INITIAL_APPS.forEach(app => combinedMap.set(app.id, app));
        localApps.forEach(app => {
          if (app && app.id) combinedMap.set(app.id, app);
        });

        addSyncLog('info', 'local_to_cloud', `Nạp dữ liệu mẫu cho bộ sưu tập 'apps' (${combinedMap.size} mục)...`);
        combinedMap.forEach((app, id) => {
          setDoc(doc(db, 'apps', id), app)
            .then(() => {
              addSyncLog('success', 'local_to_cloud', `Đã tự động tạo mẫu ứng dụng Cloud: "${app.name}"`);
            })
            .catch(err => {
              console.error('Ecosystem seeding failed:', err);
              addSyncLog('error', 'local_to_cloud', `Lỗi nạp mẫu "${app.name}": ${err.message}`);
            });
        });
      }
    }, (err) => {
      console.error('Firestore apps snapshot error:', err);
      setFirestoreError(err.message);
      addSyncLog('error', 'cloud_listen', `Mất kết nối đồng bộ Apps: ${err.message}`);
    });

    // 2. Sync & Listen to Community Suggestions
    const unsubSuggestions = onSnapshot(collection(db, 'suggestions'), (snapshot) => {
      const dbSuggestions: CommunitySuggestion[] = [];
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          dbSuggestions.push(doc.data() as CommunitySuggestion);
        }
      });

      if (dbSuggestions.length > 0) {
        setSuggestions(dbSuggestions);
        addSyncLog('success', 'cloud_to_local', `Đồng bộ thành công ${dbSuggestions.length} đề xuất cộng đồng.`);

        // Sync local storage suggestions missing in firestore
        const localRaw = localStorage.getItem('nexus_ecosystem_suggestions');
        if (localRaw) {
          try {
            const localSugs = JSON.parse(localRaw) as CommunitySuggestion[];
            const dbIds = new Set(dbSuggestions.map(sug => sug.id));
            let pushCount = 0;
            localSugs.forEach((sug) => {
              if (sug && sug.id && !dbIds.has(sug.id)) {
                pushCount++;
                addSyncLog('info', 'local_to_cloud', `Đang tải lên đề xuất cộng đồng: "${sug.title}"`);
                setDoc(doc(db, 'suggestions', sug.id), sug)
                  .then(() => {
                    addSyncLog('success', 'local_to_cloud', `Đã tải lên hành công đề xuất: "${sug.title}"`);
                  })
                  .catch(err => {
                    console.error('Syncing missing local suggestion failed:', err);
                    addSyncLog('error', 'local_to_cloud', `Lỗi tải lên đề xuất: ${err.message}`);
                  });
              }
            });
            if (pushCount > 0) {
              addSyncLog('info', 'local_to_cloud', `Phát hiện và đang tải lên ${pushCount} đề xuất mới lên Cloud.`);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        addSyncLog('warning', 'system', `Bộ sưu tập 'suggestions' trên Cloud trống! Đang tải lên các đề xuất mẫu...`);
        const localRaw = localStorage.getItem('nexus_ecosystem_suggestions');
        let localSugs: CommunitySuggestion[] = [];
        if (localRaw) {
          try {
            localSugs = JSON.parse(localRaw);
          } catch (e) {
            console.error(e);
          }
        }

        const combinedMap = new Map<string, CommunitySuggestion>();
        INITIAL_SUGGESTIONS.forEach(sug => combinedMap.set(sug.id, sug));
        localSugs.forEach(sug => {
          if (sug && sug.id) combinedMap.set(sug.id, sug);
        });

        combinedMap.forEach((sug, id) => {
          setDoc(doc(db, 'suggestions', id), sug)
            .then(() => {
              addSyncLog('success', 'local_to_cloud', `Đã mẫu hóa đề xuất Cloud: "${sug.title}"`);
            })
            .catch(err => {
              console.error('Suggestions seeding failed:', err);
              addSyncLog('error', 'local_to_cloud', `Lỗi mẫu hóa đề xuất "${sug.title}": ${err.message}`);
            });
        });
      }
    }, (err) => {
      console.error('Firestore suggestions snapshot error:', err);
      setFirestoreError(err.message);
      addSyncLog('error', 'cloud_listen', `Mất kết nối đồng bộ Suggestions: ${err.message}`);
    });

    // 3. Sync & Listen to Reported Bugs
    const unsubBugs = onSnapshot(collection(db, 'bugs'), (snapshot) => {
      const dbBugs: BugReport[] = [];
      snapshot.forEach((doc) => {
        if (doc.exists()) {
          dbBugs.push(doc.data() as BugReport);
        }
      });

      if (dbBugs.length > 0) {
        setBugs(dbBugs);
        addSyncLog('success', 'cloud_to_local', `Đồng bộ thành công ${dbBugs.length} báo lỗi từ đám mây.`);

        // Sync local storage bugs missing in firestore
        const localRaw = localStorage.getItem('nexus_ecosystem_bugs');
        if (localRaw) {
          try {
            const localBugs = JSON.parse(localRaw) as BugReport[];
            const dbIds = new Set(dbBugs.map(bug => bug.id));
            let pushCount = 0;
            localBugs.forEach((bug) => {
              if (bug && bug.id && !dbIds.has(bug.id)) {
                pushCount++;
                addSyncLog('info', 'local_to_cloud', `Đang đồng bộ báo cáo lỗi cục bộ: "${bug.title}"`);
                setDoc(doc(db, 'bugs', bug.id), bug)
                  .then(() => {
                    addSyncLog('success', 'local_to_cloud', `Đã đẩy thành công báo cáo lỗi: "${bug.title}"`);
                  })
                  .catch(err => {
                    console.error('Syncing missing local bug failed:', err);
                    addSyncLog('error', 'local_to_cloud', `Lỗi tải lên báo lỗi "${bug.title}": ${err.message}`);
                  });
              }
            });
            if (pushCount > 0) {
              addSyncLog('info', 'local_to_cloud', `Phát hiện và đang đẩy lên ${pushCount} báo cáo lỗi mới lên Cloud.`);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        addSyncLog('warning', 'system', `Danh sách báo lỗi trên Cloud trống! Đang tải lên danh sách mẫu...`);
        const localRaw = localStorage.getItem('nexus_ecosystem_bugs');
        let localBugs: BugReport[] = [];
        if (localRaw) {
          try {
            localBugs = JSON.parse(localRaw);
          } catch (e) {
            console.error(e);
          }
        }

        const combinedMap = new Map<string, BugReport>();
        INITIAL_BUGS.forEach(bug => combinedMap.set(bug.id, bug));
        localBugs.forEach(bug => {
          if (bug && bug.id) combinedMap.set(bug.id, bug);
        });

        combinedMap.forEach((bug, id) => {
          setDoc(doc(db, 'bugs', id), bug)
            .then(() => {
              addSyncLog('success', 'local_to_cloud', `Đã đồng bộ báo cáo lỗi mẫu: "${bug.title}"`);
            })
            .catch(err => {
              console.error('Bugs seeding failed:', err);
              addSyncLog('error', 'local_to_cloud', `Lỗi nạp báo lỗi mẫu: ${err.message}`);
            });
        });
      }
    }, (err) => {
      console.error('Firestore bugs snapshot error:', err);
      setFirestoreError(err.message);
      addSyncLog('error', 'cloud_listen', `Mất kết nối đồng bộ Bugs: ${err.message}`);
    });

    return () => {
      unsubApps();
      unsubSuggestions();
      unsubBugs();
      addSyncLog('info', 'system', 'Hủy kết nối lắng nghe Firestore cũ để thiết lập luồng mới.');
    };
  }, [db, activeDbId]);

  // Enterprise Backend REST API Synchronizer
  useEffect(() => {
    if (activeDbId !== 'backend') return;

    addSyncLog('info', 'cloud_listen', '🔌 --------------------------------------------------');
    addSyncLog('info', 'cloud_listen', '🔌 Đang kết nối tới máy chủ Express Backend API...');
    
    // Fetch apps
    addSyncLog('info', 'cloud_listen', '📡 Gửi yêu cầu: GET /api/apps');
    fetch('/api/apps')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setApps(data);
        addSyncLog('success', 'cloud_to_local', `✅ Nhận phản hồi: 200 OK. Đồng bộ thành công ${data.length} ứng dụng.`);
      })
      .catch(err => {
        console.error(err);
        addSyncLog('error', 'cloud_listen', `❌ Lỗi tải danh sách ứng dụng: ${err.message}`);
      });

    // Fetch suggestions
    addSyncLog('info', 'cloud_listen', '📡 Gửi yêu cầu: GET /api/suggestions');
    fetch('/api/suggestions')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setSuggestions(data);
        addSyncLog('success', 'cloud_to_local', `✅ Nhận phản hồi: 200 OK. Tải thành công ${data.length} đề xuất cộng đồng.`);
      })
      .catch(err => {
        console.error(err);
        addSyncLog('error', 'cloud_listen', `❌ Lỗi tải danh sách đề xuất: ${err.message}`);
      });

    // Fetch bugs
    addSyncLog('info', 'cloud_listen', '📡 Gửi yêu cầu: GET /api/bugs');
    fetch('/api/bugs')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        setBugs(data);
        addSyncLog('success', 'cloud_to_local', `✅ Nhận phản hồi: 200 OK. Đồng bộ thành công ${data.length} báo cáo lỗi.`);
      })
      .catch(err => {
        console.error(err);
        addSyncLog('error', 'cloud_listen', `❌ Lỗi tải danh sách báo lỗi: ${err.message}`);
      });

    // Fetch notifications
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
      })
      .catch(err => console.error('Error fetching notifications:', err));
  }, [activeDbId]);

  // Active view filters
  const [currentTab, setCurrentTab] = useState<'portfolio' | 'suggestions' | 'bugs' | 'simulator'>('portfolio');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | Platform>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Selected Detail model states
  const [selectedApp, setSelectedApp] = useState<AppIdea | null>(null);
  const [activeSimulatorApp, setActiveSimulatorApp] = useState<AppIdea | null>(null);

  // Notification Drawer Status
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [userEmail] = useState('chiendq78@gmail.com'); // Pre-configured from AI Studio context

  // Simulated layout viewport scale for the entire portal!
  // This lets the user see how the portal itself would look inside an iPad, iPhone, or standard Desktop!
  const [portalViewport, setPortalViewport] = useState<'laptop' | 'tablet' | 'mobile'>('laptop');

  // Slide-in interactive alert for dynamic events
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string } | null>(null);

  // Auto push notification simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      const demoNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: '💎 Bình chọn lớn vừa diễn ra!',
        appName: 'Solo Business OS',
        message: 'Người dùng vừa bình chọn cao cho nền tảng quản trị độc nghiệp Solo Business OS!',
        timestamp: new Date().toISOString(),
        type: 'vote'
      };
      setNotifications(prev => [demoNotif, ...prev]);
      triggerToast('Bình chọn mới', 'Solo Business OS nhận được 1 phiều bầu từ cộng đồng!');
    }, 15000); // Trigger a notification simulator in 15s

    return () => clearTimeout(timer);
  }, []);

  const triggerToast = (title: string, message: string) => {
    setToastAlert({ title, message });
    setTimeout(() => setToastAlert(null), 5000);
  };

  // Upvote App Handler (Optimized side-effect-free execution)
  const handleVoteApp = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const hasVoted = app.voters.includes(userEmail);
    const updatedVoters = hasVoted
      ? app.voters.filter(email => email !== userEmail)
      : [...app.voters, userEmail];

    if (!hasVoted) {
      triggerToast('Bình chọn thành công', `Bạn đã bình chọn cho ứng dụng ${app.name}!`);
      // Append a smart push notification simulation
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        appId: app.id,
        appName: app.name,
        title: '⭐ Đã nhận bình chọn tuyển chọn',
        message: `Cảm ơn bạn chiendq78@gmail.com đã bỏ phiếu động viên cho ${app.name}!`,
        timestamp: new Date().toISOString(),
        type: 'vote'
      };
      setNotifications(p => [newNotif, ...p]);
    }

    const updatedApp = { ...app, voters: updatedVoters };
    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gửi bình chọn của "${app.name}" lên Express Server...`);
      fetch(`/api/apps/${appId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(resultApp => {
          setApps(prevApps => prevApps.map(a => a.id === appId ? resultApp : a));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công lưu bình chọn lên máy chủ REST API.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi bình chọn: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      addSyncLog('info', 'local_to_cloud', `Đang cập nhật bình chọn "${app.name}" lên Firestore...`);
      setDoc(doc(db, 'apps', appId), updatedApp)
        .then(() => addSyncLog('success', 'local_to_cloud', `Đã đồng bộ lượt bình chọn "${app.name}" thành công.`))
        .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi đồng bộ lượt bình chọn "${app.name}": ${err.message}`));
    } else {
      setApps(prevApps => prevApps.map(a => a.id === appId ? updatedApp : a));
    }
  };

  // Submit Feedback / Rating Star count (Optimized side-effect-free execution)
  const handleSubmitRating = (appId: string, stars: number) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    const newCount = app.ratingCount + 1;
    const newAvg = parseFloat(((app.rating * app.ratingCount + stars) / newCount).toFixed(1));
    triggerToast('Đánh giá thành công', `Bạn đã chấm ${stars} sao cho ${app.name}.`);
    
    const updatedApp = { ...app, rating: newAvg, ratingCount: newCount };
    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gửi đánh giá ${stars} sao của "${app.name}" lên Express Server...`);
      fetch(`/api/apps/${appId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(resultApp => {
          setApps(prevApps => prevApps.map(a => a.id === appId ? resultApp : a));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công lưu đánh giá ${stars} sao lên máy chủ REST API.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi lưu đánh giá: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      addSyncLog('info', 'local_to_cloud', `Đang chấm ${stars} sao cho "${app.name}" lên Cloud...`);
      setDoc(doc(db, 'apps', appId), updatedApp)
        .then(() => addSyncLog('success', 'local_to_cloud', `Đã lưu đánh giá ${stars} sao cho "${app.name}" lên Cloud.`))
        .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi lưu đánh giá cho "${app.name}": ${err.message}`));
    } else {
      setApps(prevApps => prevApps.map(a => a.id === appId ? updatedApp : a));
    }
  };

  // Submit a Community Suggestion / Idea
  const handleAddSuggestion = (title: string, desc: string, category: CommunitySuggestion['category'], targetAppId?: string) => {
    const newSuggestion: CommunitySuggestion = {
      id: `sug-${Date.now()}`,
      title,
      description: desc,
      suggestedBy: userEmail,
      createdAt: new Date().toISOString(),
      votes: 1,
      votedEmails: [userEmail],
      category,
      targetAppId: targetAppId || ''
    };

    // Snappy optimistic local rendering immediately, then async background sync to DB
    setSuggestions(p => {
      const existed = p.some(s => s.id === newSuggestion.id);
      return existed ? p : [newSuggestion, ...p];
    });

    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang tạo đề xuất "${title}" trên tuyển Express Backend...`);
      fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSuggestion)
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(savedSug => {
          setSuggestions(p => p.map(s => s.id === newSuggestion.id ? savedSug : s));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công đăng đề xuất lên Express Backend.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi đăng đề xuất: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      addSyncLog('info', 'local_to_cloud', `Đang đăng trực tiếp ý tưởng "${title}" lên Firestore...`);
      setDoc(doc(db, 'suggestions', newSuggestion.id), newSuggestion)
        .then(() => addSyncLog('success', 'local_to_cloud', `Đã đăng thành công ý tưởng "${title}" lên đám mây.`))
        .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi đăng tải ý tưởng "${title}": ${err.message}`));
    }
    triggerToast('Đăng ý tưởng thành công', 'Sáng kiến phát triển của bạn đã hiển thị công khai.');

    // Simulated Push alert
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: '💡 Đề xuất ý tưởng mới',
      message: `Ý tưởng "${title}" đã được nộp vào danh tuyển cộng đồng.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(p => [newNotif, ...p]);
  };

  // Vote Suggestion Handler (Optimized side-effect-free execution)
  const handleVoteSuggestion = (sugId: string) => {
    const sug = suggestions.find(s => s.id === sugId);
    if (!sug) return;

    const hasVoted = sug.votedEmails.includes(userEmail);
    const updatedVotes = hasVoted ? sug.votes - 1 : sug.votes + 1;
    const updatedVotedEmails = hasVoted
      ? sug.votedEmails.filter(e => e !== userEmail)
      : [...sug.votedEmails, userEmail];

    const updatedSug = { ...sug, votes: updatedVotes, votedEmails: updatedVotedEmails };
    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gửi bình chọn ý tưởng "${sug.title}" lên Express...`);
      fetch(`/api/suggestions/${sugId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(resultSug => {
          setSuggestions(p => p.map(s => s.id === sugId ? resultSug : s));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công lưu bình chọn lên Express.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi lưu bầu chọn: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      addSyncLog('info', 'local_to_cloud', `Đang cập nhật bình chọn ý tưởng "${sug.title}"...`);
      setDoc(doc(db, 'suggestions', sugId), updatedSug)
        .then(() => addSyncLog('success', 'local_to_cloud', `Đã lưu bình chọn ý tưởng "${sug.title}" thành công.`))
        .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi bình chọn ý tưởng "${sug.title}": ${err.message}`));
    } else {
      setSuggestions(prev => prev.map(s => s.id === sugId ? updatedSug : s));
    }
  };

  // Edit Suggestion Handler (Guaranteed sync outside state update asynchronously)
  const handleEditSuggestion = (
    id: string,
    title: string,
    desc: string,
    category: CommunitySuggestion['category'],
    targetAppId?: string
  ) => {
    const sug = suggestions.find(s => s.id === id);
    if (!sug) return;

    const updatedSug = {
      ...sug,
      title,
      description: desc,
      category,
      targetAppId
    };

    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gửi bản sửa đổi ý tưởng "${title}" lên Backend...`);
      fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSug)
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(resultSug => {
          setSuggestions(prev => prev.map(s => s.id === id ? resultSug : s));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Lưu bản sửa đề xuất thành công.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi lưu chỉnh sửa: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      setDoc(doc(db, 'suggestions', id), updatedSug).catch(err => console.error(err));
    } else {
      setSuggestions(prev => prev.map(s => s.id === id ? updatedSug : s));
    }

    triggerToast('Cập nhật thành công', `Đã lưu cập nhật cho ý tưởng "${title}"`);

    const editNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: '🔄 Cập nhật ý tưởng',
      message: `Ý tưởng "${title}" đã được sửa đổi bởi quản trị viên.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [editNotif, ...prev]);
  };

  // Delete Suggestion Handler
  const handleDeleteSuggestion = (id: string) => {
    const target = suggestions.find(sug => sug.id === id);
    if (!target) return;

    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gỡ bỏ đề xuất "${target.title}" trên máy chủ...`);
      fetch(`/api/suggestions/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(() => {
          setSuggestions(prev => prev.filter(sug => sug.id !== id));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Đã gỡ bỏ đề xuất khỏi máy chủ thành công.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi xóa đề xuất: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      deleteDoc(doc(db, 'suggestions', id)).catch(err => console.error(err));
    } else {
      setSuggestions(prev => prev.filter(sug => sug.id !== id));
    }
    triggerToast('Đã xóa ý tưởng', `Đã gỡ bỏ ý tưởng "${target.title}" khỏi hệ thống.`);

    const deleteNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: '🗑️ Đã xóa ý tưởng',
      message: `Đóng góp ý tưởng "${target.title}" đã bị gỡ khỏi hệ thống.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [deleteNotif, ...prev]);
  };

  // Submit Bug directly via portal or app detail page
  const handleAddBug = (appId: string, title: string, desc: string, severity: BugReport['severity']) => {
    const target = apps.find(a => a.id === appId);
    const newBug: BugReport = {
      id: `bug-${Date.now()}`,
      appId,
      appName: target ? target.name : 'Unknown App',
      title,
      description: desc,
      severity,
      reporterEmail: userEmail,
      createdAt: new Date().toISOString(),
      status: 'Mới tiếp nhận',
      notes: 'Hệ thống đã nhận diện thông tin gỡ lỗi từ chiendq78@gmail.com. Đang thẩm định.'
    };

    // Snappy optimistic local rendering immediately, then async background sync to DB
    setBugs(p => {
      const existed = p.some(b => b.id === newBug.id);
      return existed ? p : [newBug, ...p];
    });

    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gửi báo cáo lỗi "${title}" tới Express server...`);
      fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBug)
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(savedBug => {
          setBugs(p => p.map(b => b.id === newBug.id ? savedBug : b));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công báo lỗi lên Express server.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi báo cáo lỗi: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      addSyncLog('info', 'local_to_cloud', `Đang tải báo cáo lỗi "${title}" lên Firestore...`);
      setDoc(doc(db, 'bugs', newBug.id), newBug)
        .then(() => addSyncLog('success', 'local_to_cloud', `Đã tải lên báo lỗi "${title}" thành công.`))
        .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi tải lên báo lỗi: ${err.message}`));
    } else {
      addSyncLog('info', 'local_to_cloud', `Đã lưu báo cáo lỗi "${title}" vào Local Storage.`);
    }
    triggerToast('Nộp báo lỗi thành công', `Lỗi của ứng dụng ${newBug.appName} đã được ghi nhận.`);

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      appId,
      appName: newBug.appName,
      title: '🚨 Phát hiện báo lỗi hệ thống',
      message: `Phiếu lỗi #${newBug.id.substring(4, 8)} được gửi bởi quản lý chiendq78@gmail.com`,
      timestamp: new Date().toISOString(),
      type: 'bug'
    };
    setNotifications(p => [newNotif, ...p]);
  };

  // Clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
    triggerToast('Đã xóa hết thông báo', 'Hộp thư sạch sẽ!');
  };

  // Open Add App Modal
  const handleOpenAddApp = () => {
    setAppFormModal({
      isOpen: true,
      mode: 'add',
      appData: {
        name: '',
        description: '',
        icon: 'Sparkles',
        platforms: ['Web'],
        status: 'Đang phát triển',
        currentVersion: '1.0.0',
        techStack: ['TypeScript', 'React'],
        changelogs: [],
        voters: [],
        rating: 5.0,
        ratingCount: 1
      }
    });
  };

  // Open Edit App Modal
  const handleOpenEditApp = (app: AppIdea) => {
    setAppFormModal({
      isOpen: true,
      mode: 'edit',
      appId: app.id,
      appData: { ...app }
    });
  };

  // Prep app deletion
  const handleOpenDeleteApp = (appId: string, appName: string) => {
    setDeleteConfirmation({ isOpen: true, appId, appName });
  };

  // Perform actual app deletion
  const handleConfirmDeleteApp = () => {
    if (!deleteConfirmation) return;
    const { appId, appName } = deleteConfirmation;
    if (activeDbId === 'backend') {
      addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang gỡ bỏ ứng dụng "${appName}" khỏi máy chủ Express...`);
      fetch(`/api/apps/${appId}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
          return res.json();
        })
        .then(() => {
          setApps(prev => prev.filter(app => app.id !== appId));
          addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công gỡ bỏ ứng dụng khỏi máy chủ.`);
        })
        .catch(err => {
          console.error(err);
          addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi xóa ứng dụng: ${err.message}`);
        });
    } else if (isFirebaseEnabled && db) {
      addSyncLog('info', 'local_to_cloud', `Đang yêu cầu xóa ứng dụng "${appName}" (${appId}) khỏi Cloud...`);
      deleteDoc(doc(db, 'apps', appId))
        .then(() => addSyncLog('success', 'local_to_cloud', `Đã gỡ bỏ ứng dụng "${appName}" khỏi Cloud thành công.`))
        .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi xóa ứng dụng "${appName}": ${err.message}`));
    } else {
      addSyncLog('info', 'local_to_cloud', `Đã xóa ứng dụng "${appName}" khỏi Local Storage.`);
      setApps(prev => prev.filter(app => app.id !== appId));
    }
    triggerToast('Đã xóa ứng dụng', `Đã gỡ bỏ ứng dụng ${appName} thành công khỏi cơ sở dữ liệu.`);
    
    // Add system notification about removal
    const removeNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: '🗑️ Đã gỡ bỏ ứng dụng',
      message: `Quản trị viên đã xóa ứng dụng "${appName}" khỏi hệ thống.`,
      timestamp: new Date().toISOString(),
      type: 'system'
    };
    setNotifications(prev => [removeNotif, ...prev]);
    setDeleteConfirmation(null);
  };

  const handleSaveAppForm = (submittedData: Partial<AppIdea>) => {
    if (!submittedData.name) {
      triggerToast('Lỗi nhập liệu', 'Vui lòng điền tên ứng dụng.');
      return;
    }
    
    // Clear and close the first form
    setAppFormModal({ isOpen: false, mode: 'add' });
    
    // Set for confirmation popup
    setSaveConfirmation({
      isOpen: true,
      mode: appFormModal.mode,
      appId: appFormModal.appId,
      appData: submittedData
    });
  };

  const handleConfirmSaveApp = () => {
    if (!saveConfirmation) return;
    const { mode, appId, appData } = saveConfirmation;

    if (mode === 'add') {
      const slug = appData.name!
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      
      const newId = slug || `app-${Date.now()}`;
      
      // Check if ID already exists
      if (apps.some(a => a.id === newId)) {
        triggerToast('Lỗi ID trùng', 'Ứng dụng cùng tên đã tồn tại!');
        setSaveConfirmation(null);
        return;
      }
      
      const newApp: AppIdea = {
        id: newId,
        name: appData.name!,
        description: appData.description || '',
        icon: appData.icon || 'Sparkles',
        platforms: appData.platforms || ['Web'],
        status: appData.status || 'Đang phát triển',
        techStack: appData.techStack || ['React', 'TypeScript'],
        currentVersion: appData.currentVersion || '1.0.0',
        changelogs: appData.changelogs || [
          {
            version: appData.currentVersion || '1.0.0',
            date: new Date().toISOString().split('T')[0],
            title: 'Khởi tạo ứng dụng',
            changes: ['Phiên bản sơ khai ban đầu.'],
            type: 'major'
          }
        ],
        voters: [],
        rating: 5.0,
        ratingCount: 1,
        sourceCodeUrl: appData.sourceCodeUrl || '',
        appUrl: appData.appUrl || ''
      };
      
      // Snappy optimistical update (Offline-First local rendering immediately then async push to Firestore)
      setApps(prev => {
        const existed = prev.some(a => a.id === newApp.id);
        return existed ? prev : [newApp, ...prev];
      });

      if (activeDbId === 'backend') {
        addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang tạo ứng dụng mới "${newApp.name}" trên Backend...`);
        fetch('/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newApp)
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
            return res.json();
          })
          .then(savedApp => {
            setApps(prev => prev.map(a => a.id === newApp.id ? savedApp : a));
            addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công đăng ứng dụng mới lên máy chủ.`);
          })
          .catch(err => {
            console.error(err);
            addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi tạo ứng dụng: ${err.message}`);
          });
      } else if (isFirebaseEnabled && db) {
        addSyncLog('info', 'local_to_cloud', `Đang thiết lập lưu ứng dụng mới "${newApp.name}" (${newApp.id}) lên Cloud...`);
        setDoc(doc(db, 'apps', newApp.id), newApp)
          .then(() => addSyncLog('success', 'local_to_cloud', `Đã lưu ứng dụng mới "${newApp.name}" lên Cloud thành công.`))
          .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi lưu ứng dụng "${newApp.name}": ${err.message}`));
      } else {
        addSyncLog('info', 'local_to_cloud', `Đã lưu ứng dụng mới "${newApp.name}" vào Local Storage.`);
      }
      triggerToast('Thêm thành công', `Đã thêm ứng dụng mới "${newApp.name}"`);
      
      const addNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: '🚀 Thêm phần mềm mới',
        message: `Quản trị viên vừa thêm phần mềm "${newApp.name}" vào hệ sinh thái!`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      setNotifications(prev => [addNotif, ...prev]);
    } else {
      // Edit mode
      if (!appId) return;
      
      const targetApp = apps.find(a => a.id === appId);
      const updatedApp = targetApp ? {
        ...targetApp,
        name: appData.name || targetApp.name,
        description: appData.description || targetApp.description,
        icon: appData.icon || targetApp.icon,
        platforms: appData.platforms || targetApp.platforms,
        status: appData.status || targetApp.status,
        currentVersion: appData.currentVersion || targetApp.currentVersion,
        sourceCodeUrl: appData.sourceCodeUrl || targetApp.sourceCodeUrl || '',
        appUrl: appData.appUrl || targetApp.appUrl || ''
      } : null;

      if (updatedApp) {
        setApps(prev => prev.map(app => app.id === appId ? updatedApp : app));
        
        if (activeDbId === 'backend') {
          addSyncLog('info', 'local_to_cloud', `📡 [REST] Đang cập nhật ứng dụng "${updatedApp.name}" lên Backend...`);
          fetch('/api/apps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedApp)
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
              return res.json();
            })
            .then(savedApp => {
              setApps(prev => prev.map(a => a.id === appId ? savedApp : a));
              addSyncLog('success', 'local_to_cloud', `✅ [REST] Thành công lưu thay đổi lên máy chủ.`);
            })
            .catch(err => {
              console.error(err);
              addSyncLog('error', 'local_to_cloud', `❌ [REST] Lỗi lưu cập nhật: ${err.message}`);
            });
        } else if (isFirebaseEnabled && db) {
          addSyncLog('info', 'local_to_cloud', `Đang gửi bản cập nhật ứng dụng "${updatedApp.name}" (${appId}) lên Cloud...`);
          setDoc(doc(db, 'apps', appId), updatedApp)
            .then(() => addSyncLog('success', 'local_to_cloud', `Đã cập nhật ứng dụng "${updatedApp.name}" liên kết đám mây thành công.`))
            .catch(err => addSyncLog('error', 'local_to_cloud', `Lỗi cập nhật ứng dụng "${updatedApp.name}": ${err.message}`));
        } else {
          addSyncLog('info', 'local_to_cloud', `Đã lưu cập nhật ứng dụng "${updatedApp.name}" vào Local Storage.`);
        }
      }
      
      triggerToast('Cập nhật thành công', `Đã lưu các chỉnh sửa của "${appData.name}"`);
      
      const editNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        title: '🔄 Đã cập nhật ứng dụng',
        message: `Quản trị viên đã chỉnh sửa thông tin ứng dụng "${appData.name}".`,
        timestamp: new Date().toISOString(),
        type: 'system'
      };
      setNotifications(prev => [editNotif, ...prev]);
    }

    setSaveConfirmation(null);
  };

  // Filtering portfolio apps based on search and selected tag variables
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.techStack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPlatform = platformFilter === 'All' || app.platforms.includes(platformFilter);
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-tr from-slate-950 via-[#0e1726] to-[#07243c] text-[#e0f2fe]' : 'bg-gradient-to-tr from-[#9cd4f8] via-[#e0f1ff] to-[#f4faff] text-slate-850'} font-sans antialiased overflow-x-hidden flex items-center justify-center p-0 md:p-3 transition-colors duration-500`}>
      
      {/* 💻 PORTAL EMBEDDED VIEWPORT CONTAINER FRAME - SIMULATING HARDWARE WITH GLASSMORPHIC EMISSION */}
      <div 
        id="applet-portal-hardware"
        style={{ willChange: 'backdrop-filter' }}
        className={`w-full flex flex-col min-h-screen overflow-hidden transition-all duration-500 relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] ${
          theme === 'dark' 
            ? 'bg-sky-950/20 backdrop-blur-[24px] backdrop-contrast-125 backdrop-saturate-150 text-[#e0f2fe] dark shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),_inset_0_1px_1px_rgba(255,255,255,0.08)] border border-white/10' 
            : 'bg-sky-100/20 backdrop-blur-[24px] backdrop-contrast-125 backdrop-saturate-150 text-slate-850 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4),_inset_0_1.5px_2px_rgba(255,255,255,0.85)] border border-sky-500/10'
        } ${
          portalViewport === 'mobile' 
            ? 'max-w-[400px] h-[850px] min-h-[850px] border-[12px] rounded-[44px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]' 
            : portalViewport === 'tablet' 
              ? 'max-w-[780px] h-[1024px] min-h-[1024px] border-[14px] rounded-[32px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]' 
              : 'max-w-none min-h-screen'
        }`}
      >
        {/* 🌟 Animated Glow Gradient Outer Edge Border */}
        <div 
          className="absolute inset-0 pointer-events-none z-50 rounded-[inherit]"
          style={{
            padding: '1.2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        >
          <div 
            className="w-full h-full rounded-[inherit] animate-border-flow" 
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7, #06b6d4, #6366f1, #ec4899)',
              backgroundSize: '200% 200%'
            }}
          />
        </div>

        {/* Notch details for Mobile Hardware simulation */}
        {portalViewport === 'mobile' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-neutral-900 rounded-b-2xl z-50 flex items-center justify-center gap-1.5 border-x border-b border-white/5">
            <div className="w-12 h-1 bg-neutral-950 rounded-full" />
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
          </div>
        )}

        {/* --- PORTAL MAIN APPLICATION ROOT --- */}
        <header className={`border-b ${theme === 'dark' ? 'border-sky-500/10 bg-slate-950/40 text-sky-100 shadow-[0_4px_30px_rgba(0,0,0,0.2)]' : 'border-sky-200/50 bg-sky-100/35 text-slate-800 shadow-[0_4px_30px_rgba(0,0,0,0.02)]'} backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between select-none`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20 animate-pulse">
              <LucideIcon name="Sparkles" className="text-white" size={16} />
            </div>
            <div>
              <h1 className={`text-base md:text-lg tracking-widest font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`} style={{ fontFamily: 'Georgia, serif' }}>
                AI <span className="font-extrabold text-sky-600 drop-shadow-sm">APPs</span>
              </h1>
              <p className={`text-[9px] ${theme === 'dark' ? 'text-sky-300/50' : 'text-sky-600/70'} font-mono tracking-wider uppercase font-bold`}>Cùng AI - Xây tương lai</p>
            </div>
          </div>

          {/* Top Panel Actions */}
          <div className="flex items-center gap-3 border-none">

            {/* 🌐 DATABASE SYNC STATUS BADGE & SELECT SWITCHER */}
            <div className={`flex items-center gap-1.5 border p-1 rounded-xl shadow-sm select-none ${
              activeDbId === 'backend'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.1)]'
                : activeDbId === 'local'
                  ? 'border-slate-500/25 bg-slate-500/5 text-slate-400'
                  : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_4px_12px_rgba(99,102,241,0.1)]'
            }`}>
              <span className="relative flex h-2 w-2 ml-1">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  activeDbId === 'backend' ? 'bg-emerald-400' : activeDbId === 'local' ? 'bg-slate-400' : 'bg-indigo-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  activeDbId === 'backend' ? 'bg-emerald-500' : activeDbId === 'local' ? 'bg-slate-500' : 'bg-indigo-500'
                }`}></span>
              </span>
              
              <select
                value={activeDbId}
                onChange={(e) => {
                  const newDbId = e.target.value;
                  setActiveDbId(newDbId);
                  localStorage.setItem('nexus_selected_db_id', newDbId);
                  triggerToast(
                    'Chuyển cơ sở dữ liệu',
                    newDbId === 'backend'
                      ? 'Đã kết nối thành công tới máy chủ Enterprise Express Backend.'
                      : newDbId === 'local'
                        ? 'Đã chuyển hoàn toàn sang bộ nhớ trình duyệt Local Storage.'
                        : 'Đã thiết lập kết nối thời gian thực đám mây Cloud Firestore.'
                  );
                }}
                className={`bg-transparent text-[11px] font-bold border-none outline-none focus:ring-0 pr-6 cursor-pointer font-sans ${
                  activeDbId === 'backend'
                    ? 'text-emerald-400'
                    : activeDbId === 'local'
                      ? 'text-slate-400'
                      : 'text-indigo-400'
                }`}
                title="Click để đổi Databases (REST API Server vs Local vs Cloud Firestore)"
              >
                <option value="backend" className="bg-slate-950 text-emerald-400">
                  SERVER (REST API)
                </option>
                <option value="local" className="bg-slate-950 text-slate-400">
                  LOCAL STORAGE
                </option>
                {isFirebaseEnabled && (
                  <>
                    <option value={(firebaseConfig as any).firestoreDatabaseId || 'custom'} className="bg-slate-950 text-indigo-400">
                      FIRESTORE (Custom)
                    </option>
                    <option value="(default)" className="bg-slate-950 text-indigo-400">
                      FIRESTORE (Default)
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* 📊 REAL-TIME SYNC LOGS MONITOR TOGGLE */}
            <button
              onClick={() => setIsSyncLogsOpen(true)}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold leading-none ${
                isSyncLogsOpen
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : theme === 'dark'
                    ? 'border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/15 text-indigo-300'
                    : 'border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-700 shadow-3xs'
              }`}
              title="Xem Nhật ký đồng bộ dữ liệu thời gian thực (LocalStorage & Firestore)"
            >
              <LucideIcon name="History" size={14} className="animate-pulse" />
              <span className="hidden xs:inline">Nhật ký Đồng bộ</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-semibold ${
                theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {syncLogs.length}
              </span>
            </button>

            {/* 🛡️ ADMIN MODE TOGGLE */}
            <button
              onClick={() => {
                const targetState = !isAdminMode;
                setIsAdminMode(targetState);
                triggerToast(
                  targetState ? 'Chế độ Quản trị' : 'Chế độ Đọc',
                  targetState ? 'Đã kích hoạt các quyền Thêm/Sửa/Xóa ứng dụng.' : 'Quay về giao diện người dùng thông thường.'
                );
              }}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold leading-none ${
                isAdminMode
                  ? 'border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 shadow-[0_4px_12px_rgba(244,63,94,0.15)]'
                  : theme === 'dark'
                    ? 'border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/15 text-sky-300 hover:text-white'
                    : 'border-sky-200 bg-sky-50/50 hover:bg-sky-100/50 text-sky-700 shadow-3xs'
              }`}
              title="Kích hoạt bảng điều khiển Thêm/Sóa/Xóa ứng dụng"
            >
              <LucideIcon name="ShieldAlert" size={14} className={isAdminMode ? "animate-pulse" : ""} />
              <span className="hidden lg:inline">{isAdminMode ? 'Admin: Mở' : 'Admin: Tắt'}</span>
            </button>

            {/* 🌓 THEME TOGGLE BUTTON (LIGHT / DARK HUB) */}
            <button
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                theme === 'dark'
                  ? 'border-sky-500/10 bg-sky-500/5 hover:bg-sky-550/15 text-amber-400 hover:border-sky-500/40'
                  : 'border-sky-200/55 bg-sky-100/20 hover:bg-sky-100/50 text-sky-800 hover:border-sky-400'
              }`}
              title={theme === 'dark' ? "Chuyển sang Giao diện Sáng (Light Theme)" : "Chuyển sang Giao diện Tối (Dark Theme)"}
            >
              <LucideIcon name={theme === 'dark' ? 'Sun' : 'Moon'} size={15} />
            </button>

            {/* Notification Bell with indicator */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className={`p-2.5 rounded-xl border transition-all duration-200 relative cursor-pointer flex items-center justify-center ${
                theme === 'dark'
                  ? 'border-sky-500/10 bg-sky-500/5 hover:bg-sky-550/15 text-sky-200 hover:text-white hover:border-sky-550/40'
                  : 'border-sky-200/55 bg-sky-100/20 hover:bg-sky-100/50 text-sky-800 hover:text-slate-900 hover:border-sky-400'
              }`}
              title="Thông báo cập nhật đẩy"
            >
              <LucideIcon name="Bell" size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white ring-2 ring-sky-950 animate-pulse">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* SUB NAVIGATION - HERO CONTAINER SECTION */}
        <div className={`px-4 md:px-8 py-4 bg-gradient-to-b ${theme === 'dark' ? 'from-slate-950/40 via-sky-950/10 border-sky-500/10' : 'from-sky-100/30 via-sky-50/10 border-sky-200/30'} to-transparent relative border-b`}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-lg md:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-850'} tracking-wide uppercase leading-tight`} style={{ fontFamily: 'Georgia, serif' }}>
                ỨNG DỤNG AI - <span className="font-extrabold text-[#0284c7] drop-shadow-3xs">ĐỪNG SỢ SAI</span>
              </h2>
              <p className={`text-[11px] ${theme === 'dark' ? 'text-sky-305' : 'text-sky-800'} max-w-xl leading-relaxed`}>
                Giả lập thiết bị, bình chọn ứng dụng tinh hoa, đề xuất ý tưởng số & báo cáo lỗi trực tiếp.
              </p>
            </div>

            {/* General metrics widgets */}
            <div className="flex gap-3 shrink-0 select-none items-center">
              <div className={`flex items-center gap-3 border px-4 py-1.5 rounded-xl transition-all shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:scale-[1.02] ${
                theme === 'dark'
                  ? 'bg-sky-950/20 border-sky-500/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'bg-white/60 border-sky-200 shadow-3xs shadow-sky-900/5'
              }`}>
                <div className="text-left">
                  <p className={`text-[9px] ${theme === 'dark' ? 'text-sky-400' : 'text-sky-600'} uppercase font-bold tracking-widest font-mono`}>Ứng dụng</p>
                  <p className={`text-sm md:text-base font-extrabold ${theme === 'dark' ? 'text-white' : 'text-sky-700'}`}>{apps.length}</p>
                </div>
                <span className="text-[8px] bg-sky-500/10 text-sky-500 px-1.5 py-0.5 rounded border border-sky-500/20 font-semibold uppercase">LIVE</span>
              </div>
              <div className={`flex items-center gap-3 border px-4 py-1.5 rounded-xl transition-all shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:scale-[1.02] ${
                theme === 'dark'
                  ? 'bg-sky-950/20 border-sky-500/20 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                  : 'bg-white/60 border-sky-200 shadow-3xs shadow-sky-900/5'
              }`}>
                <div className="text-left">
                  <p className={`text-[9px] ${theme === 'dark' ? 'text-sky-455' : 'text-sky-600'} uppercase font-bold tracking-widest font-mono`}>Bình chọn</p>
                  <p className={`text-sm md:text-base font-extrabold ${theme === 'dark' ? 'text-sky-400' : 'text-sky-700'}`}>{apps.reduce((acc, curr) => acc + curr.voters.length, 0)}</p>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded border ${theme === 'dark' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-700 border-sky-205'} font-semibold uppercase`}>VOTES</span>
              </div>
            </div>
          </div>
        </div>

        {/* PORTAL CORE NAVIGATION MENU TABS */}
        <div className={`px-4 md:px-8 border-b ${theme === 'dark' ? 'border-sky-500/10 bg-slate-950/15' : 'border-sky-250/20 bg-sky-100/10'} select-none`}>
          <div className="max-w-6xl mx-auto flex items-center justify-between overflow-x-auto gap-4 scrollbar-hidden">
            <div className="flex text-xs tracking-widest font-semibold uppercase">
              <button
                onClick={() => {
                  setCurrentTab('portfolio');
                  setActiveSimulatorApp(null);
                }}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'portfolio' 
                    ? 'border-sky-500 text-sky-500 font-bold' 
                    : theme === 'dark'
                      ? 'border-transparent text-sky-350 hover:text-white'
                      : 'border-transparent text-sky-700 hover:text-sky-950'
                }`}
              >
                <LucideIcon name="Home" size={14} />
                <span>Danh mục ứng dụng</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('simulator');
                }}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'simulator' 
                    ? 'border-sky-500 text-sky-500 font-bold' 
                    : theme === 'dark'
                      ? 'border-transparent text-sky-350 hover:text-white'
                      : 'border-transparent text-sky-700 hover:text-sky-950'
                }`}
              >
                <LucideIcon name="Sparkles" size={14} className="text-cyan-400 animate-pulse" />
                <span>Phòng Giả Lập</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('suggestions');
                  setActiveSimulatorApp(null);
                }}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'suggestions' 
                    ? 'border-sky-500 text-sky-500 font-bold' 
                    : theme === 'dark'
                      ? 'border-transparent text-sky-350 hover:text-white'
                      : 'border-transparent text-sky-700 hover:text-sky-950'
                }`}
              >
                <LucideIcon name="MessageSquare" size={14} />
                <span>Đóng góp ý tưởng</span>
              </button>

              <button
                onClick={() => {
                  setCurrentTab('bugs');
                  setActiveSimulatorApp(null);
                }}
                className={`py-2.5 px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === 'bugs' 
                    ? 'border-sky-500 text-sky-500 font-bold' 
                    : theme === 'dark'
                      ? 'border-transparent text-sky-350 hover:text-white'
                      : 'border-transparent text-sky-700 hover:text-sky-950'
                }`}
              >
                <LucideIcon name="Bug" size={14} />
                <span>Báo lỗi kỹ thuật</span>
              </button>
            </div>
          </div>
        </div>

        {firestoreError && (
          <div className="mx-4 md:mx-8 mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-start gap-3 text-amber-300 text-xs animate-pulse">
            <LucideIcon name="AlertTriangle" size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold text-amber-400 mb-0.5">Sự cố kết nối Firestore: {firestoreError}</p>
              <p className="opacity-80 leading-relaxed text-[11px]">
                Ứng dụng gặp độ trễ hoặc lỗi phân quyền Firestore trên ID cơ sở dữ liệu hiện tại. Hãy click vào thanh đồng bộ ở thanh điều hướng góc trên cùng bên phải để chuyển đổi nguồn dữ liệu giữa "CLOUD (Custom)" và "CLOUD (Default)" nhằm hiển thị đầy đủ danh sách ứng dụng của bạn.
              </p>
            </div>
          </div>
        )}

        {/* --- MAIN PAGE VIEW CONTENT SWITCHER --- */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 overflow-y-auto">
          
          {/* TAB 1: PORTFOLIO SHOWCASE */}
          {currentTab === 'portfolio' && (
            <div className="space-y-6">
              
              {/* Filter controls and Search items bar */}
              <div className={`flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-200'}`}>
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none ${theme === 'dark' ? 'text-gray-400' : 'text-slate-450'}`}>
                    <LucideIcon name="Search" size={15} />
                  </span>
                  <input
                    type="text"
                    placeholder="Tìm kiếm phần mềm v.d. Gia đình, English, AI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs transition-all font-sans focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-505 ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 hover:border-white/20 text-white placeholder-gray-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 placeholder-slate-400 shadow-3xs'
                    }`}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className={`absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                      <LucideIcon name="X" size={14} />
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2 select-none font-sans">
                  
                  {/* Platform Filter */}
                  <div className={`flex border p-0.5 rounded-lg text-xs font-sans ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-3xs'}`}>
                    {(['All', 'Web', 'Mobile', 'Tablet'] as const).map((plat) => (
                      <button
                        key={plat}
                        onClick={() => setPlatformFilter(plat)}
                        className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                          platformFilter === plat 
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-650/40' 
                            : theme === 'dark'
                              ? 'text-gray-400 hover:text-white'
                              : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {plat === 'All' ? 'Tất cả' : plat}
                      </button>
                    ))}
                  </div>

                  {/* Status Dropdown selection */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`border text-xs rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer font-sans ${
                      theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-gray-300'
                        : 'bg-white border-slate-200 text-slate-750 shadow-3xs'
                    }`}
                  >
                    <option value="All">Mọi Trạng thái</option>
                    <option value="Đã phát hành">Đã phát hành</option>
                    <option value="Đã phát hành (Beta)">Đã phát hành (Beta)</option>
                    <option value="Đang phát triển">Đang phát triển</option>
                    <option value="Đang cải tiến">Đang cải tiến</option>
                    <option value="Sắp ra mắt">Sắp ra mắt</option>
                    <option value="Sắp ra mắt (Alpha)">Sắp ra mắt (Alpha)</option>
                  </select>

                  {/* Add App Button for Admin */}
                  {isAdminMode && (
                    <button
                      onClick={handleOpenAddApp}
                      className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl px-4 py-2.5 transition-all shadow-md shadow-indigo-650/30 active:scale-95 cursor-pointer border border-indigo-700/20"
                    >
                      <LucideIcon name="Plus" size={13} />
                      <span>Thêm Ứng dụng</span>
                    </button>
                  )}

                </div>

              </div>

              {/* Grid block of responsive card layouts */}
              {filteredApps.length === 0 ? (
                <div className={`text-center py-24 flex flex-col items-center gap-3 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-450'}`}>
                  <LucideIcon name="Search" size={36} className="text-indigo-400/40 animate-bounce" />
                  <p className="text-sm font-semibold">Không tìm thấy ứng dụng phù hợp!</p>
                  <p className="text-xs text-gray-500 font-medium">Hãy thử từ khóa khác hoặc dọn sạch bộ lọc đang dùng.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setPlatformFilter('All');
                      setStatusFilter('All');
                    }}
                    className="text-xs font-bold text-indigo-500 hover:underline mt-2 cursor-pointer"
                  >
                    Xóa tất cả các bộ lọc
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredApps.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          type: "spring",
                          stiffness: 400,
                          damping: 38,
                          opacity: { duration: 0.2 }
                        }}
                        className="h-full"
                      >
                        <AppCard 
                          app={app} 
                          hasVoted={app.voters.includes(userEmail)} 
                          onSelect={() => setSelectedApp(app)}
                          onVote={() => handleVoteApp(app.id)}
                          onOpenSimulator={() => {
                            setActiveSimulatorApp(app);
                            setCurrentTab('simulator');
                          }}
                          theme={theme}
                          isAdminMode={isAdminMode}
                          onEdit={() => handleOpenEditApp(app)}
                          onDelete={() => handleOpenDeleteApp(app.id, app.name)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SIMULATOR SANDBOX */}
          {currentTab === 'simulator' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <h3 className={`text-base font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                    <LucideIcon name="Sparkles" className="text-cyan-500" />
                    Trình Giả Lập Tương Tác Ứng Dụng
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Trải nghiệm hoạt động nguyên mẫu thực tế của 11 phần mềm</p>
                </div>

                {/* Dropdown switcher inside Simulator space */}
                <div className="flex items-center gap-2 select-none">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}>Chọn giả lập:</span>
                  <select
                    value={activeSimulatorApp ? activeSimulatorApp.id : ''}
                    onChange={(e) => {
                      const selected = apps.find(a => a.id === e.target.value);
                      if (selected) setActiveSimulatorApp(selected);
                    }}
                    className={`border text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-550 cursor-pointer max-w-[240px] md:max-w-xs ${
                      theme === 'dark'
                        ? 'bg-slate-900 border-white/10 text-white'
                        : 'bg-white border-slate-200 text-slate-800 shadow-3xs'
                    }`}
                  >
                    {!activeSimulatorApp && <option value="">-- Click chọn 1 phần mềm --</option>}
                    {apps.map(app => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeSimulatorApp ? (
                <div className="w-full">
                  <Simulator 
                    app={activeSimulatorApp} 
                    onClose={() => {
                      // Redirect back to overview tab
                      setCurrentTab('portfolio');
                    }} 
                  />
                </div>
              ) : (
                <div className={`border rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 ${
                  theme === 'dark'
                    ? 'bg-slate-900/20 border-white/10'
                    : 'bg-slate-50 border-slate-200 shadow-3xs'
                }`}>
                  <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center animate-bounce">
                    <LucideIcon name="Monitor" size={32} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${theme === 'dark' ? 'text-gray-250' : 'text-slate-800'}`}>Chưa có ứng dụng nào được mở giả lập!</h4>
                    <p className={`text-xs mt-1 max-w-sm mx-auto leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-slate-450'}`}>
                      Quý khách vui lòng chọn ứng dụng ở danh sách bên trên, hoặc nhấp vào thẻ ở mục "Trải nghiệm giả lập" ngoài màn hình lớn để khởi chạy tương tác.
                    </p>
                  </div>
                  
                  {/* Grid showing quick triggers of all apps for simulation */}
                  <div className="flex flex-wrap gap-2 pt-4 justify-center max-w-2xl select-none">
                    {apps.map(app => (
                      <button
                        key={app.id}
                        onClick={() => setActiveSimulatorApp(app)}
                        className={`text-[11px] font-bold p-2 px-3 rounded-xl transition-all cursor-pointer border ${
                          theme === 'dark'
                            ? 'bg-slate-900/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 border-white/10 hover:border-indigo-550/30'
                            : 'bg-white hover:bg-slate-100 text-slate-750 hover:text-indigo-600 border-slate-200 hover:border-slate-305'
                        }`}
                      >
                        ⚡ GIẢ LẬP: {app.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VISIONS & SUGGESTIONS */}
          {currentTab === 'suggestions' && (
            <CommunityBoard 
              suggestions={suggestions} 
              onVoteSuggestion={handleVoteSuggestion} 
              onSubmitSuggestion={handleAddSuggestion}
              onEditSuggestion={handleEditSuggestion}
              onDeleteSuggestion={handleDeleteSuggestion}
              apps={apps}
              theme={theme}
              isAdminMode={isAdminMode}
            />
          )}

          {/* TAB 4: BUG LOGGER WORKFLOW */}
          {currentTab === 'bugs' && (
            <BugTracker 
              bugs={bugs} 
              onSubmitBugDirectly={handleAddBug}
              appsList={apps.map(a => ({ id: a.id, name: a.name }))}
              theme={theme}
            />
          )}

        </main>

        {/* FOOTER METADATA INFO */}
        <footer className={`border-t py-6 px-4 md:px-8 text-center select-none shrink-0 transition-all ${
          theme === 'dark' 
            ? 'border-white/10 bg-slate-950 text-gray-400' 
            : 'border-slate-200 bg-slate-50 text-slate-550'
        }`}>
          <p className="text-xs">
            Hệ điều hành Portfolio, Community-Hub và Simulator Ứng dụng liên hoàn. Thiết kế tinh xảo 2026.
          </p>
          <div className="flex justify-center gap-4 mt-2.5 text-[10px]">
            <span className="hover:text-indigo-500 cursor-pointer">Bảng điều khoản sử dụng</span>
            <span>&bull;</span>
            <span className="hover:text-indigo-500 cursor-pointer">Cẩm nang nhà phát triển</span>
            <span>&bull;</span>
            <span className="hover:text-indigo-500 cursor-pointer">chiendq78@gmail.com</span>
          </div>
        </footer>

        {/* --- GLOBAL APP DETAIL MODAL POPUP --- */}
        {selectedApp && (
          <AppDetailsModal
            app={selectedApp}
            hasVoted={selectedApp.voters.includes(userEmail)}
            onClose={() => setSelectedApp(null)}
            onVote={() => handleVoteApp(selectedApp.id)}
            onOpenSimulator={() => {
              setActiveSimulatorApp(selectedApp);
              setCurrentTab('simulator');
            }}
            onSubmitBug={(bugTitle, bugDesc, bugSeverity) => {
              handleAddBug(selectedApp.id, bugTitle, bugDesc, bugSeverity);
            }}
            onSubmitRating={(stars) => {
              handleSubmitRating(selectedApp.id, stars);
            }}
            isAdminMode={isAdminMode}
            onEdit={() => {
              handleOpenEditApp(selectedApp);
              setSelectedApp(null);
            }}
            onDelete={() => {
              handleOpenDeleteApp(selectedApp.id, selectedApp.name);
              setSelectedApp(null);
            }}
          />
        )}

        {/* --- GLOBAL SYSTEM NOTIFICATIONS SIDE DRAWER --- */}
        <NotificationCenter
          notifications={notifications}
          isOpen={isNotifOpen}
          onClearAll={handleClearNotifications}
          onClose={() => setIsNotifOpen(false)}
        />

        {/* --- TOAST ALERT TRIGGER PANEL --- */}
        <AnimatePresence>
          {toastAlert && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="fixed bottom-6 left-6 z-50 p-4 rounded-xl backdrop-blur-2xl bg-slate-900/90 border border-indigo-500/20 shadow-2xl flex items-start gap-3 w-80 animate-fade-in"
            >
              <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                <LucideIcon name="Bell" size={16} />
              </div>
              <div className="text-xs">
                <h5 className="font-bold text-white leading-tight">{toastAlert.title}</h5>
                <p className="text-gray-400 mt-1 leading-normal">{toastAlert.message}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- 🛡️ CUSTOM DELETE CONFIRMATION DIALOG (IFRAME-FRIENDLY) --- */}
        <AnimatePresence>
          {deleteConfirmation && deleteConfirmation.isOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeleteConfirmation(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              />

              {/* Alert Content Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className={`relative w-full max-w-sm rounded-[20px] border p-6 shadow-2xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-[#151923] border-white/10 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                    <LucideIcon name="AlertTriangle" size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Xác nhận xóa ứng dụng?</h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-650'}`}>
                      Bạn có chắc chắn muốn xóa vĩnh viễn ứng dụng <strong className="text-rose-400 font-semibold">"{deleteConfirmation.appName}"</strong> khỏi hệ sinh thái? Hành động này không thể hoàn tác.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <button
                    onClick={() => setDeleteConfirmation(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      theme === 'dark'
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={handleConfirmDeleteApp}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-650/20 cursor-pointer transition-all active:scale-95"
                  >
                    Xác nhận Xóa
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- 🛡️ CUSTOM SAVE (ADD/EDIT) CONFIRMATION DIALOG (IFRAME-FRIENDLY) --- */}
        <AnimatePresence>
          {saveConfirmation && saveConfirmation.isOpen && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSaveConfirmation(null)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              />

              {/* Alert Content Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className={`relative w-full max-w-sm rounded-[20px] border p-6 shadow-2xl overflow-hidden ${
                  theme === 'dark'
                    ? 'bg-[#151923] border-white/10 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    saveConfirmation.mode === 'add'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-indigo-500/10 text-indigo-550 dark:text-indigo-400'
                  }`}>
                    <LucideIcon name={saveConfirmation.mode === 'add' ? 'PlusCircle' : 'FileEdit'} size={20} className="animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">
                      {saveConfirmation.mode === 'add' ? 'Xác nhận Thêm Ứng dụng?' : 'Xác nhận Lưu Chỉnh sửa?'}
                    </h3>
                    <p className={`text-xs mt-1.5 leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-slate-655'}`}>
                      {saveConfirmation.mode === 'add' ? (
                        <>
                          Bạn có chắc chắn muốn thêm ứng dụng mới <strong className="text-emerald-400 font-semibold">"{saveConfirmation.appData.name}"</strong> vào hệ sinh thái ứng dụng không?
                        </>
                      ) : (
                        <>
                          Bạn có chắc chắn muốn lưu lại các thay đổi cho ứng dụng <strong className="text-indigo-400 font-semibold">"{saveConfirmation.appData.name}"</strong> không?
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setAppFormModal({
                        isOpen: true,
                        mode: saveConfirmation.mode,
                        appId: saveConfirmation.appId,
                        appData: saveConfirmation.appData
                      });
                      setSaveConfirmation(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                      theme === 'dark'
                        ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    Hủy bỏ / Chỉnh sửa thêm
                  </button>
                  <button
                    onClick={handleConfirmSaveApp}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg cursor-pointer transition-all active:scale-95 ${
                      saveConfirmation.mode === 'add'
                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-555/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                    }`}
                  >
                    Đồng ý
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- 🛡️ ADMIN ADD/EDIT APP MODAL FORM --- */}
        <AnimatePresence>
          {appFormModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAppFormModal({ isOpen: false, mode: 'add' })}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              />

              {/* Form Content panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-lg rounded-[20px] border p-6 md:p-8 shadow-2xl overflow-hidden font-sans my-8 ${
                  theme === 'dark'
                    ? 'bg-[#151923] border-white/10 text-white'
                    : 'bg-white border-slate-200 text-slate-780 shadow shadow-indigo-600/5'
                }`}
              >
                {/* Modal Title header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg animate-pulse">
                      <LucideIcon name={appFormModal.mode === 'add' ? 'PlusCircle' : 'FileEdit'} size={18} />
                    </div>
                    <h3 className="font-extrabold text-sm tracking-tight">
                      {appFormModal.mode === 'add' ? 'Thêm Ứng dụng mới' : 'Chỉnh sửa Ứng dụng'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setAppFormModal({ isOpen: false, mode: 'add' })}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LucideIcon name="X" size={14} />
                  </button>
                </div>

                {/* Form fields layout */}
                <AppFormBody
                  mode={appFormModal.mode}
                  initialData={appFormModal.appData}
                  onSave={handleSaveAppForm}
                  onCancel={() => setAppFormModal({ isOpen: false, mode: 'add' })}
                  theme={theme}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- 📊 REAL-TIME SYNC LOGS MONITORING MODAL --- */}
        <AnimatePresence>
          {isSyncLogsOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSyncLogsOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              />

              {/* Modal Content Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-4xl rounded-[24px] border p-6 md:p-8 shadow-2xl overflow-hidden font-sans my-8 flex flex-col max-h-[90vh] ${
                  theme === 'dark'
                    ? 'bg-[#0f131a] border-indigo-500/20 text-white'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-indigo-500/10 mb-6 shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl animate-pulse">
                      <LucideIcon name="History" size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm tracking-tight font-sans">Hệ Thống Giám Sát Đồng Bộ</h3>
                      <p className={`text-[10px] mt-0.5 ${theme === 'dark' ? 'text-indigo-300/60' : 'text-slate-500'}`}>
                        Nhật ký đồng bộ thời gian thực giữa LocalStorage và Cloud Firestore
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsSyncLogsOpen(false)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-white/5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LucideIcon name="X" size={14} />
                  </button>
                </div>

                {/* Body Content: Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden flex-1 min-h-0">
                  {/* Left Column: Stats & Actions */}
                  <div className="md:col-span-4 space-y-5 flex flex-col">
                    <div className={`p-4 rounded-xl border ${
                      theme === 'dark' ? 'bg-[#151922] border-white/5' : 'bg-slate-50 border-slate-105'
                    }`}>
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3">Thông số phiên làm việc</h4>
                      <div className="space-y-2.5 text-xs text-slate-300">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Database ID:</span>
                          <span className="font-mono text-[10px] font-bold text-indigo-400">{activeDbId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Trạng thái kết nối:</span>
                          <span className="font-bold flex items-center gap-1 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Live
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Tổng số Log tích lũy:</span>
                          <span className="font-bold text-indigo-400">{syncLogs.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Filter Forms */}
                    <div className="space-y-3 flex-1 min-h-0">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Trạng thái Event</label>
                        <div className="flex flex-wrap gap-1.5">
                          {(['all', 'success', 'warning', 'error', 'info'] as const).map(f => (
                            <button
                              key={f}
                              onClick={() => setSyncFilterType(f)}
                              className={`px-2.5 py-1 text-[10px] rounded-lg font-bold border transition-all cursor-pointer ${
                                syncFilterType === f
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : theme === 'dark'
                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {f.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Hướng dữ liệu</label>
                        <div className="flex flex-col gap-1.5">
                          {[
                            { id: 'all', title: 'TẤT CẢ HƯỚNG' },
                            { id: 'local_to_cloud', title: 'LOCAL ➔ CLOUD (Upload)' },
                            { id: 'cloud_to_local', title: 'CLOUD ➔ LOCAL (Download)' },
                            { id: 'cloud_listen', title: 'LISTENERS (Thời gian thực)' },
                            { id: 'system', title: 'HỆ THỐNG SYSTEM' }
                          ].map(f => (
                            <button
                              key={f.id}
                              onClick={() => setSyncFilterDirection(f.id as any)}
                              className={`w-full text-left px-3 py-1.5 text-[10px] rounded-lg font-bold border transition-all cursor-pointer ${
                                syncFilterDirection === f.id
                                  ? 'bg-indigo-600 border-indigo-500 text-white'
                                  : theme === 'dark'
                                    ? 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {f.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Clear Logs Action */}
                    <button
                      onClick={() => {
                        const cleared = [
                          {
                            id: 'reset',
                            timestamp: new Date().toLocaleTimeString('vi-VN', { hour12: false }),
                            type: 'info' as const,
                            direction: 'system' as const,
                            message: 'Người dùng đã dọn sạch lịch sử giám sát đồng bộ.'
                          }
                        ];
                        setSyncLogs(cleared);
                        localStorage.setItem('nexus_sync_logs', JSON.stringify(cleared));
                        triggerToast('Nhật ký dọn dẹp', 'Đã xóa toàn bộ logs cũ thành công.');
                      }}
                      className={`w-full py-2.5 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400'
                          : 'border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700'
                      }`}
                    >
                      <LucideIcon name="Trash2" size={13} />
                      <span>Xóa mọi Nhật ký ({syncLogs.length})</span>
                    </button>
                  </div>

                  {/* Right Column: Scrollable logs feed */}
                  <div className="md:col-span-8 flex flex-col h-full min-h-0">
                    <div className={`p-4 h-full rounded-2xl border flex flex-col min-h-0 ${
                      theme === 'dark' ? 'bg-[#151922] border-white/5' : 'bg-slate-50 border-slate-150'
                    }`}>
                      <div className="flex justify-between items-center mb-3 text-xs">
                        <span className="font-bold text-gray-405">Thời gian & Sự kiện</span>
                        <span className="text-[10px] text-indigo-400 font-mono">Real-time syncing monitor panel</span>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                        {syncLogs
                          .filter(log => syncFilterType === 'all' || log.type === syncFilterType)
                          .filter(log => syncFilterDirection === 'all' || log.direction === syncFilterDirection).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                              <LucideIcon name="History" size={24} className="text-gray-600 mb-2 animate-bounce" />
                              <p className="text-xs">Không tìm thấy bản ghi đồng bộ nào khớp với bộ lọc.</p>
                            </div>
                          ) : (
                            syncLogs
                              .filter(log => syncFilterType === 'all' || log.type === syncFilterType)
                              .filter(log => syncFilterDirection === 'all' || log.direction === syncFilterDirection)
                              .map(log => {
                                // icon maps
                                let dirIcon = 'Activity';
                                if (log.direction === 'local_to_cloud') dirIcon = 'CloudLightning';
                                else if (log.direction === 'cloud_to_local') dirIcon = 'CloudDownload';
                                else if (log.direction === 'cloud_listen') dirIcon = 'Wifi';
                                else if (log.direction === 'system') dirIcon = 'Server';

                                // type maps
                                let badgeColors = 'border-[#22c55e]/20 bg-[#22c55e]/5 text-[#22c55e]';
                                if (log.type === 'error') badgeColors = 'border-[#ef4444]/20 bg-[#ef4444]/5 text-[#ef4444]';
                                else if (log.type === 'warning') badgeColors = 'border-[#f59e0b]/20 bg-[#f59e0b]/5 text-[#f59e0b]';
                                else if (log.type === 'info') badgeColors = 'border-sky-500/20 bg-sky-500/5 text-sky-400';

                                return (
                                  <div
                                    key={log.id}
                                    className={`p-3 rounded-xl border flex gap-3 text-xs transition-all duration-200 leading-normal hover:translate-x-0.5 ${
                                      theme === 'dark'
                                        ? 'bg-[#1a1e2a] border-slate-800 hover:border-indigo-500/20'
                                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-3xs'
                                    }`}
                                  >
                                    <div className="flex flex-col items-center">
                                      <div className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${badgeColors}`}>
                                        <LucideIcon name={dirIcon as any} size={13} />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-mono text-[9.5px] text-gray-500 font-bold">{log.timestamp}</span>
                                        <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide border ${badgeColors}`}>
                                          {log.type}
                                        </span>
                                      </div>
                                      <p className={`text-[11px] ${theme === 'dark' ? 'text-gray-300' : 'text-slate-650'}`}>{log.message}</p>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
