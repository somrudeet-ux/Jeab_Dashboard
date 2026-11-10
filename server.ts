import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'feedback_data.json');

export interface FeedbackItem {
  id: string;
  createdAt: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  average: number;
  comment?: string;
  deviceToken?: string;
}

// In-memory store initialized from file if exists
let feedbacks: FeedbackItem[] = [];

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    feedbacks = JSON.parse(raw);
  } else {
    // Seed sample initial mock data so the presenter dashboard looks great right away!
    const sampleTime = new Date().toISOString();
    feedbacks = [
      {
        id: 'seed-1',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        q1: 5,
        q2: 5,
        q3: 4,
        q4: 5,
        q5: 5,
        average: 4.8,
        comment: 'วิทยากรอธิบายเข้าใจง่ายมาก มีตัวอย่าง Workshop ที่สามารถนำไปใช้กับงานจริงได้ทันทีครับ',
      },
      {
        id: 'seed-2',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        q1: 5,
        q2: 4,
        q3: 5,
        q4: 4,
        q5: 5,
        average: 4.6,
        comment: 'เนื้อหาครอบคลุมและทันสมัยมากค่ะ สไลด์สวยงามเข้าใจง่าย',
      },
      {
        id: 'seed-3',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        q1: 4,
        q2: 5,
        q3: 4,
        q4: 4,
        q5: 4,
        average: 4.2,
        comment: 'อยากให้มีภาคต่อระดับ Advanced เพิ่มเติมอีกในโอกาสหน้าครับ',
      },
      {
        id: 'seed-4',
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        q1: 5,
        q2: 5,
        q3: 5,
        q4: 5,
        q5: 5,
        average: 5.0,
        comment: 'ประทับใจการดูแลของทีมงานและสถานที่มาก ขอบคุณสำหรับความรู้ดีๆ ครับ',
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
  }
} catch (e) {
  console.error('Error loading initial feedback data:', e);
}

function saveFeedbacks() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist feedbacks to disk', err);
  }
}

// SSE Clients for live projector updates
type SSEClient = {
  id: number;
  res: express.Response;
};
let sseClients: SSEClient[] = [];

function broadcastFeedbacks() {
  const payload = JSON.stringify(feedbacks);
  sseClients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Endpoints
  app.get('/api/feedbacks', (req, res) => {
    res.json({
      success: true,
      data: feedbacks
    });
  });

  // Server-Sent Events (SSE) for instantaneous live updates on projector dashboard
  app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.flushHeaders?.();

    const clientId = Date.now() + Math.random();
    const newClient: SSEClient = { id: clientId, res };
    sseClients.push(newClient);

    // Send immediate initial data
    res.write(`data: ${JSON.stringify(feedbacks)}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(c => c.id !== clientId);
    });
  });

  // Submit new feedback
  app.post('/api/feedback', (req, res) => {
    try {
      const { q1, q2, q3, q4, q5, comment, deviceToken } = req.body;

      if (!q1 || !q2 || !q3 || !q4 || !q5) {
        return res.status(400).json({ error: 'กรุณาประเมินให้ครบทั้ง 5 ข้อ' });
      }

      // Check duplicate deviceToken within current session if provided
      if (deviceToken) {
        const existing = feedbacks.find(f => f.deviceToken && f.deviceToken === deviceToken);
        if (existing) {
          return res.status(409).json({
            error: 'เครื่องนี้ได้ส่งแบบประเมินเรียบร้อยแล้ว ขอบคุณสำหรับการตอบรับ!',
            alreadySubmitted: true
          });
        }
      }

      const num1 = Math.min(5, Math.max(1, Number(q1)));
      const num2 = Math.min(5, Math.max(1, Number(q2)));
      const num3 = Math.min(5, Math.max(1, Number(q3)));
      const num4 = Math.min(5, Math.max(1, Number(q4)));
      const num5 = Math.min(5, Math.max(1, Number(q5)));

      const avg = Number(((num1 + num2 + num3 + num4 + num5) / 5).toFixed(2));

      const newFeedback: FeedbackItem = {
        id: 'fb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        q1: num1,
        q2: num2,
        q3: num3,
        q4: num4,
        q5: num5,
        average: avg,
        comment: (comment || '').trim(),
        deviceToken: deviceToken || undefined
      };

      feedbacks.unshift(newFeedback);
      saveFeedbacks();
      broadcastFeedbacks();

      return res.status(201).json({
        success: true,
        data: newFeedback
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      return res.status(500).json({ error: err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
  });

  // Clear all feedback (Admin / Presenter reset for new training session)
  app.post('/api/reset', (req, res) => {
    feedbacks = [];
    saveFeedbacks();
    broadcastFeedbacks();
    res.json({ success: true, message: 'รีเซ็ตข้อมูลทั้งหมดเรียบร้อย' });
  });

  // Seed sample mock data for demonstration
  app.post('/api/seed', (req, res) => {
    const comments = [
      'เนื้อหาดีมาก วิทยากรเป็นกันเองและตอบคำถามได้กระจ่าง',
      'อยากให้มีเวลาฝึกปฏิบัติ (Workshop) เพิ่มขึ้นอีกนิดครับ',
      'เอกสารประกอบการสอนสวยงาม เข้าใจง่าย นำไปประยุกต์ใช้ได้จริง',
      'อาหารว่างและสถานที่จัดอบรมดีมากครับ',
      'ช่วยให้เข้าใจเทคโนโลยีใหม่ๆ ได้เร็วขึ้นมาก ประทับใจมากค่ะ',
      'จัดอีกแน่นอนครับ หัวข้อโดนใจคนทำงานยุคนี้มาก'
    ];
    const newItems: FeedbackItem[] = [];
    for (let i = 0; i < 5; i++) {
      const q1 = Math.floor(Math.random() * 2) + 4;
      const q2 = Math.floor(Math.random() * 2) + 4;
      const q3 = Math.floor(Math.random() * 2) + 4;
      const q4 = Math.floor(Math.random() * 2) + 4;
      const q5 = Math.floor(Math.random() * 2) + 4;
      const avg = Number(((q1 + q2 + q3 + q4 + q5) / 5).toFixed(2));
      newItems.push({
        id: 'mock-' + Date.now() + '-' + i,
        createdAt: new Date(Date.now() - (i + 1) * 3 * 60 * 1000).toISOString(),
        q1,
        q2,
        q3,
        q4,
        q5,
        average: avg,
        comment: comments[i % comments.length]
      });
    }
    feedbacks = [...newItems, ...feedbacks];
    saveFeedbacks();
    broadcastFeedbacks();
    res.json({ success: true, count: feedbacks.length });
  });

  // Integrate Vite for React SPA
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Live Feedback Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
