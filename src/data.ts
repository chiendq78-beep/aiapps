import { AppIdea, CommunitySuggestion, BugReport, SystemNotification } from './types';

export const INITIAL_APPS: AppIdea[] = [
  {
    id: 'gia-dinh-gian-don',
    name: 'Gia Đình Giản Đơn',
    description: 'Ứng dụng quản lý gia đình toàn diện giúp kết nối các thành viên. Đồng bộ lịch trình, quản lý chi tiêu tài chính chung, phân công việc nhà thông minh và theo dõi chỉ số sức khỏe của mọi người trong gia đình.',
    icon: 'Home',
    platforms: ['Web', 'Mobile', 'Tablet'],
    status: 'Đang phát triển',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js Express', 'SQLite'],
    currentVersion: '1.2.0',
    voters: ['chiendq78@gmail.com', 'user1@example.com', 'user2@example.com'],
    rating: 4.8,
    ratingCount: 32,
    sourceCodeUrl: 'https://github.com/chiendq78/gia-dinh-gian-don-code',
    changelogs: [
      {
        version: '1.2.0',
        date: '2026-05-18',
        title: 'Cải tiến phân công việc nhà & Quản lý Tài chính',
        changes: [
          'Thống kê chi tiêu bằng biểu đồ tròn trực quan',
          'Tự động phân công việc nhà xoay vòng giữa các thành viên',
          'Bổ sung lịch nhắc nhở tiêm chủng cho trẻ nhỏ',
          'Sửa lỗi đồng bộ lịch gia đình thời gian thực'
        ],
        type: 'minor'
      },
      {
        version: '1.0.0',
        date: '2026-04-10',
        title: 'Phát hành chính thức bản đầu tiên',
        changes: [
          'Hệ thống quản lý tài chính cơ bản',
          'Danh sách việc nhà cần làm',
          'Lịch chung gia đình đồng bộ tự động'
        ],
        type: 'major'
      }
    ]
  },
  {
    id: 'nhac-nho-uong-thuoc',
    name: 'Nhắc Nhở Uống Thuốc',
    description: 'Mẫu ứng dụng di động bảo vệ sức khỏe chuyên biệt cho bệnh nhân và người cao tuổi. Thiết lập lịch trình uống thuốc, gửi cảnh báo báo thức thông minh đúng hẹn, đúng liều lượng kèm theo dõi nhật ký sức khỏe hàng ngày.',
    icon: 'Pill',
    platforms: ['Mobile'],
    status: 'Đã phát hành (Beta)',
    techStack: ['React Native', 'Kotlin', 'Expo', 'SQLite', 'Local Notifications'],
    currentVersion: '2.0.4',
    voters: ['user5@example.com', 'user6@example.com', 'user7@example.com', 'user8@example.com'],
    rating: 4.5,
    ratingCount: 54,
    changelogs: [
      {
        version: '2.0.4',
        date: '2026-05-21',
        title: 'Tối ưu hóa báo thức đẩy trên Android 14',
        changes: [
          'Khắc phục lỗi trễ chuông báo thức ở chế độ pin chờ Doze Mode',
          'Cho phép đính kèm hình ảnh viên thuốc để dễ phân biệt',
          'Bổ sung âm lượng tăng dần để tránh làm giật mình người già'
        ],
        type: 'patch'
      },
      {
        version: '2.0.0',
        date: '2026-03-15',
        title: 'Cập nhật lớn giao diện và chia sẻ bác sĩ',
        changes: [
          'Giao diện phẳng với thiết kế các nút bấm cực to thích hợp cho mắt lão của người già',
          'Bổ sung tính năng tự động xuất báo cáo lịch sử uống thuốc thành file PDF để gửi trực tiếp cho bác sĩ điều trị'
        ],
        type: 'major'
      }
    ]
  },
  {
    id: 'edugrade',
    name: 'EduGrade - Quản lý Học sinh',
    description: 'Hệ thống quản lý điểm số và rèn luyện học sinh đa phân quyền tinh tế. Kết nối liền mạch giữa Giáo viên, Phụ huynh và Ban giám hiệu. Tích hợp sổ liên lạc điện tử, chat nội bộ, thông báo khẩn cấp và biểu đồ theo dõi hiệu năng học tập của từng học sinh.',
    icon: 'GraduationCap',
    platforms: ['Web', 'Tablet'],
    status: 'Đã phát hành',
    techStack: ['React', 'TypeScript', 'Tailwind', 'PostgreSQL', 'Firebase Push'],
    currentVersion: '3.1.0',
    voters: ['chiendq78@gmail.com', 'teacherA@gmail.com', 'parentB@gmail.com'],
    rating: 4.7,
    ratingCount: 89,
    sourceCodeUrl: 'https://github.com/chiendq78/edugrade-management-system',
    changelogs: [
      {
        version: '3.1.0',
        date: '2026-05-10',
        title: 'Phát hành mô-đun Nhận xét AI và Chat nhóm',
        changes: [
          'Gợi ý viết nhận xét học sinh tự động bằng AI từ dữ liệu điểm số',
          'Tích hợp chat thời gian thực giữa Giáo viên chủ nhiệm và toàn bộ Phụ huynh lớp',
          'Nâng cấp giao diện xem bảng điểm trên điện thoại và máy tính bảng'
        ],
        type: 'minor'
      },
      {
        version: '3.0.0',
        date: '2025-12-20',
        title: 'Kiến trúc mới đa phân quyền hoàn chỉnh',
        changes: [
          'Tách biệt hoàn toàn cổng thông tin Giáo viên, Phụ huynh và Ban giám hiệu',
          'Hệ thống bảo mật dữ liệu điểm số bằng mã hóa SSL/TLS 256-bit'
        ],
        type: 'major'
      }
    ]
  },
  {
    id: 'costume-rental-pro',
    name: 'CostumeRentalPro',
    description: 'Hệ thống quản lý chuyên nghiệp toàn diện cho dịch vụ cho thuê trang phục, cosplay và đạo cụ sân khấu. Quản lý kho thời gian thực, quét mã vạch kiểm kê, quản lý đơn hàng đặt cọc, hóa đơn tự động và gửi cảnh báo nhắc nhở khách hàng trả đồ trễ hạn.',
    icon: 'Shirt',
    platforms: ['Web'],
    status: 'Đã phát hành',
    techStack: ['Next.js', 'Prisma', 'Tailwind CSS', 'PostgreSQL', 'Cloudinary API'],
    currentVersion: '2.1.0',
    voters: ['renterX@gmail.com', 'cosplayY@gmail.com'],
    rating: 4.9,
    ratingCount: 19,
    changelogs: [
      {
        version: '2.1.0',
        date: '2026-05-14',
        title: 'Quét mã vạch tự động & Quản lý tiền cọc',
        changes: [
          'Hỗ trợ kết nối máy quét mã vạch và Camera điện thoại để quét kiểm đồ thần tốc',
          'Theo dõi lịch sử hoàn tiền cọc tự động qua cổng chuyển khoản ngân hàng',
          'Lọc nhanh tình trạng trang phục: Đang giặt, Đang thuê, Trả muộn, Sẵn sàng'
        ],
        type: 'minor'
      }
    ]
  },
  {
    id: 'bac-si-tam-an',
    name: 'Bác sĩ Tâm An - Bác sĩ AI Chăm Sóc Sức Khỏe',
    description: 'Trợ lý y tế ảo thông minh đồng hành cùng mọi gia đình. Tích hợp AI hội thoại tư vấn ban đầu, bản đồ giải phẫu học cơ thể người 3D trực quan sinh động, thư viện bách khoa từ điển bệnh lý và kho kiến thức ứng dụng cây thuốc nam y học cổ truyền Việt Nam.',
    icon: 'HeartPulse',
    platforms: ['Web', 'Mobile', 'Tablet'],
    status: 'Sắp ra mắt (Alpha)',
    techStack: ['React', 'Google Gemini API', 'Three.js (3D rendering)', 'FastAPI', 'MongoDB'],
    currentVersion: '0.8.0',
    voters: ['chiendq78@gmail.com', 'doctor1@hospital.vn'],
    rating: 4.6,
    ratingCount: 12,
    changelogs: [
      {
        version: '0.8.0',
        date: '2026-05-14',
        title: 'Hoàn thiện thư viện 3D Giải Phẫu và Chat bot thảo dược',
        changes: [
          'Mô hình xương khớp và tuần hoàn 3D có khả năng xoay thu phóng trực tiếp',
          'AI nhận dạng lá cây thuốc nam qua hình ảnh tải lên',
          'Thử nghiệm hệ thống đề xuất bài thuốc dân gian cho các bệnh cảm cúm thông thường'
        ],
        type: 'patch'
      }
    ]
  },
  {
    id: 'solo-business-os',
    name: 'Solo Business OS',
    description: 'Nền tảng Quản trị Tinh gọn tối ưu dành riêng cho Doanh nghiệp một người (Solopreneurs) và người làm tự do (Freelancers). Đồng bộ hóa OKR cá nhân, CRM quản lý liên hệ khách hàng bám sát phễu, hóa đơn tài chính, theo dõi hàng tồn kho và nhà cung cấp trong một bảng điều khiển duy nhất.',
    icon: 'Briefcase',
    platforms: ['Web', 'Tablet'],
    status: 'Đã phát hành',
    techStack: ['Vite React', 'Tailwind', 'Supabase Client', 'Recharts (analytics)'],
    currentVersion: '1.5.2',
    voters: ['freelancerB@os.com', 'solopreneurA@gmail.com', 'chiendq78@gmail.com'],
    rating: 4.8,
    ratingCount: 45,
    changelogs: [
      {
        version: '1.5.2',
        date: '2026-05-14',
        title: 'Tối ưu hóa bảng tuần báo cáo doanh thu & KPIs',
        changes: [
          'Tự động đồng bộ hóa KPI từ nhiệm vụ hoàn thành lên mục tiêu quý OKRs',
          'Biểu đồ rùa dòng tiền và dự phóng thuế thu nhập cá nhân',
          'Xuất nhanh báo cáo tài chính rút gọn cho kế toán dịch vụ'
        ],
        type: 'patch'
      }
    ]
  },
  {
    id: 'school-os',
    name: 'SchoolOS - Hệ thống quản lý trường học',
    description: 'Một hệ điều hành cực đại hỗ trợ quản lý trơn tru mọi hoạt động của trường học: Tuyển sinh, cổng quản lý học sinh và giáo viên, sổ điểm số, điểm danh tự động bằng khuôn mặt, tính học phí tự động kèm cổng thanh toán tích hợp và tạo thời khóa biểu tự động thông minh tránh xung đột lịch.',
    icon: 'School',
    platforms: ['Web', 'Tablet'],
    status: 'Đang cải tiến',
    techStack: ['React', 'Tailwind CSS', 'Express.js backend', 'PostgreSQL', 'Redis'],
    currentVersion: '1.0.1',
    voters: ['headmaster@school.edu.vn'],
    rating: 4.3,
    ratingCount: 15,
    changelogs: [
      {
        version: '1.0.1',
        date: '2026-05-13',
        title: 'Tối ưu xếp lịch học thông minh chống trùng giờ',
        changes: [
          'Nâng cấp thuật toán tự tạo thời khóa biểu tự động bảo đảm công bằng số buổi cho giáo viên',
          'Sửa lỗi xung đột khi hai lớp đăng ký phòng thí nghiệm cùng giờ',
          'Thử nghiệm điểm danh qua QR Code động trên màn hình'
        ],
        type: 'patch'
      }
    ]
  },
  {
    id: 'nv-english',
    name: 'NV ENGLISH',
    description: 'Ứng dụng luyện thi trắc nghiệm Tiếng Anh siêu việt dành riêng cho học sinh lớp 9 ôn tập nước rút chuẩn bị bước vào cuộc thi lớp 10 THPT. Hệ thống chia nhỏ chuyên đề Ngữ pháp, kho Từ vựng bám sát sách giáo khoa cấu trúc đề thi, làm bài đọc hiểu có gạch chân phân tích từ vựng kèm lời giải thích chi tiết tuyệt đỉnh.',
    icon: 'Languages',
    platforms: ['Mobile', 'Tablet'],
    status: 'Đã phát hành',
    techStack: ['Swift', 'Kotlin', 'SQLite local DB', 'Firebase Authentication'],
    currentVersion: '4.2.0',
    voters: ['student9a@gmail.com', 'chiendq78@gmail.com', 'english_expert@thpt.edu.vn'],
    rating: 4.9,
    ratingCount: 120,
    changelogs: [
      {
        version: '4.2.0',
        date: '2026-05-09',
        title: 'Bổ sung 15 đề thi thử khóa 2026 bám sát đề Sở Giáo Dục',
        changes: [
          'Cập nhật cấu trúc đề tuyển sinh lớp 10 mới nhất với tỷ lệ câu hỏi phân hóa cao',
          'Tính năng từ điển tra nhanh bằng cách ấn giữ thẳng vào từ trong bài đọc',
          'Thống kê thông minh chỉ ra 3 lỗi ngữ pháp thường xuyên sai nhất của học sinh để khắc phục'
        ],
        type: 'minor'
      }
    ]
  },
  {
    id: 'quan-ly-cong-viec',
    name: 'QUẢN LÝ CÔNG VIỆC',
    description: 'Bảng điều khiển quản lý và điều phối luồng công việc cấp độ doanh nghiệp. Cung cấp tầm nhìn chiến lược cho nhà quản lý kiêm công cụ tập trung đắc lực cho nhân viên: Theo dõi tiến độ dự án qua Gantt Chart và Kanban board, đo lường KPI đóng góp tự động, tạo báo cáo nhanh tuần phục vụ giao ban.',
    icon: 'ClipboardCheck',
    platforms: ['Web', 'Mobile', 'Tablet'],
    status: 'Đang phát triển',
    techStack: ['Vite React', 'Tailwind', 'NestJS', 'PostgreSQL', 'Socket.io real-time'],
    currentVersion: '0.9.1',
    voters: ['chiendq78@gmail.com', 'pm_lead@company.com'],
    rating: 4.5,
    ratingCount: 23,
    changelogs: [
      {
        version: '0.9.1',
        date: '2026-05-09',
        title: 'Nâng cấp Kanban và phân tích biểu đồ Burn-down',
        changes: [
          'Thêm hiệu ứng kéo thả mượt mà trên Kanban Grid',
          'Tự động ước lượng ngày hoàn tất dự án dựa trên năng suất lịch sử (Velocity)',
          'Tích hợp kết nối thông báo trực tiếp qua Telegram/Slack Bot'
        ],
        type: 'minor'
      }
    ]
  },
  {
    id: 'nv-connect',
    name: 'NV Connect',
    description: 'Nền tảng mạng xã hội và thị trường mô hình 3D (3D Printing Model Hub) tiên phong lấy cảm hứng từ MakerWorld. Cho phép các nhà thiết kế đăng tải và kinh doanh bản vẽ thiết kế 3D (.STL, .3MF), cho phép người sáng tạo bình luận đánh giá, đặt in trực tiếp, chia sẻ thông số cấu hình nhựa in và nhiệt độ tối ưu.',
    icon: 'Printer',
    platforms: ['Web', 'Mobile'],
    status: 'Sắp ra mắt',
    techStack: ['React Three Fiber', 'Next.js', 'Tailwind', 'Supabase Storage', 'ThreeJS'],
    currentVersion: '0.2.0',
    voters: ['maker_viet@gmail.com', '3d_print_fanatic@engineer.com'],
    rating: 4.7,
    ratingCount: 14,
    changelogs: [
      {
        version: '0.2.0',
        date: '2026-05-09',
        title: 'Tải tệp tin 3MF siêu tốc & Trình xem mô hình trực quan',
        changes: [
          'Tăng tốc độ kết xuất mô hình 3D trên môi trường WebGL',
          'Hệ thống tự động trích xuất ảnh xem trước từ file .stl siêu chuẩn xác',
          'Quản lý bảng tính thông số nhựa PLA, PETG, ABS cho từng dòng máy in Bambu Lab, Creality'
        ],
        type: 'minor'
      }
    ]
  },
  {
    id: 'hr-okr-suite',
    name: 'HR - OKR & Performance Suite',
    description: 'Nền tảng quản lý nguồn nhân lực thế hệ mới lấy khoa học OKRs làm trọng tâm điều hành. Liên kết tuần tự mục tiêu cá nhân với chiến lược công ty. Hỗ trợ quy trình đánh giá chéo 360 độ công tâm khách quan, xây dựng lộ trình nâng cao năng lực cá nhân hóa cho từng nhóm nhân viên.',
    icon: 'UserCheck',
    platforms: ['Web'],
    status: 'Đang cải tiến',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Django Backend', 'MySQL'],
    currentVersion: '1.1.0',
    voters: ['hr_director@startup.vn', 'chiendq78@gmail.com'],
    rating: 4.6,
    ratingCount: 22,
    changelogs: [
      {
        version: '1.1.0',
        date: '2026-05-07',
        title: 'Hoàn thiện đánh giá năng suất 360 độ và Thư viện năng lực cốt lõi',
        changes: [
          'Thêm quy trình đánh giá 360 độ gồm Tự đánh giá, Đồng nghiệp đánh giá và Quản lý đánh giá',
          'Biểu đồ mạng nhện thể hiện điểm số các nhóm kỹ năng',
          'Bổ sung ngân hàng câu hỏi đánh giá mẫu đa lĩnh vực kỹ thuật, kinh doanh, HR'
        ],
        type: 'minor'
      }
    ]
  }
];

