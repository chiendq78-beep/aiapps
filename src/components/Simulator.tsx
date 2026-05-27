import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppIdea, Platform } from '../types';
import LucideIcon from './LucideIcon';

interface SimulatorProps {
  app: AppIdea;
  onClose?: () => void;
}

export default function Simulator({ app, onClose }: SimulatorProps) {
  // Simulator Viewports: Web (Desktop), Tablet, Mobile
  const [viewport, setViewport] = useState<Platform>('Web');

  // Sync default viewport with app features on load
  useEffect(() => {
    if (app.platforms.length > 0) {
      // Prefer Web, then Mobile, then Tablet
      if (app.platforms.includes('Web')) setViewport('Web');
      else if (app.platforms.includes('Mobile')) setViewport('Mobile');
      else setViewport(app.platforms[0]);
    }
  }, [app]);

  // General App Simulator states
  const [activeTab, setActiveTab] = useState<string>('home');
  const [screenTheme, setScreenTheme] = useState<'slate' | 'indigo' | 'teal' | 'emerald' | 'rose'>('slate');
  const [simulationMode, setSimulationMode] = useState<'sandbox' | 'iframe'>('sandbox');

  const screenThemeClasses = {
    slate: 'bg-slate-950 text-slate-100',
    indigo: 'bg-[#0a0720] text-[#e0f2fe]',
    teal: 'bg-[#02181d] text-[#e0f2fe]',
    emerald: 'bg-[#011a13] text-[#e0f2fe]',
    rose: 'bg-[#1a020f] text-[#e0f2fe]'
  };

  const themeGlows = {
    slate: 'shadow-2xl shadow-indigo-950/40',
    indigo: 'shadow-2xl shadow-indigo-500/20',
    teal: 'shadow-2xl shadow-teal-500/25',
    emerald: 'shadow-2xl shadow-emerald-500/20',
    rose: 'shadow-2xl shadow-rose-500/20'
  };

  // Simulated alert/toast notifications inside the mockup devices (combating iframe block limits)
  const [simulatedToast, setSimulatedToast] = useState<{ title: string; message: string; type: 'success' | 'info' } | null>(null);

  const triggerSimulatedToast = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setSimulatedToast({ title, message, type });
  };

  useEffect(() => {
    if (simulatedToast) {
      const timer = setTimeout(() => {
        setSimulatedToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [simulatedToast]);

  // --- States & Effects for Custom Created Apps Fallback Simulator ---
  const [customChatLogs, setCustomChatLogs] = useState<{ sender: 'ai' | 'user'; text: string }[]>([]);
  const [customQuery, setCustomQuery] = useState('');
  const [customDatabaseRows, setCustomDatabaseRows] = useState<{ id: number; name: string; status: string }[]>([]);
  const [newDbRowName, setNewDbRowName] = useState('');

  const isPreLoadedApp = [
    'gia-dinh-gian-don',
    'nhac-nho-uong-thuoc',
    'edugrade',
    'costume-rental-pro',
    'bac-si-tam-an',
    'solo-business-os',
    'school-os',
    'nv-english',
    'quan-ly-cong-viec',
    'nv-connect',
    'hr-okr-suite'
  ].includes(app.id);

  useEffect(() => {
    if (app.appUrl) {
      setSimulationMode('iframe');
    } else {
      setSimulationMode('sandbox');
    }
  }, [app]);

  useEffect(() => {
    if (!isPreLoadedApp) {
      setCustomChatLogs([
        {
          sender: 'ai',
          text: `Chào mừng bạn đến với mô phỏng của "${app.name}"! Tôi là trợ lý AI tích hợp sẵn trong hệ thống sandbox.\n\nỨng dụng này được định hình cho các nền tảng *${app.platforms.join(', ')}* và chạy trên bộ công nghệ *${app.techStack?.join(', ') || 'React, Tailwind'}*.\n\nBạn muốn tôi tạo báo cáo hay tư vấn thiết kế tính năng nào? Click thử nút gợi ý phía dưới nhé!`
        }
      ]);
      setCustomDatabaseRows([
        { id: 1, name: `Khởi tạo database cho ${app.name}`, status: 'Hoạt động' },
        { id: 2, name: 'Kiểm tra kết nối API Gateway', status: 'Bình thường' }
      ]);
    }
  }, [app, isPreLoadedApp]);

  const handleCustomQuerySubmit = (queryText: string) => {
    if (!queryText.trim()) return;
    
    // User message
    const updatedLogs = [...customChatLogs, { sender: 'user' as const, text: queryText }];
    setCustomChatLogs(updatedLogs);
    setCustomQuery('');

    // Generate response based on app details
    setTimeout(() => {
      let reply = '';
      const text = queryText.toLowerCase();

      if (text.includes('tech') || text.includes('công nghệ') || text.includes('stack') || text.includes('code')) {
        reply = `Để xây dựng "${app.name}", hệ thống đang cấu hình bộ khung phát triển gồm: ${app.techStack?.join(', ') || 'React, TypeScript, Tailwind'}.\n\nPhân tích cấu trúc đề xuất dùng các thư viện tối ưu hóa render và quản lý state cục bộ để tăng tốc độ phản hồi.`;
      } else if (text.includes('features') || text.includes('tính năng') || text.includes('chức năng') || text.includes('làm gì') || text.includes('ý tưởng')) {
        reply = `Dựa trên mô tả: "${app.description}", những tính năng bám sát thực tế nhất là:\n1. Giao diện mượt mà tương thích ${app.platforms.join(', ')}.\n2. Công cụ quản lý chỉ số cốt lõi và lưu trữ LocalStorage.\n3. Thành phần bảng phân tích dữ liệu trực quan bằng biểu đồ.\n\nChúng tôi khuyên khích bạn thêm mốc lộ trình mới vào phần Bảng điều khiển!`;
      } else if (text.includes('deploy') || text.includes('triển khai') || text.includes('publish') || text.includes('lên mạng')) {
        reply = `Vì trạng thái của ứng dụng là "${app.status}", bạn có thể tiến hành đóng gói Docker hoặc đẩy mã nguồn thông qua webhook tự động của nền tảng khi chuyển sang giai đoạn phát hành Beta.`;
      } else if (text.includes('lỗi') || text.includes('bug') || text.includes('hỏng')) {
        reply = `Rất đơn giản! Hãy gửi báo cáo lỗi tại Tab "Bug Tracker" ngay bên cạnh để đội ngũ lập trình viên ghi nhận lập tức, hoặc mô tả mã lỗi tại đây để tôi chẩn đoán sơ bộ giúp bạn.`;
      } else {
        reply = `Tổng đài AI nhận được đề xuất: "${queryText}". Để hệ sinh thái "${app.name}" hoàn hảo hơn, chúng tôi khuyến nghị tối ưu hóa thời gian phản hồi API và tích hợp thêm các hoạt cảnh tinh tế chuyển tiếp.`;
      }

      setCustomChatLogs(prev => [...prev, { sender: 'ai' as const, text: reply }]);
    }, 1000);
  };

  // --- Sub-App Specific Hook States ---

  // 1. Gia Đình Giản Đơn
  const [chores, setChores] = useState([
    { id: 1, text: 'Lửa bếp & Nấu cơm', owner: 'Bố', done: false },
    { id: 2, text: 'Quét nhà, lau phòng khách', owner: 'Con trai', done: true },
    { id: 3, text: 'Phân loại rác & đem đổ', owner: 'Con gái', done: false },
  ]);
  const [newChore, setNewChore] = useState('');
  const [choreOwner, setChoreOwner] = useState('Con trai');

  const [expenses, setExpenses] = useState([
    { id: 1, text: 'Mua sữa bột bé út', amount: 450000, date: 'Hãy vừa xong' },
    { id: 2, text: 'Thanh toán tiền điện tháng này', amount: 850000, date: '1 ngày trước' },
  ]);
  const [newExpenseName, setNewExpenseName] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');

  // 2. Nhắc Nhở Uống Thuốc
  const [pills, setPills] = useState([
    { id: 1, name: 'Paracetamol 500mg', dose: '1 viên', time: '08:00 AM', taken: false, iconColor: 'text-rose-500 bg-rose-500/10' },
    { id: 2, name: 'Vitamin C 1000mg', dose: '1 viên sủi', time: '12:00 PM', taken: true, iconColor: 'text-amber-500 bg-amber-500/10' },
    { id: 3, name: 'Glucosamine bổ khớp', dose: '2 viên', time: '06:00 PM', taken: false, iconColor: 'text-emerald-500 bg-emerald-500/10' },
  ]);
  const [newPillName, setNewPillName] = useState('');
  const [newPillTime, setNewPillTime] = useState('08:00 AM');

  // 3. EduGrade
  const [role, setRole] = useState<'teacher' | 'parent'>('teacher');
  const [students, setStudents] = useState([
    { id: 1, name: 'Phan Văn Nam', math: 8.5, lit: 7.0, conduct: 'Tốt' },
    { id: 2, name: 'Nguyễn Thị Hoa', math: 9.0, lit: 9.5, conduct: 'Tốt' },
    { id: 3, name: 'Trần Minh Đức', math: 6.5, lit: 6.0, conduct: 'Khá' },
  ]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [gradeMath, setGradeMath] = useState('');
  const [gradeLit, setGradeLit] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'parent', text: 'Chào cô chủ nhiệm, điểm thi giữa kỳ môn Văn của cháu Hoa thế nào ạ?' },
    { sender: 'teacher', text: 'Dạ chào chị Hoa thi đạt điểm 9.5 cao nhất lớp đó chị ơi! Cháu học rất chăm.' }
  ]);
  const [newMsg, setNewMsg] = useState('');

  // 4. CostumeRentalPro
  const [rentCatalog, setRentCatalog] = useState([
    { id: 1, name: 'Trang phục Cosplay Naruto (Hỏa影)', price: 150000, stock: 4, type: 'Anime' },
    { id: 2, name: 'Cổ trang Hán Phục Thủy Thần', price: 250000, stock: 2, type: 'Cổ trang' },
    { id: 3, name: 'Áo Dài Truyền Thống Hoa Sen', price: 120000, stock: 8, type: 'Truyền thống' }
  ]);
  const [rentCart, setRentCart] = useState<{ name: string; price: number; days: number }[]>([]);
  const [rentDays, setRentDays] = useState(2);

  // 5. Bác sĩ Tâm An
  const [healthQuery, setHealthQuery] = useState('');
  const [chatLogs, setChatLogs] = useState([
    { sender: 'ai', text: 'Xin chào! Tôi là Bác sĩ Trợ lý AI Tâm An. Bạn đang cần tư vấn về triệu chứng cơ thể hay tìm kiếm vị thuốc nam cổ truyền nào?' }
  ]);
  const [activeOrgan, setActiveOrgan] = useState<string>('Tim');

  const organData: Record<string, { desc: string; herb: string; disease: string }> = {
    'Tim': {
      desc: 'Hệ tuần hoàn trung tâm vận chuyển oxy dưỡng chất nuôi cơ thể.',
      herb: 'Cây Đan Sâm, Cây Tam Thất (hỗ trợ lưu thông khí huyết, bổ tim mạch).',
      disease: 'Huyết áp cao, xơ vữa động mạch, suy tim nhẹ.'
    },
    'Phổi': {
      desc: 'Hệ hô hấp tiếp nhận dưỡng khí, thanh lọc carbonic.',
      herb: 'Lá Bản Lam Căn, Rẻ Quạt, Cát Cánh (giảm ho, bổ phế tiêu viêm).',
      disease: 'Viêm phế quản, ho hen suyễn, viêm họng hạt.'
    },
    'Dạ dày': {
      desc: 'Hệ tiêu hóa co bóp nghiền nát thức ăn hấp thu dinh dưỡng.',
      herb: 'Nghệ vàng kết hợp Mật ong, Chè dây (kháng viêm loét dạ dày).',
      disease: 'Trào ngược dạ dày, đau bao tử cấp tính, khó tiêu.'
    }
  };

  // 6. Solo Business OS
  const [crmLeads, setCrmLeads] = useState([
    { id: 1, name: 'Công ty Cổ phần TechVibe', deal: 'Thiết kế Landing Page', val: '12.000.000 đ', stage: 'Thương lượng' },
    { id: 2, name: 'Cửa hàng Gốm Sứ Bát Tràng', deal: 'Quản trị Fanpage & SEO', val: '8.000.000 đ', stage: 'Đã ký hợp đồng' },
    { id: 3, name: 'Thương hiệu Giày Sneaker X', deal: 'Chạy quảng cáo TikTok Ads', val: '15.000.000 đ', stage: 'Tiếp cận ban đầu' }
  ]);
  const [leadName, setLeadName] = useState('');
  const [leadVal, setLeadVal] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([
    { desc: 'Phát triển Frontend React', price: 9500000 },
    { desc: 'Tối ưu tốc độ SEO Page Speed', price: 2500000 }
  ]);

  // 7. SchoolOS
  const [faceScanActive, setFaceScanActive] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [schoolStudents, setSchoolStudents] = useState([
    { id: 'ST001', name: 'Lê Hoàng Minh', class: '10A3', status: 'Vắng mặt', time: '-' },
    { id: 'ST002', name: 'Cấn Hồng Nhung', class: '11B1', status: 'Đã điểm danh', time: '07:15 AM' },
    { id: 'ST003', name: 'Nguyễn Đăng Chiến', class: '12A1', status: 'Vắng mặt', time: '-' },
  ]);

  // 8. NV ENGLISH
  const quizQuestions = [
    {
      q: 'Choose the correct word: "If she _______ harder, she would pass the exam."',
      opts: ['study', 'studies', 'studied', 'had studied'],
      ansIdx: 2,
      explain: 'Đây là câu điều kiện loại 2 thể hiện sự việc không có thật ở hiện tại. Cấu trúc: If + S + V-ed/V2, S + would + V-infi.'
    },
    {
      q: 'Identify the synonym of "essential":',
      opts: ['easy', 'necessary', 'optional', 'useless'],
      ansIdx: 1,
      explain: 'Essential có nghĩa là "thiết yếu", tương đương với "necessary".'
    },
    {
      q: 'He is interested _______ learning Vietnamese traditional medicine.',
      opts: ['on', 'in', 'at', 'with'],
      ansIdx: 1,
      explain: 'Cấu trúc cố định: be interested in sth / doing sth (quan tâm, hứng thú với cái gì).'
    }
  ];
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [scoreCount, setScoreCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // 9. QUẢN LÝ CÔNG VIỆC
  const [kanbanTasks, setKanbanTasks] = useState([
    { id: 1, title: 'Thiết kế Wireframe giao diện chính Portfolio', col: 'Todo', priority: 'Trung bình' },
    { id: 2, title: 'Viết mã xử lý bộ điều khiển báo lỗi khách hàng', col: 'Progress', priority: 'Cao' },
    { id: 3, title: 'Đồng bộ API Google Gemini cho trợ lý Tâm An', col: 'Review', priority: 'Nghiêm trọng' },
    { id: 4, title: 'Tích hợp Tailwind CSS phiên bản 4 cực chất', col: 'Done', priority: 'Thấp' }
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // 10. NV Connect
  const [models, setModels] = useState([
    { id: 1, name: 'Tàu bè Benchy huyền thoại (.STL)', downloads: 412, size: '8.4 MB', author: 'Maker_VN' },
    { id: 2, name: 'Khớp rồng cuộn khớp nối động (.3MF)', downloads: 853, size: '24.1 MB', author: 'ChienDragon' },
    { id: 3, name: 'Khay đựng thẻ nhớ bento box (.STL)', downloads: 154, size: '2.5 MB', author: 'DeskOrganizer' }
  ]);
  const [filamentType, setFilamentType] = useState('PLA');
  const [filamentWeight, setFilamentWeight] = useState('120'); // Grams

  // 11. HR - OKR & Performance Suite
  const [okrs, setOkrs] = useState([
    { id: 1, goal: 'Hoạt động chất lượng: Thiết kế 10 Modules Ứng dụng', progress: 80, owner: 'Chung' },
    { id: 2, goal: 'Truyền thông: Thu hút 1,000 lượt bình chọn cộng đồng', progress: 55, owner: 'Marketing Team' },
    { id: 3, goal: 'Kỹ thuật: Giảm tỷ lệ crash hệ thống xuống dưới 0.1%', progress: 95, owner: 'Dev Team' }
  ]);
  const [selfScore, setSelfScore] = useState(85);
  const [colleagueScore, setColleagueScore] = useState(90);
  const [hrFeedbackSubmitted, setHrFeedbackSubmitted] = useState(false);

  // General helpers for AI Bot replies
  const selectSymptomsReply = (symptom: string) => {
    let reply = '';
    if (symptom.includes('sốt')) {
      reply = 'Triệu chứng sốt nhẹ kèm đau đầu của bạn có thể do cảm lạnh thời tiết hoặc hoạt động mệt mỏi quá sức. Theo Y học dân gian, bạn có thể uống nước ấm pha gừng, xông hơi lá sả và nghỉ ngơi hợp lý. Tuy nhiên nếu sốt cao liên tục trên 38.5°C vĩ trường cần dùng thuốc hạ sốt paracetamol và đi khám bác sĩ ngay bạn nhé!';
    } else if (symptom.includes('dạ dày') || symptom.includes('đau bụng')) {
      reply = 'Đau bụng âm ỉ hoặc rát dạ dày có thể là dấu hiệu sớm của viêm dạ dày tăng acid. Bạn nên ăn uống đúng bữa, tránh ăn đồ cay nóng, bia rượu. Hằng ngày có thể uống 1 ly nước ấm pha 1 muỗng mật ong và nghệ vàng trước bữa ăn sáng để bọc vết niêm mạc. Tránh căng thẳng để dạ dày co bóp nhẹ nhàng hơn.';
    } else if (symptom.includes('sả') || symptom.includes('dược liệu')) {
      reply = 'Cây sả chứa hàm lượng lớn tinh dầu Geraniol và Citral. Sả có tính ấm, vị cay ôn. Rất hiệu quả cho việc xông hơi giải cảm, hỗ trợ ra mồ hôi giải độc tố, sát khuẩn đường hô hấp rất tốt và kích thích tiêu hóa khỏe mạnh.';
    } else {
      reply = 'Tôi đã nhận được câu hỏi. Sức khỏe của bạn là vàng. Bạn có muốn biết công dụng của bài thuốc dân gian từ các cây thuốc nam cận kề như: Cây tía tô, lá lốt, ngải cứu không?';
    }
    
    setChatLogs(prev => [
      ...prev,
      { sender: 'user', text: symptom },
      { sender: 'ai', text: reply }
    ]);
    setHealthQuery('');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl relative z-10 w-full animate-fade-in">
      
      {/* Top Header Controls with Viewport Switzer */}
      <div className="bg-slate-950/90 border-b border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white">
            <LucideIcon name={app.icon} size={18} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm leading-none flex items-center gap-1.5">
              <span>{app.name}</span>
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded">SIMULATOR v{app.currentVersion}</span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Trải nghiệm tương tác giả lập đa nền tảng</p>
          </div>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(['Web', 'Tablet', 'Mobile'] as Platform[]).map((p) => {
            const isSupported = app.platforms.includes(p);
            const isSelected = viewport === p;
            return (
              <button
                key={p}
                disabled={!isSupported}
                onClick={() => setViewport(p)}
                className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-md transition-all ${
                  isSelected 
                    ? 'bg-indigo-600/90 text-white shadow-md' 
                    : isSupported 
                      ? 'text-gray-400 hover:text-white hover:bg-slate-800/50' 
                      : 'text-gray-600 opacity-30 cursor-not-allowed'
                }`}
                title={isSupported ? `Mô phỏng ${p}` : `Ứng dụng không hỗ trợ nền tảng ${p}`}
              >
                <LucideIcon name={p === 'Web' ? 'Monitor' : p === 'Tablet' ? 'Tablet' : 'Smartphone'} size={12} />
                <span className="hidden xs:inline">{p}</span>
              </button>
            );
          })}
        </div>

        {/* Toggle Mode button if app has appUrl */}
        {app.appUrl && (
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setSimulationMode('sandbox')}
              className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                simulationMode === 'sandbox'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Trải nghiệm kịch bản giả lập chức năng đặc trưng"
            >
              <LucideIcon name="Cpu" size={12} />
              <span>Chế độ giả lập</span>
            </button>
            <button
              onClick={() => setSimulationMode('iframe')}
              className={`flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                simulationMode === 'iframe'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
              title="Trải nghiệm trực tuyến thực tế ứng dụng thông qua iFrame"
            >
              <LucideIcon name="Globe" size={12} />
              <span>Xem Web trực tiếp</span>
            </button>
          </div>
        )}



        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-gray-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer self-stretch sm:self-auto flex items-center justify-center"
            title="Đóng Trình Giả Lập"
          >
            <LucideIcon name="X" size={16} />
          </button>
        )}
      </div>

      {/* Main Glass Screen View container simulator based on viewport size styling */}
      <div className="flex-1 bg-slate-950/40 p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
        
        {/* Responsive Frame container */}
        <div 
          className={`bg-slate-905 border ${themeGlows[screenTheme]} rounded-3xl transition-all duration-500 overflow-hidden flex flex-col ${
            viewport === 'Mobile' 
              ? 'w-[340px] h-[580px] border-slate-700/80 ring-8 ring-slate-800' 
              : viewport === 'Tablet' 
                ? 'w-[640px] h-[520px] border-slate-700/80 ring-10 ring-slate-800' 
                : 'w-full max-w-4xl h-[520px] border-slate-800'
          }`}
        >
          {/* Top Notch / Lens Camera bar simulated only for Mobile/Tablet */}
          {viewport === 'Mobile' && (
            <div className="bg-slate-900 py-1.5 flex justify-center items-center relative gap-4 border-b border-slate-800">
              <div className="w-16 h-4 bg-slate-950 rounded-full flex items-center justify-around px-2 z-10">
                <div className="w-1.5 h-1.5 bg-indigo-500/60 rounded-full" />
                <div className="w-5 h-1 bg-slate-800 rounded-full" />
              </div>
              <span className="text-[10px] text-gray-500 absolute left-4 font-semibold">09:41</span>
              <div className="flex gap-1 absolute right-4 text-gray-500 text-[10px]">
                <LucideIcon name="Activity" size={10} />
                <span className="text-[9px]">5G</span>
              </div>
            </div>
          )}

          {viewport === 'Tablet' && (
            <div className="bg-slate-900 py-1 flex justify-center relative items-center border-b border-slate-800">
              <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-850" />
            </div>
          )}

          {/* Web Browser Top Bar style mock for Web */}
          {viewport === 'Web' && (
            <div className="bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 py-2 select-none">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded px-4 py-0.5 text-[11px] text-gray-400 w-1/2 max-w-[400px] text-center truncate" title={app.appUrl || `https://${app.id}.dev.vn/studio`}>
                {app.appUrl || `https://${app.id}.dev.vn/studio`}
              </div>
              <div className="w-10" />
            </div>
          )}

          {/* --- ACTIVE INTERACTIVE SCREEN PLAYGROUND --- */}
          <div className={`flex-1 ${screenThemeClasses[screenTheme]} ${simulationMode === 'iframe' && app.appUrl ? 'p-0 overflow-hidden' : 'p-4 overflow-y-auto'} flex flex-col font-sans transition-all duration-300 relative`}>
            
            {/* Simulated Toast Notification overlay inside Device Mockup */}
            <AnimatePresence>
              {simulatedToast && simulationMode !== 'iframe' && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute top-4 left-4 right-4 bg-slate-900/95 text-slate-100 border border-indigo-500/30 p-3 rounded-xl shadow-lg z-50 flex items-start gap-2.5 backdrop-blur-md"
                >
                  <div className="p-1 rounded bg-indigo-500/20 text-indigo-400 mt-0.5">
                    <LucideIcon name={simulatedToast.type === 'success' ? 'CheckCircle' : 'Info'} size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-bold text-slate-100 truncate">{simulatedToast.title}</h5>
                    <p className="text-[9.5px] text-gray-400 mt-0.5 leading-normal">{simulatedToast.message}</p>
                  </div>
                  <button onClick={() => setSimulatedToast(null)} className="text-gray-500 hover:text-white transition-colors cursor-pointer p-0.5">
                    <LucideIcon name="X" size={10} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {simulationMode === 'iframe' && app.appUrl ? (
              <div className="w-full h-full flex flex-col relative bg-slate-950 text-slate-100 select-none">
                <iframe
                  src={app.appUrl}
                  title={`Embedded live app of ${app.name}`}
                  className="w-full h-full border-0 bg-white flex-1"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating helpful action for iframes that are blocked */}
                <div className="absolute bottom-4 right-4 z-40 flex items-center gap-2.5 bg-[#0f131a]/95 border border-indigo-500/30 pl-3.5 pr-4 py-2.5 rounded-2xl shadow-2xl text-white backdrop-blur-md transition-all text-[11.5px] font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-slate-300 font-medium">Bảo mật iFrame: Nếu web không phản hồi, vui lòng nhấn</span>
                  <button
                    onClick={() => {
                      if (app.appUrl) window.open(app.appUrl, '_blank');
                    }}
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-extrabold ml-1 transition-all cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800/80 hover:bg-slate-850"
                  >
                    <span>Mở Tab mới</span>
                    <LucideIcon name="ExternalLink" size={12} className="shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* 1. GIA ĐÌNH GIẢN ĐƠN MOCK */}
            {app.id === 'gia-dinh-gian-don' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <LucideIcon name="Home" className="text-indigo-400" />
                    <span className="font-bold text-xs">Mái Ấm Hạnh Phúc</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">3 thành viên trực tuyến</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-emerald-950/20 border border-emerald-800/40 p-2.5 rounded-xl">
                    <p className="text-[10px] text-gray-400">Ngân sách chung</p>
                    <p className="font-bold text-emerald-400 text-sm">3,500,000 đ</p>
                  </div>
                  <div className="bg-indigo-950/20 border border-indigo-800/40 p-2.5 rounded-xl">
                    <p className="text-[10px] text-gray-400">Tuyệt đối Chăm</p>
                    <p className="font-bold text-indigo-400 text-sm">
                      {chores.filter(c => c.done).length} / {chores.length} việc nhà
                    </p>
                  </div>
                </div>

                {/* Chores Section */}
                <div className="bg-slate-900/30 border border-slate-800/50 p-3 rounded-xl">
                  <h4 className="text-xs font-bold text-indigo-400 mb-2.5 flex items-center gap-1">
                    <LucideIcon name="CheckCircle2" size={12} className="text-indigo-400" />
                    Phân công việc nhà hôm nay
                  </h4>

                  <div className="space-y-1.5 mb-3 max-h-[140px] overflow-y-auto">
                    {chores.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-slate-900/80 p-2 border border-slate-800/30 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={c.done}
                            onChange={() => {
                              setChores(prev => prev.map(ch => ch.id === c.id ? { ...ch, done: !ch.done } : ch));
                            }}
                            className="rounded border-slate-700 bg-slate-850 accent-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <span className={`text-[11px] ${c.done ? 'line-through text-gray-500' : 'text-slate-200'}`}>
                            {c.text}
                          </span>
                        </label>
                        <span className="text-[9px] font-medium bg-slate-800 px-1.5 py-0.5 rounded text-gray-400">
                          👤 {c.owner}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add chore inputs */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Thêm việc..."
                      value={newChore}
                      onChange={(e) => setNewChore(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-600"
                    />
                    <select
                      value={choreOwner}
                      onChange={(e) => setChoreOwner(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded text-xs px-1 text-white"
                    >
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Con trai">C.Trai</option>
                      <option value="Con gái">C.Gái</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!newChore) return;
                        setChores(p => [...p, { id: Date.now(), text: newChore, owner: choreOwner, done: false }]);
                        setNewChore('');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 p-1 rounded text-white flex justify-center items-center"
                    >
                      <LucideIcon name="Plus" size={14} />
                    </button>
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="bg-slate-900/30 border border-slate-800/50 p-3 rounded-xl">
                  <h4 className="text-xs font-bold text-emerald-400 mb-2.5 flex items-center gap-1">
                    <LucideIcon name="Activity" size={12} className="text-emerald-400" />
                    Thống kê chi tiêu mua sắm
                  </h4>
                  <div className="space-y-1 max-h-[100px] overflow-y-auto mb-2.5">
                    {expenses.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center bg-slate-900/40 p-2 rounded text-[11px]">
                        <div>
                          <p className="text-white font-medium">{exp.text}</p>
                          <span className="text-[9px] text-gray-500">{exp.date}</span>
                        </div>
                        <span className="font-bold text-emerald-400">-{exp.amount.toLocaleString()} đ</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Nội dung chi..."
                      value={newExpenseName}
                      onChange={(e) => setNewExpenseName(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Nghìn đ..."
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="w-18 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        if (!newExpenseName || !newExpenseAmount) return;
                        setExpenses(p => [
                          {
                            id: Date.now(),
                            text: newExpenseName,
                            amount: parseInt(newExpenseAmount) * 1000,
                            date: 'Vừa xong'
                          },
                          ...p
                        ]);
                        setNewExpenseName('');
                        setNewExpenseAmount('');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 p-1.5 rounded text-white flex justify-center items-center text-xs font-bold px-2"
                    >
                      Chi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. NHẮC NHỞ UỐNG THUỐC MOCK */}
            {app.id === 'nhac-nho-uong-thuoc' && (
              <div className="flex flex-col gap-4 flex-1">
                <div className="text-center p-3 rounded-2xl bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20">
                  <div className="font-mono text-xl font-bold tracking-widest text-teal-400 animate-pulse">08:00 AM</div>
                  <p className="text-[10px] text-teal-300 mt-1">Giờ nhắc nhở uống thuốc buổi sáng gần nhất!</p>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2.5 px-1">
                    <span className="text-xs font-bold text-gray-300">Lịch uống thuốc hôm nay</span>
                    <span className="text-[10px] text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
                      Tỷ lệ uống: {Math.round((pills.filter(p => p.taken).length / pills.length) * 100)}%
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {pills.map((pill) => (
                      <div
                        key={pill.id}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                          pill.taken
                            ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                            : 'bg-slate-900 border-slate-800 shadow-sm shadow-teal-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${pill.iconColor}`}>
                            <LucideIcon name="Pill" size={16} />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${pill.taken ? 'line-through text-gray-400' : 'text-slate-100'}`}>
                              {pill.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Liều lượng: {pill.dose} ・ Khung giờ: {pill.time}</p>
                          </div>
                        </div>

                        {/* State action */}
                        <button
                          onClick={() => {
                            setPills(prev => prev.map(p => p.id === pill.id ? { ...p, taken: !p.taken } : p));
                          }}
                          className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${
                            pill.taken
                              ? 'bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20'
                              : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {pill.taken ? '✓ Đã uống' : 'Uống thuốc!'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add pill */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <h5 className="text-[11px] font-bold text-teal-400 mb-2">Thêm lịch thuốc mới</h5>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Tên thuốc..."
                        value={newPillName}
                        onChange={(e) => setNewPillName(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Khung giờ (VD: 09:30 PM)"
                        value={newPillTime}
                        onChange={(e) => setNewPillTime(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (!newPillName) return;
                        setPills(p => [
                          ...p,
                          {
                            id: Date.now(),
                            name: newPillName,
                            dose: '1 viên',
                            time: newPillTime,
                            taken: false,
                            iconColor: 'text-indigo-500 bg-indigo-500/10'
                          }
                        ]);
                        setNewPillName('');
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-1.5 rounded transition-all"
                    >
                      Lưu và hẹn giờ báo thức
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. EDUGRADE MOCK */}
            {app.id === 'edugrade' && (
              <div className="flex flex-col gap-3">
                {/* Role Switcher */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setRole('teacher')}
                    className={`flex-1 text-[11px] py-1 rounded font-bold transition-all ${
                      role === 'teacher' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    👤 Góc Giáo Viên chủ nhiệm
                  </button>
                  <button
                    onClick={() => setRole('parent')}
                    className={`flex-1 text-[11px] py-1 rounded font-bold transition-all ${
                      role === 'parent' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🏡 Góc Phụ Huynh học sinh
                  </button>
                </div>

                {role === 'teacher' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-gray-300">Lớp 11A3 (Sĩ số 3 học sinh)</span>
                      <span className="text-[10px] text-indigo-400">Chọn em bốc mẫu để chấm điểm nhanh</span>
                    </div>

                    <div className="space-y-1.5">
                      {students.map(st => (
                        <div
                          key={st.id}
                          onClick={() => {
                            setSelectedStudent(st.id);
                            setGradeMath(st.math.toString());
                            setGradeLit(st.lit.toString());
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all select-none flex justify-between items-center ${
                            selectedStudent === st.id
                              ? 'bg-indigo-600/20 border-indigo-500'
                              : 'bg-slate-900/50 border-slate-800/40 hover:bg-slate-900 hover:border-slate-800'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold">{st.name}</span>
                            <div className="flex gap-2 mt-0.5 text-[9px] text-gray-400">
                              <span>Toán: <strong className="text-indigo-400">{st.math}</strong></span>
                              <span>Văn: <strong className="text-pink-400">{st.lit}</strong></span>
                              <span>Hạnh kiểm: <strong>{st.conduct}</strong></span>
                            </div>
                          </div>
                          <LucideIcon name="ChevronRight" size={12} className="text-gray-500" />
                        </div>
                      ))}
                    </div>

                    {selectedStudent && (
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <p className="text-[11px] text-gray-400 mb-2">
                          Chấm điểm cho: <strong className="text-white">{students.find(s => s.id === selectedStudent)?.name}</strong>
                        </p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Điểm Toán</label>
                            <input
                              type="number"
                              step="0.1"
                              value={gradeMath}
                              onChange={(e) => setGradeMath(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-gray-500 block mb-0.5">Điểm Văn</label>
                            <input
                              type="number"
                              step="0.1"
                              value={gradeLit}
                              onChange={(e) => setGradeLit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setStudents(prev => prev.map(st => st.id === selectedStudent ? { ...st, math: parseFloat(gradeMath) || 0, lit: parseFloat(gradeLit) || 0 } : st));
                            setSelectedStudent(null);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 rounded transition-all"
                        >
                          Cập nhật Sổ Điểm Điện Tử
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col flex-1 gap-2.5">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between">
                      <div>
                        <p className="text-[10px] text-gray-400">Kết quả Học sinh mẫu: <strong className="text-white">Nguyễn Thị Hoa</strong></p>
                        <p className="text-xs font-bold text-emerald-400 mt-1">Học sinh lực xuất sắc (Học kỳ I)</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400">Điểm trung bình</p>
                        <p className="font-bold text-indigo-400 text-sm">9.25</p>
                      </div>
                    </div>

                    {/* Fast Communication */}
                    <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-2.5 flex-1 flex flex-col justify-between h-[210px]">
                      <div className="overflow-y-auto space-y-1.5 text-[10px] mb-2 pr-1 flex-1">
                        {chatMessages.map((m, idx) => (
                          <div key={idx} className={`flex flex-col ${m.sender === 'parent' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[8px] text-gray-500 mb-0.5">{m.sender === 'parent' ? 'Phụ huynh' : 'Cô giáo'}</span>
                            <div className={`p-2 rounded-xl max-w-[85%] ${m.sender === 'parent' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}`}>
                              {m.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Nhập tin nhắn..."
                          value={newMsg}
                          onChange={(e) => setNewMsg(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white"
                        />
                        <button
                          onClick={() => {
                            if (!newMsg) return;
                            setChatMessages(prev => [...prev, { sender: 'parent', text: newMsg }]);
                            setNewMsg('');
                            setTimeout(() => {
                              setChatMessages(prev => [...prev, { sender: 'teacher', text: 'Cô đã nhận tin nhắn. Chiều này tan học bố mẹ đón bé sớm để họp lớp nha chị!' }]);
                            }, 1000);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 p-1.5 rounded text-white flex justify-center items-center"
                        >
                          <LucideIcon name="Send" size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. COSTUMERENTALPRO MOCK */}
            {app.id === 'costume-rental-pro' && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name="Shirt" className="text-pink-400" />
                    <span className="text-xs font-bold">Costume Rental PRO Dashboard</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/10 px-2 py-0.5 rounded">
                    Sản phẩm cho thuê: 14 bộ
                  </span>
                </div>

                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                  <h5 className="text-[11px] font-bold text-gray-300 mb-1.5">Danh mục trang phục có sẵn</h5>
                  <div className="space-y-1.5 max-h-[145px] overflow-y-auto">
                    {rentCatalog.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-slate-950 p-2 border border-slate-900 rounded-lg">
                        <div>
                          <p className="text-[11px] font-semibold text-white">{item.name}</p>
                          <span className="text-[9px] text-pink-400 bg-pink-500/5 border border-pink-500/10 px-1 py-0.2 rounded mt-1 inline-block">
                            {item.type}
                          </span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="font-bold text-rose-400 text-xs">{item.price.toLocaleString()} đ / ngày</span>
                          <button
                            onClick={() => {
                              setRentCart(p => [...p, { name: item.name, price: item.price, days: rentDays }]);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-[9px] font-semibold text-white px-2 py-0.5 rounded"
                          >
                            + Thuê
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart & Billing Section */}
                {rentCart.length > 0 && (
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <div className="flex justify-between mb-1 text-[11px] font-bold text-indigo-400">
                      <span>Đơn hàng đang lên hóa đơn:</span>
                      <button onClick={() => setRentCart([])} className="text-[9px] text-red-400 hover:underline">Xóa</button>
                    </div>
                    <div className="space-y-1 max-h-[70px] overflow-y-auto text-[10px] mb-2 text-slate-300">
                      {rentCart.map((c, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="truncate w-2/3">• {c.name} ({rentDays}n)</span>
                          <span className="text-rose-400 font-medium">{(c.price * rentDays).toLocaleString()} đ</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                      <div>
                        <label className="text-[9px] text-gray-500">Số ngày thuê:</label>
                        <input
                          type="number"
                          value={rentDays}
                          onChange={(e) => setRentDays(parseInt(e.target.value) || 1)}
                          className="w-12 bg-slate-950 border border-slate-800 ml-1 rounded text-center text-xs p-0.5"
                          min="1"
                        />
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-gray-400 block">Tổng thanh toán:</span>
                        <strong className="text-emerald-400 text-xs">
                          {rentCart.reduce((acc, curr) => acc + (curr.price * rentDays), 0).toLocaleString()} đ
                        </strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        triggerSimulatedToast('Đặt cọc thành công ✓', 'Hóa đơn thuê trang phục đã được xử lý và ghim vào lịch sử thanh toán thành công.');
                        setRentCart([]);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1.5 rounded-lg mt-2"
                    >
                      Xác nhận Đặt cọc & In hóa đơn lẻ
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. BÁC SĨ TÂM AN MOCK */}
            {app.id === 'bac-si-tam-an' && (
              <div className="flex flex-col gap-3 flex-1">
                {/* 3D Visual organs panel simulator via CSS tabs */}
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">BẢN ĐỒ GIẢI PHẪU & NAM DƯỢC 3D (GIẢ LẬP)</span>
                  <div className="flex justify-center gap-2">
                    {['Tim', 'Phổi', 'Dạ dày'].map((organ) => (
                      <button
                        key={organ}
                        onClick={() => setActiveOrgan(organ)}
                        className={`text-xs px-2.5 py-1 rounded transition-all font-semibold ${
                          activeOrgan === organ ? 'bg-cyan-500 text-slate-950 shadow-md' : 'bg-slate-950 text-gray-400 hover:text-white'
                        }`}
                      >
                        🫁 {organ}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-950 rounded-lg p-2.5 mt-2.5 text-left border border-slate-850">
                    <p className="text-[11px] text-gray-400"><strong className="text-white">Bộ phận:</strong> {activeOrgan}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5"><strong className="text-white">Chi tiết:</strong> {organData[activeOrgan].desc}</p>
                    <p className="text-[11px] text-cyan-400 mt-1"><strong className="text-white">Cây thuốc lý tưởng:</strong> {organData[activeOrgan].herb}</p>
                    <p className="text-[11px] text-amber-400 mt-0.5"><strong className="text-white font-medium">Bệnh hay mắc:</strong> {organData[activeOrgan].disease}</p>
                  </div>
                </div>

                {/* AI Doctor Chat bot */}
                <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 p-2.5 flex flex-col justify-between h-[180px]">
                  <div className="overflow-y-auto space-y-2 mb-2 pr-1 flex-1">
                    {chatLogs.map((chat, i) => (
                      <div key={i} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] text-gray-500 mb-0.5">
                          {chat.sender === 'user' ? 'Bạn' : 'Bác sĩ AI Tâm An'}
                        </span>
                        <div className={`p-2 rounded-xl text-[10px] leading-relaxed max-w-[90%] ${
                          chat.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-800/80 border border-slate-700/30 text-emerald-300 rounded-tl-none'
                        }`}>
                          {chat.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Suggest Quick Symptoms */}
                  <div className="flex gap-1 flex-wrap mb-1.5">
                    <button 
                      onClick={() => selectSymptomsReply('Tôi bị ho kéo dài và sốt nhẹ')}
                      className="text-[9px] bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-teal-400"
                    >
                      🤒 Bị sốt & ho
                    </button>
                    <button 
                      onClick={() => selectSymptomsReply('Bị trào ngược dạ dày ăn uống khó tiêu')}
                      className="text-[9px] bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-teal-400"
                    >
                      🤮 Đau dạ dày
                    </button>
                    <button 
                      onClick={() => selectSymptomsReply('Công dụng thảo dược từ tinh dầu cây Sả')}
                      className="text-[9px] bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-teal-400"
                    >
                      🌿 Cây thuốc Sả
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Gõ triệu chứng tại đây..."
                      value={healthQuery}
                      onChange={(e) => setHealthQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && healthQuery && selectSymptomsReply(healthQuery)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => healthQuery && selectSymptomsReply(healthQuery)}
                      className="bg-cyan-600 hover:bg-cyan-700 p-1 rounded font-bold text-xs text-white px-2"
                    >
                      Hỏi AI
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SOLO BUSINESS OS MOCK */}
            {app.id === 'solo-business-os' && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-center flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-amber-400">Freelance Sales Pipeline</span>
                  <span className="text-[9px] text-gray-400">Total Pipeline: 35.000.000 đ</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Lead list simulator */}
                  <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                    <h5 className="text-[10px] font-bold text-gray-300 mb-1.5">Thương lượng & Bán hàng</h5>
                    <div className="space-y-1 max-h-[125px] overflow-y-auto text-[9px]">
                      {crmLeads.map(lead => (
                        <div key={lead.id} className="bg-slate-950 p-1.5 border border-slate-900 rounded">
                          <p className="font-semibold text-white truncate">{lead.name}</p>
                          <div className="flex justify-between text-slate-400 mt-0.5">
                            <span>{lead.val}</span>
                            <span className="text-amber-500 font-medium">{lead.stage}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 space-y-1">
                      <input
                        type="text"
                        placeholder="Tên khách..."
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[9px] text-white"
                      />
                      <input
                        type="text"
                        placeholder="Giá trị đ..."
                        value={leadVal}
                        onChange={(e) => setLeadVal(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[9px] text-white"
                      />
                      <button
                        onClick={() => {
                          if (!leadName || !leadVal) return;
                          setCrmLeads(p => [{ id: Date.now(), name: leadName, deal: 'Tư vấn', val: leadVal + ' đ', stage: 'Tiếp cận' }, ...p]);
                          setLeadName('');
                          setLeadVal('');
                        }}
                        className="w-full bg-amber-600 hover:bg-amber-700 p-1 rounded text-white text-[9px] font-bold"
                      >
                        + Khách hàng tiềm lực
                      </button>
                    </div>
                  </div>

                  {/* Factoring/Invoicer */}
                  <div className="bg-slate-900/40 p-2 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <h5 className="text-[10px] font-bold text-gray-300 mb-1">Mẫu Hóa Đơn PDF (Giả Lập)</h5>
                      <div className="bg-slate-950 p-2 rounded border border-slate-900 text-[8px] space-y-1 font-mono">
                        <div className="border-b border-gray-800 pb-1 flex justify-between text-[7px] text-gray-400">
                          <span>KHÁCH: Freelance Client</span>
                          <span>H.ĐƠN: #8420</span>
                        </div>
                        {invoiceItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span className="truncate w-3/4">{item.desc}</span>
                            <span>{item.price.toLocaleString()} đ</span>
                          </div>
                        ))}
                        <div className="border-t border-gray-800 pt-1 flex justify-between font-bold text-emerald-400">
                          <span>SUBTOTAL (VAT 0%):</span>
                          <span>{invoiceItems.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()} đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <div className="p-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] text-center font-bold">
                        OKR Quý: Doanh thu đạt 80% mục tiêu
                      </div>
                      <button
                        onClick={() => {
                          triggerSimulatedToast('Đã gửi hóa đơn ✉', 'Hóa đơn ký số đã được chuyển tự động đến email khách hàng và sao lưu thành công.');
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-bold py-1.5 rounded"
                      >
                        Ký số & Gửi khách hàng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SCHOOLOS MOCK */}
            {app.id === 'school-os' && (
              <div className="flex flex-col gap-3">
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-2.5 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name="School" size={14} className="text-indigo-400" />
                    <span className="text-[11px] font-bold">SchoolOS Cổng Điểm Danh Nhận Diện Khuôn Mặt</span>
                  </div>
                  <span className="text-[9px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded">Camera Active</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Attendance Camera Simulator */}
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between h-[200px]">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-300 mb-1">Thiết bị Quét Quét QR / FaceID</h4>
                      
                      {faceScanActive ? (
                        <div className="bg-slate-950 border border-cyan-500 rounded-lg h-[110px] relative overflow-hidden flex flex-col items-center justify-center">
                          <div className="absolute top-0 w-full h-[2px] bg-cyan-400 shadow shadow-cyan-300 animate-bounce" />
                          <div className="text-center p-2">
                            <LucideIcon name="User" className="text-cyan-400 mx-auto animate-pulse" size={24} />
                            <p className="text-[9px] text-cyan-300 mt-1">Đang đối sánh sinh trắc học...</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950 border border-slate-850 rounded-lg h-[110px] flex flex-col items-center justify-center text-center p-2">
                          <LucideIcon name="Monitor" className="text-gray-600 mb-1" size={22} />
                          <button
                            onClick={() => {
                              setFaceScanActive(true);
                              setScanResult(null);
                              setTimeout(() => {
                                setFaceScanActive(false);
                                setScanResult('ST003');
                                setSchoolStudents(prev => prev.map(st => st.id === 'ST003' ? { ...st, status: 'Đã điểm danh', time: '09:41 AM' } : st));
                              }, 3000);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] px-2 py-1 rounded"
                          >
                            Bật Máy Ảnh Điểm Danh Xe Buýt
                          </button>
                        </div>
                      )}
                    </div>

                    {scanResult && (
                      <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-300 p-1 px-2 rounded text-[9px] leading-tight mt-1.5">
                        ✓ Khớp dữ liệu: <strong>Nguyễn Đăng Chiến (12A1)</strong>. Điểm danh lúc 09:41 thành công!
                      </div>
                    )}
                  </div>

                  {/* Registered Students table mockup */}
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-[9px] flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-300 block mb-1">Sổ kiểm diện lớp học hôm nay</span>
                      <div className="space-y-1 max-h-[140px] overflow-y-auto">
                        {schoolStudents.map(student => (
                          <div key={student.id} className="flex justify-between items-center border-b border-slate-800 pb-1">
                            <div>
                              <p className="font-semibold text-white">{student.name}</p>
                              <span className="text-gray-500 text-[8px]">{student.id} | {student.class}</span>
                            </div>
                            <div className="text-right">
                              <span className={`px-1 rounded-full text-[8px] ${student.status === 'Đã điểm danh' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {student.status}
                              </span>
                              <p className="text-[7px] text-gray-500">{student.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSchoolStudents(st => st.map(s => ({ ...s, status: 'Vắng mặt', time: '-' })));
                        setScanResult(null);
                      }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-1 rounded text-center text-[8px]"
                    >
                      Reset điểm danh
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 8. NV ENGLISH MOCK */}
            {app.id === 'nv-english' && (
              <div className="flex flex-col gap-3 flex-1 justify-between">
                <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name="Languages" className="text-indigo-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold block leading-tight text-white">NV ENGLISH - Ôn thi lớp 10 THPT</span>
                      <span className="text-[9px] text-gray-400">Khóa học Ngữ pháp chuyên đề mục tiêu 9+</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                      Cực siêu: {scoreCount} / {quizQuestions.length} câu đúng
                    </span>
                  </div>
                </div>

                {/* Live Quiz frame */}
                {!quizFinished ? (
                  <div className="bg-slate-905 p-3 rounded-xl border border-slate-800 flex-1 flex flex-col justify-between min-h-[170px]">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                        Câu hỏi {currentQuizIdx + 1} / {quizQuestions.length}
                      </span>
                      <p className="text-xs font-semibold text-white leading-normal">
                        {quizQuestions[currentQuizIdx].q}
                      </p>

                      {/* Options */}
                      <div className="space-y-1.5 mt-3">
                        {quizQuestions[currentQuizIdx].opts.map((opt, oIdx) => {
                          const isSelected = quizAnswer === oIdx;
                          const isCorrect = oIdx === quizQuestions[currentQuizIdx].ansIdx;
                          const hasAnswered = quizAnswer !== null;

                          let btnStyle = 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800';
                          if (hasAnswered) {
                            if (isCorrect) btnStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-500 font-semibold';
                            else if (isSelected) btnStyle = 'bg-rose-950/60 text-rose-400 border-rose-500';
                            else btnStyle = 'bg-slate-900 text-gray-500 border-slate-800 opacity-50';
                          } else if (isSelected) {
                            btnStyle = 'bg-indigo-600 text-white border-indigo-500';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={hasAnswered}
                              onClick={() => {
                                setQuizAnswer(oIdx);
                                if (oIdx === quizQuestions[currentQuizIdx].ansIdx) {
                                  setScoreCount(c => c + 1);
                                }
                              }}
                              className={`w-full text-left p-2 rounded-lg border text-xs text-slate-100 transition-all ${btnStyle}`}
                            >
                              <span className="font-bold mr-1.5 font-mono">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation if answered */}
                    {quizAnswer !== null && (
                      <div className="mt-3 p-2 rounded-lg bg-indigo-950/15 border border-indigo-900/30 text-[10px] text-indigo-300">
                        <strong className="text-white block mb-0.5">💡 Giải thích chi tiết:</strong>
                        {quizQuestions[currentQuizIdx].explain}
                      </div>
                    )}

                    {/* Next Quiz logic */}
                    {quizAnswer !== null && (
                      <button
                        onClick={() => {
                          if (currentQuizIdx < quizQuestions.length - 1) {
                            setCurrentQuizIdx(i => i + 1);
                            setQuizAnswer(null);
                          } else {
                            setQuizFinished(true);
                          }
                        }}
                        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      >
                        {currentQuizIdx < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài thi thử'}
                        <LucideIcon name="ChevronRight" size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl text-center shadow-lg flex-1 flex flex-col justify-center items-center">
                    <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-full mb-3 border border-indigo-500/10">
                      <LucideIcon name="GraduationCap" size={32} />
                    </div>
                    <h4 className="text-sm font-bold text-white">BẠN ĐÃ HOÀN THÀNH BÀI THI</h4>
                    <p className="text-xs text-gray-400 mt-1">Kết quả luyện tập của bạn rất hứa hẹn:</p>
                    <p className="text-xl font-extrabold text-emerald-400 mt-3">{Math.round((scoreCount / quizQuestions.length) * 100)} % Điểm Sổ</p>
                    <p className="text-[10px] text-gray-500 mt-1">Làm đúng {scoreCount} trên tổng số {quizQuestions.length} câu trắc nghiệm.</p>

                    <button
                      onClick={() => {
                        setCurrentQuizIdx(0);
                        setQuizAnswer(null);
                        setScoreCount(0);
                        setQuizFinished(false);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-lg mt-4"
                    >
                      Luyện lại đề thi khác
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 9. QUẢN LÝ CÔNG VIỆC MOCK */}
            {app.id === 'quan-ly-cong-viec' && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <LucideIcon name="ClipboardCheck" className="text-emerald-400" />
                    <span className="text-xs font-bold">Hệ Thống Phân Công & Chỉ Số OKRs</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">
                    Bong Trực Tuyến
                  </span>
                </div>

                {/* Simple Kanban grid mockup */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {/* Column 1: Progress */}
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-indigo-400 mb-1.5 flex justify-between bg-indigo-950/20 p-1 rounded">
                      <span>🔄 Đang xử lý</span>
                      <span>{kanbanTasks.filter(t => t.col === 'Progress').length}</span>
                    </h5>
                    <div className="space-y-1.5 max-h-[145px] overflow-y-auto">
                      {kanbanTasks.filter(t => t.col === 'Progress').map(task => (
                        <div key={task.id} className="bg-slate-950 p-2 rounded border border-slate-900 relative">
                          <p className="text-gray-200 text-[10px] font-medium leading-tight">{task.title}</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[8px] bg-red-500/10 text-red-400 px-1 py-0.2 rounded font-mono">
                              {task.priority}
                            </span>
                            <button
                              onClick={() => {
                                setKanbanTasks(prev => prev.map(t => t.id === task.id ? { ...t, col: 'Review' } : t));
                              }}
                              className="text-[8px] bg-indigo-600 hover:bg-slate-800 text-white hover:text-indigo-400 px-1 py-0.5 rounded border border-indigo-500/20"
                            >
                              Gửi duyệt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Review */}
                  <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                    <h5 className="font-bold text-amber-400 mb-1.5 flex justify-between bg-amber-950/20 p-1 rounded">
                      <span>🔍 Chờ duyệt</span>
                      <span>{kanbanTasks.filter(t => t.col === 'Review').length}</span>
                    </h5>
                    <div className="space-y-1.5 max-h-[145px] overflow-y-auto">
                      {kanbanTasks.filter(t => t.col === 'Review').map(task => (
                        <div key={task.id} className="bg-slate-950 p-2 rounded border border-slate-900">
                          <p className="text-gray-200 text-[10px] font-medium leading-tight">{task.title}</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[8px] bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded">
                              {task.priority}
                            </span>
                            <button
                              onClick={() => {
                                setKanbanTasks(prev => prev.map(t => t.id === task.id ? { ...t, col: 'Done' } : t));
                              }}
                              className="text-[8px] bg-emerald-600 hover:bg-slate-800 text-white hover:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20"
                            >
                              Duyệt ✓
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add new task Form */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <h5 className="text-[11px] font-bold text-indigo-400 mb-1.5">Phân tác vụ khẩn cấp cho nhân sự</h5>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Tiêu đề đầu việc..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        if (!newTaskTitle) return;
                        setKanbanTasks(p => [
                          ...p,
                          {
                            id: Date.now(),
                            title: newTaskTitle,
                            col: 'Progress',
                            priority: 'Trung bình'
                          }
                        ]);
                        setNewTaskTitle('');
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 rounded"
                    >
                      Giao tác vụ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 10. NV CONNECT MOCK */}
            {app.id === 'nv-connect' && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name="Printer" className="text-cyan-400" />
                    <div>
                      <span className="text-xs font-bold text-white block">NV Connect: 3D Filament Calculator</span>
                      <span className="text-[9px] text-gray-500">Mô phỏng chợ in 3D MakerWorld Việt Nam</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Estimator Form */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[10px]">
                    <span className="font-bold text-gray-300 block mb-2">Tính chi phí cuộn nhựa in</span>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-0.5">Loại nhựa in:</label>
                        <select
                          value={filamentType}
                          onChange={(e) => setFilamentType(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1 text-[10px]"
                        >
                          <option value="PLA">PLA (Thân thiện, dễ in - 350K/Kg)</option>
                          <option value="PETG">PETG (Bền hóa chất, dẻo - 425K/Kg)</option>
                          <option value="ABS">ABS (Chịu lực, chịu nhiệt - 500K/Kg)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-gray-500 block mb-0.5">Trọng lượng vật in (Grams):</label>
                        <input
                          type="number"
                          value={filamentWeight}
                          onChange={(e) => setFilamentWeight(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded p-1 text-[10px]"
                        />
                      </div>

                      <div className="border-t border-slate-800 pt-2 text-[10px] text-gray-300">
                        <p>Giá nhựa ước tính: <strong className="text-cyan-400">
                          {Math.round(parseInt(filamentWeight) * (filamentType === 'PLA' ? 350 : filamentType === 'PETG' ? 425 : 500)).toLocaleString()} đ
                        </strong></p>
                        <p className="text-[9px] text-gray-500 mt-1">Đã cộng thêm hao hụt rác thải hỗ trợ (Support structures) 5%.</p>
                      </div>
                    </div>
                  </div>

                  {/* STL Listing */}
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-850 text-[10px] flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-300 block mb-1">Mô hình hot đăng bởi cộng đồng</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        {models.map(m => (
                          <div key={m.id} className="bg-slate-955 p-1.5 rounded border border-slate-900/50">
                            <p className="font-semibold text-white truncate text-[9px]">{m.name}</p>
                            <div className="flex justify-between items-center text-[8px] text-gray-400 mt-1">
                              <span>📥 {m.downloads} tải</span>
                              <button
                                onClick={() => {
                                  setModels(prev => prev.map(it => it.id === m.id ? { ...it, downloads: it.downloads + 1 } : it));
                                  triggerSimulatedToast('Khởi động download 📥', 'Tệp đa khớp (.STL) đã được gửi sang hàng chờ in 3D của máy in Bambu Lab thành công!');
                                }}
                                className="bg-indigo-600 hover:bg-slate-800 text-white font-medium px-1.5 py-0.2 rounded cursor-pointer"
                              >
                                Tải (.STL)
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 11. HR - OKR MOCK */}
            {app.id === 'hr-okr-suite' && (
              <div className="flex flex-col gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <LucideIcon name="UserCheck" className="text-cyan-400 animate-pulse" />
                    <div>
                      <span className="text-xs font-bold block leading-none text-white">HR - OKR Performance Suite</span>
                      <span className="text-[9px] text-gray-500">Mạng lưới quản trị mục tiêu chéo rực rỡ</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-gray-300 block mb-2">Cascading Company OKRs Tiến trình</span>
                  <div className="space-y-2">
                    {okrs.map(okr => (
                      <div key={okr.id} className="text-[10px]">
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span className="truncate w-3/4">• {okr.goal}</span>
                          <strong className="text-emerald-400 font-mono">{okr.progress}%</strong>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${okr.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit quarterly feedback 360 */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[10px]">
                  <span className="font-bold text-indigo-400 block mb-2">Đánh Giá Năng Lực 360 Độ Định Kỳ (Quý II/2026)</span>
                  
                  {!hrFeedbackSubmitted ? (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Tự đánh giá năng suất (Sổ OKRs):</span>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={selfScore}
                          onChange={(e) => setSelfScore(parseInt(e.target.value))}
                          className="w-24 accent-indigo-600 bg-slate-950 h-1"
                        />
                        <span className="font-bold text-cyan-400 font-mono">{selfScore}đ</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Đồng nghiệp chấm chéo (Minh Nam):</span>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={colleagueScore}
                          onChange={(e) => setColleagueScore(parseInt(e.target.value))}
                          className="w-24 accent-cyan-600 bg-slate-950 h-1"
                        />
                        <span className="font-bold text-cyan-400 font-mono">{colleagueScore}đ</span>
                      </div>

                      <button
                        onClick={() => {
                          setHrFeedbackSubmitted(true);
                          setOkrs(prev => prev.map(okr => okr.id === 1 ? { ...okr, progress: 85 } : okr));
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1 rounded transition-all mt-1"
                      >
                        Nộp bảng điểm đánh giá chéo 360
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 p-2.5 rounded text-center text-emerald-400 font-semibold">
                      ✓ Đã nộp thành công! Điểm số đồng bộ tức thì lên hồ sơ KPI của Phòng Nhân sự.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 12. DYNAMIC FALLBACK FOR CUSTOM APPS */}
            {!isPreLoadedApp && (
              <div className="flex flex-col gap-3 flex-1 justify-between">
                
                {/* Header overview */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 p-3 rounded-xl border border-indigo-500/20 shadow-md flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-505/10 text-indigo-400 rounded-lg">
                      <LucideIcon name={app.icon || 'Sparkles'} size={15} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block truncate max-w-[200px]">{app.name} Sandbox</span>
                      <span className="text-[9px] text-indigo-300">Trình giả lập động cho ứng dụng tuỳ biến</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                    v{app.currentVersion || '1.0.0'}
                  </span>
                </div>

                {/* Database Sandbox */}
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-300 block mb-2 flex items-center gap-1.5">
                    <LucideIcon name="FileText" size={12} className="text-indigo-400" />
                    BẢNG DỮ LIỆU THỬ NGHIỆM (SANDBOX DATABASE)
                  </span>

                  <div className="space-y-1.5 max-h-[110px] overflow-y-auto mb-2.5">
                    {customDatabaseRows.map(row => (
                      <div key={row.id} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-905">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={row.status === 'Đã hoàn tất'}
                            onChange={() => {
                              setCustomDatabaseRows(p => p.map(r => r.id === row.id ? { ...r, status: r.status === 'Đã hoàn tất' ? 'Hoạt động' : 'Đã hoàn tất' } : r));
                            }}
                            className="rounded border-slate-800 bg-slate-950 text-indigo-650 cursor-pointer"
                          />
                          <span className={`text-[10px] ${row.status === 'Đã hoàn tất' ? 'line-through text-gray-500' : 'text-slate-200'}`}>
                            {row.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] px-1.5 py-0.2 rounded-full ${
                            row.status === 'Đã hoàn tất' 
                              ? 'bg-emerald-500/10 text-emerald-400' 
                              : row.status === 'Bình thường' || row.status === 'Hoạt động'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {row.status}
                          </span>
                          <button
                            onClick={() => {
                              setCustomDatabaseRows(p => p.filter(r => r.id !== row.id));
                            }}
                            className="text-gray-500 hover:text-red-400 p-0.5 cursor-pointer"
                          >
                            <LucideIcon name="X" size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {customDatabaseRows.length === 0 && (
                      <p className="text-[9px] text-gray-500 text-center py-2 italic">Chưa có bản ghi dữ liệu nào. Hãy thêm ở dưới!</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập tên bản ghi dữ liệu thử..."
                      value={newDbRowName}
                      onChange={(e) => setNewDbRowName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newDbRowName) {
                          setCustomDatabaseRows(p => [...p, { id: Date.now(), name: newDbRowName, status: 'Hoạt động' }]);
                          setNewDbRowName('');
                        }
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => {
                        if (!newDbRowName) return;
                        setCustomDatabaseRows(p => [...p, { id: Date.now(), name: newDbRowName, status: 'Hoạt động' }]);
                        setNewDbRowName('');
                      }}
                      className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 rounded-lg border border-indigo-550/20 active:scale-95 transition-all cursor-pointer"
                    >
                      + Row
                    </button>
                  </div>
                </div>

                {/* AI PM Assistant Chatbot */}
                <div className="flex-1 bg-slate-900 border border-slate-850 rounded-xl p-2.5 flex flex-col justify-between h-[165px]">
                  <div className="overflow-y-auto space-y-1.5 mb-2 pr-1 flex-1">
                    {customChatLogs.map((chat, i) => (
                      <div key={i} className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] text-gray-500 mb-0.5">
                          {chat.sender === 'user' ? 'Bạn' : `Trợ lý AI của ${app.name}`}
                        </span>
                        <div className={`p-2 rounded-xl text-[10px] leading-relaxed max-w-[90%] whitespace-pre-wrap ${
                          chat.sender === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}>
                          {chat.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-1 flex-wrap mb-1.5 select-none">
                    <button 
                      onClick={() => handleCustomQuerySubmit('Gợi ý ý tưởng tính năng thông minh mới?')}
                      className="text-[8px] bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-indigo-400 font-medium cursor-pointer"
                    >
                      💡 Đề xuất tính năng
                    </button>
                    <button 
                      onClick={() => handleCustomQuerySubmit('Yêu cầu stack công nghệ này cần chú ý gì?')}
                      className="text-[8px] bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-indigo-400 font-medium cursor-pointer"
                    >
                      ⚙️ Stack kỹ thuật
                    </button>
                    <button 
                      onClick={() => handleCustomQuerySubmit('Làm sao để deploy lên Cloud?')}
                      className="text-[8px] bg-slate-950 hover:bg-slate-850 px-2 py-0.5 rounded border border-slate-800 text-indigo-400 font-medium cursor-pointer"
                    >
                      ☁️ Cách Deploy
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Hỏi AI về kỹ thuật hoặc sản phẩm..."
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomQuerySubmit(customQuery)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleCustomQuerySubmit(customQuery)}
                      className="bg-indigo-650 hover:bg-indigo-700 p-1.5 rounded-lg font-bold text-[10px] text-white px-2.5 active:scale-95 transition-all cursor-pointer"
                    >
                      Hỏi
                    </button>
                  </div>
                </div>

              </div>
            )}
          </>
        )}

          </div>

          {/* Device Home Bar simulated only under Mobile */}
          {viewport === 'Mobile' && (
            <div className="bg-slate-900 py-2 flex justify-center items-center border-t border-slate-950">
              <div className="w-24 h-1 bg-slate-700 rounded-full cursor-pointer hover:bg-indigo-500 transition-all" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
