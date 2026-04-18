import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { authRouter } from './routes/auth.js';
import { chatRouter } from './routes/chat.js';
import { userRouter } from './routes/user.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/user', userRouter);

// ── Health Check ───────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'NexusAI running 🚀', time: new Date().toISOString() });
});

// ── 404 ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Error Handler ──────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n✅ NexusAI Backend → http://localhost:${PORT}`);
    console.log(`📦 Mode: ${process.env.NODE_ENV}`);
    console.log(`🤖 AI Model: llama-3.3-70b-versatile\n`);
  });
};

start().catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});