export const INITIAL_SUGGESTIONS: CommunitySuggestion[] = [
  {
    id: 'id-sug-1',
    title: 'Hồ sơ sức khỏe dùng chung giữa Gia Đình Giản Đơn và Bác sĩ Tâm An',
    description: 'Nên cho phép liên kết dữ liệu sức khỏe (như chỉ số chiều cao, cân nặng, nhịp tim hoặc triệu chứng) từ Gia Đình Giản Đơn sang cho Bác sĩ AI của Bác sĩ Tâm An để nhận tư vấn chính xác hơn mà không cần nhập lại từ đầu.',
    suggestedBy: 'chien_viet@co-dev.vn',
    createdAt: '2026-05-21T02:10:00Z',
    votes: 24,
    votedEmails: ['chiendq78@gmail.com'],
    category: 'Improvement',
    targetAppId: 'gia-dinh-gian-don'
  },
  {
    id: 'id-sug-2',
    title: 'Game hóa kỹ năng học từ vựng tiếng Anh',
    description: 'Trong ứng dụng NV ENGLISH nên có thêm các trò chơi nhỏ như đuổi hình bắt chữ hoặc đấu trường từ vựng 1vs1 trực tuyến thời gian thực để kích thích tinh thần tự học của các em học sinh lớp 9.',
    suggestedBy: 'co_giao_lan@gmail.com',
    createdAt: '2026-05-20T11:45:00Z',
    votes: 38,
    votedEmails: ['chiendq78@gmail.com', 'parentB@gmail.com'],
    category: 'Feature',
    targetAppId: 'nv-english'
  },
  {
    id: 'id-sug-3',
    title: 'Ý tưởng: Ứng dụng "Nông Nghiệp Xanh OS"',
    description: 'Mô hình quản lý vườn trang trại thông minh. Đo lường cơ sở dữ liệu độ ẩm đất, lịch trình bón phân tưới nước tự động và đề xuất gieo trồng bám sát điều kiện thời tiết thực tế tại Việt Nam.',
    suggestedBy: 'viet_farmer@greentech.com',
    createdAt: '2026-05-19T08:30:00Z',
    votes: 18,
    votedEmails: [],
    category: 'New App'
  }
];

