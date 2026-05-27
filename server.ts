import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Import original mock data for seeding if database does not exist
import { INITIAL_APPS, INITIAL_SUGGESTIONS, INITIAL_BUGS, SYSTEM_NOTIFICATIONS } from "./src/data.js";
import { AppIdea, CommunitySuggestion, BugReport, SystemNotification } from "./src/types.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// JSON File DB Path
const DB_FILE = path.join(process.cwd(), "db.json");

// Structure of our backend database
interface DatabaseSchema {
  apps: AppIdea[];
  suggestions: CommunitySuggestion[];
  bugs: BugReport[];
  notifications: SystemNotification[];
}

// Read or seed Database
function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Lỗi khi đọc file db.json, khởi tạo lại dữ liệu mẫu:", error);
  }

  // Seeding
  const freshDb: DatabaseSchema = {
    apps: INITIAL_APPS,
    suggestions: INITIAL_SUGGESTIONS,
    bugs: INITIAL_BUGS,
    notifications: SYSTEM_NOTIFICATIONS,
  };
  saveDatabase(freshDb);
  return freshDb;
}

function saveDatabase(dbData: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), "utf-8");
  } catch (error) {
    console.error("Lỗi khi ghi file db.json:", error);
  }
}

// -------------------------------------------------------------
// Lazy Gemini API client
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Cần cấu hình biến môi trường GEMINI_API_KEY để sử dụng tính năng AI!");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// =============================================================
// BACKEND API ENDPOINTS
// =============================================================

// 1. Apps endpoints
app.get("/api/apps", (req, res) => {
  const db = readDatabase();
  res.json(db.apps);
});

app.post("/api/apps", (req, res) => {
  const db = readDatabase();
  const submitted = req.body as Partial<AppIdea>;
  if (!submitted.name) {
    return res.status(400).json({ error: "Tên ứng dụng là bắt buộc" });
  }

  const existingIndex = db.apps.findIndex(a => a.id === submitted.id);
  let savedApp: AppIdea;

  if (existingIndex > -1) {
    // Update
    savedApp = {
      ...db.apps[existingIndex],
      ...submitted,
    } as AppIdea;
    db.apps[existingIndex] = savedApp;
  } else {
    // Create new
    const slug = (submitted.name || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    const newId = slug || `app-${Date.now()}`;
    
    savedApp = {
      id: newId,
      name: submitted.name,
      description: submitted.description || "",
      icon: submitted.icon || "Sparkles",
      platforms: submitted.platforms || ["Web"],
      status: submitted.status || "Đang phát triển",
      techStack: submitted.techStack || ["React", "TypeScript"],
      currentVersion: submitted.currentVersion || "1.0.0",
      changelogs: submitted.changelogs || [
        {
          version: submitted.currentVersion || "1.0.0",
          date: new Date().toISOString().split("T")[0],
          title: "Khởi tạo ứng dụng",
          changes: ["Phiên bản sơ khai ban đầu."],
          type: "major",
        },
      ],
      voters: submitted.voters || [],
      rating: submitted.rating !== undefined ? submitted.rating : 5.0,
      ratingCount: submitted.ratingCount !== undefined ? submitted.ratingCount : 1,
      sourceCodeUrl: submitted.sourceCodeUrl || "",
      appUrl: submitted.appUrl || "",
    };
    db.apps.unshift(savedApp);
  }

  saveDatabase(db);
  res.json(savedApp);
});

app.delete("/api/apps/:id", (req, res) => {
  const db = readDatabase();
  const index = db.apps.findIndex(a => a.id === req.params.id);
  if (index > -1) {
    db.apps.splice(index, 1);
    saveDatabase(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Không tìm thấy ứng dụng" });
});

app.post("/api/apps/:id/vote", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Yêu cầu email người thực hiện" });

  const index = db.apps.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: "Không tìm thấy ứng dụng" });

  const app = db.apps[index];
  const voters = app.voters || [];
  let updatedVoters: string[];

  if (voters.includes(email)) {
    updatedVoters = voters.filter(v => v !== email);
  } else {
    updatedVoters = [...voters, email];
  }

  app.voters = updatedVoters;
  db.apps[index] = app;
  saveDatabase(db);
  res.json(app);
});

