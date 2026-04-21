import axios from 'axios';
import { Chat } from '../models/Chat.js';
import { inMemoryDB, isMongoConnected } from '../config/db.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are NexusAI, an elite AI career intelligence assistant. You are sharp, warm, and highly knowledgeable. You help users with:

1. **CV/Resume Building** — Complete, ATS-optimized resumes with all sections
2. **Job Finding** — Match jobs to user skills and experience
3. **Career Roadmaps** — Step-by-step career paths with timelines
4. **Skill Analysis** — Assess skills and suggest what to learn next
5. **Interview Prep** — Mock interviews, common questions, expert answers
6. **General AI Assistant** — Answer any question intelligently

CRITICAL RULES:
- Format responses with **bold**, bullet points, numbered lists
- Be thorough, clear, and encouraging
- Always give actionable advice
- When user asks to build a CV/Resume: ALWAYS create a COMPLETE, fully written CV directly in your response. Include all sections: Full Name & Contact Info, Professional Summary, Technical Skills, Work Experience, Education, Projects, Achievements. Use proper markdown formatting with ## headings for each section.
- NEVER say you cannot create a PDF or file. NEVER tell users to use Canva, Word, or any external tool. Just write the complete CV content — our system converts it to PDF automatically.
- Make the CV professional, detailed, and ready to use.`;

// ══════════════════════════════════════════════
// SEND MESSAGE → GROQ AI
// ══════════════════════════════════════════════
export async function sendMessage(req, res) {
  try {
    const { chatId, message, messages: history } = req.body;
    const userId = req.user.id;

    if (!message?.trim())
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.length < 20)
      return res.status(500).json({ success: false, message: 'Groq API key not configured. Check .env file.' });

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history.map(m => ({ role: m.role, content: m.content })) : []),
      { role: 'user', content: message },
    ];

    console.log(`[Groq] Sending message to ${GROQ_MODEL}...`);

    let reply;
    try {
      const groqRes = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          max_tokens: 2048,
          temperature: 0.75,
          messages: groqMessages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      reply = groqRes.data?.choices?.[0]?.message?.content;
      console.log(`[Groq] Response received ✅`);

    } catch (groqErr) {
      // Groq API specific error handling
      if (groqErr.response) {
        // Server responded with error
        const msg = groqErr.response.data?.error?.message || `Groq API error: ${groqErr.response.status}`;
        console.error('[Groq API Error]', msg);
        return res.status(502).json({ success: false, message: msg });
      } else if (groqErr.code === 'ECONNABORTED') {
        console.error('[Groq] Request timed out');
        return res.status(504).json({ success: false, message: 'AI request timed out. Please try again.' });
      } else if (groqErr.code === 'ECONNRESET' || groqErr.code === 'ENOTFOUND') {
        console.error('[Groq] Network error:', groqErr.code);
        return res.status(502).json({ success: false, message: 'Network error connecting to AI. Please check internet connection.' });
      } else {
        console.error('[Groq] Unknown error:', groqErr.message);
        return res.status(502).json({ success: false, message: 'AI service unavailable. Please try again.' });
      }
    }

    if (!reply)
      return res.status(502).json({ success: false, message: 'Empty response from AI. Please try again.' });

    // Save to DB (non-guest only)
    if (chatId && userId !== 'guest') {
      await saveMsgs(userId, chatId, message, reply);
    }

    return res.json({ success: true, reply });

  } catch (err) {
    console.error('[sendMessage Error]', err.message);
    // Make sure we haven't already sent a response
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server error: ' + err.message });
    }
  }
}

// ══════════════════════════════════════════════
// CREATE CHAT
// ══════════════════════════════════════════════
export async function createChat(req, res) {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    if (userId === 'guest') {
      const id = 'guest_' + Date.now();
      return res.status(201).json({
        success: true,
        chat: { id, title: title || 'New Search', messages: [], createdAt: new Date().toISOString() },
      });
    }

    if (isMongoConnected) {
      const chat = await Chat.create({ userId, title: title || 'New Search' });
      return res.status(201).json({
        success: true,
        chat: { id: chat._id, title: chat.title, messages: [], createdAt: chat.createdAt },
      });
    } else {
      const id = 'chat_' + Date.now();
      const chat = { id, userId, title: title || 'New Search', messages: [], createdAt: new Date().toISOString() };
      inMemoryDB.chats.set(id, chat);
      return res.status(201).json({ success: true, chat });
    }
  } catch (err) {
    console.error('[createChat Error]', err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: err.message });
  }
}

// ══════════════════════════════════════════════
// GET ALL CHATS
// ══════════════════════════════════════════════
export async function getChats(req, res) {
  try {
    const userId = req.user.id;
    if (userId === 'guest') return res.json({ success: true, chats: [] });

    if (isMongoConnected) {
      const chats = await Chat.find({ userId, isDeleted: false })
        .select('title createdAt updatedAt')
        .sort({ updatedAt: -1 });
      return res.json({
        success: true,
        chats: chats.map(c => ({
          id: c._id,
          title: c.title,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
      });
    } else {
      const chats = Array.from(inMemoryDB.chats.values())
        .filter(c => c.userId === userId && !c.isDeleted)
        .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
        .map(c => ({ id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt }));
      return res.json({ success: true, chats });
    }
  } catch (err) {
    console.error('[getChats Error]', err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: err.message });
  }
}

// ══════════════════════════════════════════════
// GET SINGLE CHAT
// ══════════════════════════════════════════════
export async function getChat(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (isMongoConnected) {
      const chat = await Chat.findOne({ _id: chatId, userId, isDeleted: false });
      if (!chat) return res.status(404).json({ success: false, message: 'Chat not found.' });
      return res.json({
        success: true,
        chat: { id: chat._id, title: chat.title, messages: chat.messages, createdAt: chat.createdAt },
      });
    } else {
      const chat = inMemoryDB.chats.get(chatId);
      if (!chat || chat.userId !== userId)
        return res.status(404).json({ success: false, message: 'Chat not found.' });
      return res.json({ success: true, chat });
    }
  } catch (err) {
    console.error('[getChat Error]', err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: err.message });
  }
}

// ══════════════════════════════════════════════
// DELETE CHAT
// ══════════════════════════════════════════════
export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (isMongoConnected) {
      await Chat.findOneAndUpdate({ _id: chatId, userId }, { isDeleted: true });
    } else {
      const chat = inMemoryDB.chats.get(chatId);
      if (chat && chat.userId === userId) inMemoryDB.chats.delete(chatId);
    }
    res.json({ success: true, message: 'Chat deleted.' });
  } catch (err) {
    console.error('[deleteChat Error]', err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: err.message });
  }
}

// ══════════════════════════════════════════════
// UPDATE CHAT TITLE
// ══════════════════════════════════════════════
export async function updateChatTitle(req, res) {
  try {
    const { chatId } = req.params;
    const { title } = req.body;
    const userId = req.user.id;

    if (isMongoConnected) {
      await Chat.findOneAndUpdate({ _id: chatId, userId }, { title });
    } else {
      const chat = inMemoryDB.chats.get(chatId);
      if (chat && chat.userId === userId) chat.title = title;
    }
    res.json({ success: true });
  } catch (err) {
    console.error('[updateChatTitle Error]', err.message);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: err.message });
  }
}

// ── Helper: save messages ──────────────────────
async function saveMsgs(userId, chatId, userMsg, aiReply) {
  try {
    const msgs = [
      { role: 'user', content: userMsg, createdAt: new Date() },
      { role: 'assistant', content: aiReply, createdAt: new Date() },
    ];
    if (isMongoConnected) {
      await Chat.findOneAndUpdate(
        { _id: chatId, userId },
        { $push: { messages: { $each: msgs } }, updatedAt: new Date() }
      );
    } else {
      const chat = inMemoryDB.chats.get(chatId);
      if (chat) {
        chat.messages.push(...msgs);
        chat.updatedAt = new Date().toISOString();
      }
    }
  } catch (err) {
    console.error('[saveMsgs Error]', err.message);
  }
}