export const INITIAL_BUGS: BugReport[] = [
  {
    id: 'bug-1',
    appId: 'nhac-nho-uong-thuoc',
    appName: 'Nhắc Nhở Uống Thuốc',
    title: 'Lỗi không đổ chuông báo thức ở phiên bản Android 12 trở xuống',
    description: 'Gặp hiện tượng thông báo nhắc nhở chỉ hiện tĩnh trên thanh trạng thái mà không có âm thanh báo thức hoặc chuông đối với các máy Samsung chạy Android 12.',
    severity: 'Nghiêm trọng',
    reporterEmail: 'bshung_realyty@gmail.com',
    createdAt: '2026-05-21T18:30:00Z',
    status: 'Đang sửa',
    notes: 'Đội kỹ thuật đã khoanh vùng được vấn đề do cơ chế đặt lịch báo động AlarmManager của đối tượng Android cũ cần thêm quyền SCHEDULE_EXACT_ALARM.'
  },
  {
    id: 'bug-2',
    appId: 'edugrade',
    appName: 'EduGrade - Quản lý Học sinh',
    title: 'Lỗi tải ảnh đại diện học sinh định dạng PNG dung lượng cao',
    description: 'Khi giáo viên chủ nhiệm tải ảnh đại diện học sinh đuôi .png dung lượng lớn hơn 4MB lên cổng thông tin thì hệ thống báo lỗi không rõ nguyên nhân thay vì cảnh báo vượt quá kích thước cho phép.',
    severity: 'Trung bình',
    reporterEmail: 'chiendq78@gmail.com',
    createdAt: '2026-05-22T01:15:00Z',
    status: 'Mới tiếp nhận',
    notes: 'Sẽ cải tiến nén ảnh client-side trước khi tải lên máy chủ Cloudinary.'
  }
];