app.post("/api/apps/:id/rate", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { stars } = req.body;
  if (stars === undefined || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "Đánh giá sao không hợp lệ (1-5)" });
  }

  const index = db.apps.findIndex(a => a.id === id);
  if (index === -1) return res.status(404).json({ error: "Không thấy ứng dụng" });

  const app = db.apps[index];
  const count = app.ratingCount + 1;
  const avg = parseFloat(((app.rating * app.ratingCount + stars) / count).toFixed(1));

  app.rating = avg;
  app.ratingCount = count;
  db.apps[index] = app;
  
  saveDatabase(db);
  res.json(app);
});

// 2. Suggestions endpoints
app.get("/api/suggestions", (req, res) => {
  const db = readDatabase();
  res.json(db.suggestions);
});

app.post("/api/suggestions", (req, res) => {
  const db = readDatabase();
  const body = req.body;

  if (!body.title || !body.description) {
    return res.status(400).json({ error: "Thiếu tiêu đề hoặc mô tả ý tưởng" });
  }

  const existingIndex = body.id ? db.suggestions.findIndex(s => s.id === body.id) : -1;
  if (existingIndex > -1) {
    const updated = {
      ...db.suggestions[existingIndex],
      title: body.title,
      description: body.description,
      category: body.category || db.suggestions[existingIndex].category,
      targetAppId: body.targetAppId !== undefined ? body.targetAppId : db.suggestions[existingIndex].targetAppId
    };
    db.suggestions[existingIndex] = updated;
    saveDatabase(db);
    return res.json(updated);
  }

  const newSuggestionByHub: CommunitySuggestion = {
    id: body.id || `sug-${Date.now()}`,
    title: body.title,
    description: body.description,
    suggestedBy: body.suggestedBy || "guest@aiapps.io.vn",
    createdAt: body.createdAt || new Date().toISOString(),
    votes: body.votes || 1,
    votedEmails: body.votedEmails || [body.suggestedBy || "guest@aiapps.io.vn"],
    category: body.category || "Feature",
    targetAppId: body.targetAppId || "",
  };

  db.suggestions.unshift(newSuggestionByHub);
  saveDatabase(db);
  res.json(newSuggestionByHub);
});

app.post("/api/suggestions/:id/vote", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email là bắt buộc để bầu chọn" });

  const index = db.suggestions.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: "Không tìm thấy đề xuất" });

  const sug = db.suggestions[index];
  const votedEmails = sug.votedEmails || [];
  let updatedVotedEmails: string[];
  let change = 0;

  if (votedEmails.includes(email)) {
    updatedVotedEmails = votedEmails.filter(e => e !== email);
    change = -1;
  } else {
    updatedVotedEmails = [...votedEmails, email];
    change = 1;
  }

  sug.votedEmails = updatedVotedEmails;
  sug.votes = Math.max(0, (sug.votes || 0) + change);
  db.suggestions[index] = sug;
  saveDatabase(db);
  res.json(sug);
});

app.delete("/api/suggestions/:id", (req, res) => {
  const db = readDatabase();
  const index = db.suggestions.findIndex(s => s.id === req.params.id);
  if (index > -1) {
    db.suggestions.splice(index, 1);
    saveDatabase(db);
    return res.json({ success: true });
  }
  res.status(404).json({ error: "Không tìm thấy đề xuất" });
});

// 3. Bugs endpoints
app.get("/api/bugs", (req, res) => {
  const db = readDatabase();
  res.json(db.bugs);
});

app.post("/api/bugs", (req, res) => {
  const db = readDatabase();
  const body = req.body;
  if (!body.title || !body.description || !body.appId) {
    return res.status(400).json({ error: "Mẫu báo lỗi bị khuyết các trường bắt buộc" });
  }

  const newBug: BugReport = {
    id: `bug-${Date.now()}`,
    appId: body.appId,
    appName: body.appName || "Ứng dụng",
    title: body.title,
    description: body.description,
    severity: body.severity || "Trung bình",
    reporterEmail: body.reporterEmail || "guest@aiapps.io.vn",
    createdAt: new Date().toISOString(),
    status: "Mới tiếp nhận",
    notes: "",
  };

  db.bugs.unshift(newBug);
  saveDatabase(db);
  res.json(newBug);
});

app.post("/api/bugs/:id/status", (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { status, notes } = req.body;

  const index = db.bugs.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: "Không tìm thấy báo cáo lỗi" });

  db.bugs[index].status = status;
  if (notes !== undefined) {
    db.bugs[index].notes = notes;
  }

  saveDatabase(db);
  res.json(db.bugs[index]);
});

