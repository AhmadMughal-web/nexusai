# ⚡ NexusAI — Full-Stack AI Career Platform

A production-ready GenAI web application built with **React + Vite** (frontend) and **Node.js + Express** (backend), powered by **Groq's Llama 3 70B** model.

---

## 🚀 Quick Start

### 1. Get a Groq API Key (Free)
Go to → **https://console.groq.com** → Create account → API Keys → Create Key  
Copy the key (starts with `gsk_...`)

### 2. Setup Backend

```bash
cd nexusai/backend
npm install
```

Edit `.env` and fill in your values:
```env
GROQ_API_KEY=gsk_your_key_here        # ← Required
JWT_SECRET=any_long_random_string      # ← Change this!

# Optional — MongoDB (leave blank to use in-memory DB for dev)
MONGO_URI=mongodb://localhost:27017/nexusai

# Optional — Email for password reset
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Start the backend:
```bash
npm run dev     # development (auto-reload)
npm start       # production
```
Backend runs on → **http://localhost:5000**

### 3. Setup Frontend

```bash
cd nexusai/frontend
npm install
npm run dev
```
Frontend runs on → **http://localhost:5173**

> The Vite dev server automatically proxies `/api` requests to `localhost:5000`

---

## ✅ Features

| Feature | Details |
|---|---|
| 🔐 **Auth** | Signup, Login by email OR username, JWT sessions |
| ⚠️ **Smart Errors** | "No account found", "Incorrect password" — exact messages |
| 🔑 **Forgot Password** | Email reset link via Nodemailer |
| 👤 **Guest Mode** | Use the app without an account |
| 🤖 **Real AI** | Groq Llama 3 70B — fast, smart, free tier |
| 💬 **Chat History** | Saved per user, grouped by Today / Yesterday / Earlier |
| 🗑️ **Delete Chats** | Per-chat delete that persists |
| 🌙 **Dark / Light** | Theme saved to localStorage |
| 📱 **Responsive** | Mobile sidebar + collapsible layout |
| 📄 **CV Builder** | AI-powered resume creation |
| 🗺️ **Career Roadmap** | Step-by-step career planning |
| 🎯 **Job Finder** | Skills-to-job matching |
| 🎤 **Interview Prep** | Mock interviews + expert answers |

---

## 🔧 Production Deploy

**Frontend** → Build and serve via Nginx / Vercel / Netlify:
```bash
cd frontend && npm run build
# Output in frontend/dist/
```

**Backend** → Deploy to Railway / Render / VPS:
```bash
cd backend
NODE_ENV=production npm start
```

Set `CLIENT_URL` in backend `.env` to your frontend domain.

---

## 💡 Tips

- **No MongoDB?** Leave `MONGO_URI` blank — the app uses a fast in-memory store. Data resets on server restart.
- **No email setup?** Forgot password links are logged to the console in dev mode.
- **Rate limits**: Auth is limited to 20 requests/15min, chat to 30 messages/min.
# nexusai

