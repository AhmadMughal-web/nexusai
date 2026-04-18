import axios from 'axios';
import { Chat } from '../models/Chat.js';
import { memDB, mongoConnected } from '../config/db.js';

const GROQ_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM = `You are NexusAI, an elite AI career intelligence assistant — sharp, warm, and knowledgeable.

You specialize in:
1. **CV/Resume Building** — Complete professional resumes, ATS-optimized
2. **Job Finding** — Match jobs to user skills and experience
3. **Career Roadmaps** — Step-by-step career paths with timelines
4. **Skill Analysis** — Assess skills and suggest what to learn next
5. **Interview Prep** — Mock interviews, common questions, expert answers
6. **General AI Assistant** — Answer any question intelligently

Rules:
- Format responses with **bold**, bullet points, numbered lists
- Be thorough, clear, and encouraging
- Always give actionable advice`;

// ── SEND MESSAGE ──────────────────────────────
export async function sendMessage(req, res) {
  try {
    const { chatId, message, messages: history } = req.body;

    if (!message?.trim())
      return res.status(400).json({ success: false, message: 'Message is empty.' });

    const key = process.env.GROQ_API_KEY;
    if (!key || key === 'your_groq_api_key_here' || key.length < 20)
      return res.status(500).json({ success: false, message: 'GROQ_API_KEY not set in backend .env file.' });

    // Build messages array
    const msgs = [
      { role: 'system', content: SYSTEM },
      ...(Array.isArray(history) ? history.slice(-20).map(m => ({ role: m.role, content: m.content })) : []),
      { role: 'user', content: message },
    ];

    console.log(`[AI] Calling Groq → ${GROQ_MODEL} (${msgs.length} messages)`);

    // Call Groq
    let reply;
    try {
      const { data } = await axios.post(GROQ_URL,
        { model: GROQ_MODEL, messages: msgs, max_tokens: 2048, temperature: 0.75 },
        { headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, timeout: 25000 }
      );
      reply = data?.choices?.[0]?.message?.content;
    } catch (err) {
      // Groq-specific errors
      if (err.response) {
        const msg = err.response.data?.error?.message || `Groq error ${err.response.status}`;
        console.error('[Groq API]', msg);
        return res.status(502).json({ success: false, message: `AI Error: ${msg}` });
      }
      if (err.code === 'ECONNABORTED')
        return res.status(504).json({ success: false, message: 'AI request timed out. Please try again.' });
      console.error('[Groq Network]', err.code, err.message);
      return res.status(502).json({ success: false, message: 'Could not reach AI service. Check your internet connection.' });
    }

    if (!reply)
      return res.status(502).json({ success: false, message: 'Empty AI response. Please try again.' });

    console.log('[AI] ✅ Response received');

    // Persist to DB
    if (chatId && req.user.id !== 'guest') {
      await saveMessages(req.user.id, chatId, message, reply).catch(err =>
        console.error('[saveMessages]', err.message)
      );
    }

    res.json({ success: true, reply });
  } catch (err) {
    console.error('[sendMessage]', err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
}

// ── CREATE CHAT ───────────────────────────────
export async function createChat(req, res) {
  try {
    const { title = 'New Search' } = req.body;
    const userId = req.user.id;

    if (userId === 'guest') {
      return res.status(201).json({
        success: true,
        chat: { id: 'g_' + Date.now(), title, messages: [], createdAt: new Date().toISOString() },
      });
    }

    if (mongoConnected) {
      const chat = await Chat.create({ userId, title });
      return res.status(201).json({ success: true, chat: { id: chat._id, title: chat.title, messages: [], createdAt: chat.createdAt } });
    } else {
      const id = 'c_' + Date.now();
      const chat = { id, userId, title, messages: [], createdAt: new Date().toISOString() };
      memDB.chats.set(id, chat);
      return res.status(201).json({ success: true, chat });
    }
  } catch (err) {
    console.error('[createChat]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET ALL CHATS ─────────────────────────────
export async function getChats(req, res) {
  try {
    const userId = req.user.id;
    if (userId === 'guest') return res.json({ success: true, chats: [] });

    if (mongoConnected) {
      const chats = await Chat.find({ userId, isDeleted: false })
        .select('title createdAt updatedAt').sort({ updatedAt: -1 }).lean();
      return res.json({ success: true, chats: chats.map(c => ({ id: c._id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt })) });
    } else {
      const chats = [...memDB.chats.values()]
        .filter(c => c.userId === userId)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .map(c => ({ id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt }));
      return res.json({ success: true, chats });
    }
  } catch (err) {
    console.error('[getChats]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── GET SINGLE CHAT ───────────────────────────
export async function getChat(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (mongoConnected) {
      const chat = await Chat.findOne({ _id: chatId, userId, isDeleted: false }).lean();
      if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });
      return res.json({ success: true, chat: { id: chat._id, title: chat.title, messages: chat.messages, createdAt: chat.createdAt } });
    } else {
      const chat = memDB.chats.get(chatId);
      if (!chat || chat.userId !== userId) return res.status(404).json({ success: false, message: 'Chat not found.' });
      return res.json({ success: true, chat });
    }
  } catch (err) {
    console.error('[getChat]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── DELETE CHAT ───────────────────────────────
export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (mongoConnected) {
      await Chat.findOneAndUpdate({ _id: chatId, userId }, { isDeleted: true });
    } else {
      const c = memDB.chats.get(chatId);
      if (c && c.userId === userId) memDB.chats.delete(chatId);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[deleteChat]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── UPDATE TITLE ──────────────────────────────
export async function updateChatTitle(req, res) {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (mongoConnected) {
      await Chat.findOneAndUpdate({ _id: chatId, userId }, { title });
    } else {
      const c = memDB.chats.get(chatId);
      if (c && c.userId === userId) c.title = title;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[updateChatTitle]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ── Helper ────────────────────────────────────
async function saveMessages(userId, chatId, userMsg, aiReply) {
  const msgs = [
    { role: 'user',      content: userMsg,  createdAt: new Date() },
    { role: 'assistant', content: aiReply,   createdAt: new Date() },
  ];
  if (mongoConnected) {
    await Chat.findOneAndUpdate(
      { _id: chatId, userId },
      { $push: { messages: { $each: msgs } }, updatedAt: new Date() }
    );
  } else {
    const c = memDB.chats.get(chatId);
    if (c) { c.messages.push(...msgs); c.updatedAt = new Date().toISOString(); }
  }
}