// 4. Notifications
app.get("/api/notifications", (req, res) => {
  const db = readDatabase();
  res.json(db.notifications);
});

app.post("/api/notifications", (req, res) => {
  const db = readDatabase();
  const body = req.body as Partial<SystemNotification>;

  const newNotif: SystemNotification = {
    id: `notif-${Date.now()}`,
    appId: body.appId || "",
    appName: body.appName || "",
    title: body.title || "Thông báo hệ thống",
    message: body.message || "",
    timestamp: new Date().toISOString(),
    type: body.type || "system",
  };

  db.notifications.unshift(newNotif);
  saveDatabase(db);
  res.json(newNotif);
});

// =============================================================
// GEMINI INTELLIGENT ROUTING (AI)
// =============================================================

// AI Endpoint 1: Analyze bug and give suggestions
app.post("/api/ai/analyze-bug", async (req, res) => {
  const { bugId } = req.body;
  if (!bugId) return res.status(400).json({ error: "Thiếu ID báo cáo lỗi cần phân tích!" });

  const db = readDatabase();
  const bug = db.bugs.find(b => b.id === bugId);
  if (!bug) return res.status(404).json({ error: "Không tìm thấy báo cáo lỗi tương ứng!" });

  try {
    const ai = getGemini();
    const systemPrompt = `Bạn là Chuyên gia phát triển phần mềm và Bảo mật hệ thống cao cấp người Việt Nam.
Hãy phân tích báo cáo lỗi của ứng dụng và đưa ra:
1. Đánh giá nguyên nhân gốc rễ (Root Cause Analysis).
2. Hướng dẫn sửa đổi từng bước cụ thể.
3. Code vá lỗi tối ưu, an toàn bằng ngôn ngữ/framework tương ứng của ứng dụng.
Đưa ra phản hồi bằng tiếng Việt với định dạng Markdown chuyên nghiệp, rõ ràng, gãy gọn.`;

    const userPrompt = `Ứng dụng: ${bug.appName} (ID: ${bug.appId})
Tiêu đề lỗi: ${bug.title}
Mô tả lỗi: ${bug.description}
Mức độ nghiêm trọng: ${bug.severity}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const analysis = response.text || "Xin lỗi, không có phân tích nào từ AI lúc này.";
    res.json({ analysis });
  } catch (err: any) {
    console.error("Gemini analyze-bug error:", err);
    res.status(500).json({ error: err.message || "Lỗi xử lý AI từ server." });
  }
});

// AI Endpoint 2: Suggest 3 feature ideas and timeline
app.post("/api/ai/suggest-features", async (req, res) => {
  const { appId } = req.body;
  if (!appId) return res.status(400).json({ error: "Thiếu ID ứng dụng." });

  const db = readDatabase();
  const appIdea = db.apps.find(a => a.id === appId);
  if (!appIdea) return res.status(404).json({ error: "Không tìm thấy ứng dụng này." });

  try {
    const ai = getGemini();
    const systemPrompt = `Bạn là Giám đốc Sản phẩm (Product Manager / Product Owner) xuất sắc.
Dựa trên thông tin ứng dụng được cung cấp, hãy đề xuất 3 tính năng mới mang tính bứt phá vượt trội so với thị trường hiện tại.
Mỗi tính năng cần chỉ rõ:
1. Giá trị mang lại cho người dùng cuối (User Value).
2. Tech Stack đề xuất thêm hoặc tối ưu hóa.
3. Lộ trình tích hợp triển khai (3-step roadmap).
Trình bày hoàn toàn bằng tiếng Việt sử dụng cấu trúc Markdown trực quan, kèm các ký tự bullet điểm nhịp tinh tế.`;

    const userPrompt = `Ứng dụng: ${appIdea.name}
Mô tả: ${appIdea.description}
Nền tảng: ${appIdea.platforms.join(", ")}
Tech Stack hiện tại: ${appIdea.techStack.join(", ")}
Tình trạng: ${appIdea.status}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.85,
      },
    });

    const suggestions = response.text || "Không tạo được phản hồi từ AI.";
    res.json({ suggestions });
  } catch (err: any) {
    console.error("Gemini suggest-features error:", err);
    res.status(500).json({ error: err.message || "Lỗi hệ thống AI phát triển." });
  }
});

// =============================================================
// VITE AND STATIC ASSETS HANDLER
// =============================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