export const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-1',
    appId: 'nhac-nho-uong-thuoc',
    appName: 'Nhắc Nhở Uống Thuốc',
    title: 'Bản cập nhật Android v2.0.4 đã sẵn sàng!',
    message: 'Khắc phục triệt để lỗi chuông Doze Mode trên Android 14. Vui lòng tải bản cập nhật để ứng dụng báo thuốc được đúng giờ nhất.',
    timestamp: '2026-05-21T19:00:00Z',
    type: 'update'
  },
  {
    id: 'notif-2',
    appId: 'edugrade',
    appName: 'EduGrade - Quản lý Học sinh',
    title: 'Mô-đun AI Nhận Xét và Chat với Phụ huynh chính thức hoạt động',
    message: 'Giáo viên hiện có thể soạn nhận xét cực nhanh với trợ lý AI và tham gia nhóm chat thông suốt với phụ huynh.',
    timestamp: '2026-05-18T10:00:00Z',
    type: 'update'
  },
  {
    id: 'notif-3',
    title: 'Cộng đồng nồng nhiệt!',
    message: 'Hơn 500 ý tưởng đã được đóng góp. Cảm ơn bạn chiendq78@gmail.com và cộng đồng nhà phát triển đã chung tay xây dựng hệ sinh thái.',
    timestamp: '2026-05-22T02:00:00Z',
    type: 'system'
  }
];
