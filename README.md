# NexusAI — Intelligent Career Companion

<div align="center">

![NexusAI](https://img.shields.io/badge/NexusAI-Career%20Intelligence-3b82f6?style=for-the-badge&logo=openai&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama%203.3-F55036?style=for-the-badge)

**A full-stack AI-powered career intelligence platform — built like ChatGPT, designed for your career.**

[🌐 Live Demo](https://nexusai-2026.netlify.app) · [📧 Contact](mailto:ahmadmughalweb@gmail.com) · [💼 Portfolio](https://ahmad-ai-portfolio.netlify.app)

</div>

---

## 📌 Overview

**NexusAI** is a production-ready, full-stack AI agent that helps users build their career — from creating professional CVs to finding jobs, planning career roadmaps, and preparing for interviews. It features real-time AI chat powered by Groq's Llama 3.3 70B model, complete authentication system, persistent chat history, and PDF export functionality.

> Think of it as your personal ChatGPT — but built specifically for career intelligence.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Real AI Chat** | Powered by Groq Llama 3.3 70B — fast, intelligent responses |
| 🔐 **Full Authentication** | Signup, Login, Forgot Password, Reset via Email |
| 👤 **Guest Mode** | Use the app without creating an account |
| 💬 **Chat History** | All conversations saved and grouped by date |
| 📄 **PDF Export** | Download AI-generated CV/Resume as PDF |
| ⎘ **Copy Response** | Copy any AI message with one click |
| 🌙 **Dark / Light Theme** | Toggle between themes — preference saved |
| 📱 **Fully Responsive** | Works perfectly on mobile, tablet, and desktop |
| 🚀 **CI/CD Deployment** | Auto-deploy on every GitHub push |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** — fast, component-based UI
- **React Router v6** — client-side routing & protected routes
- **Context API** — global state management (Auth, Chat, Theme)
- **Axios** — HTTP client with interceptors
- **React Markdown** + **remark-gfm** — render AI markdown responses
- **html2pdf.js** — PDF generation
- **React Hot Toast** — notifications
- **Deployed on Netlify**

### Backend
- **Node.js** + **Express v4** — REST API server
- **JWT (jsonwebtoken)** — authentication & session management
- **bcryptjs** — password hashing
- **Mongoose** — MongoDB ODM
- **Nodemailer** — password reset emails
- **Axios** — Groq API calls
- **express-rate-limit** — API rate limiting
- **Deployed on Render**

### Database & AI
- **MongoDB Atlas** — cloud database (users, chat history)
- **Groq API** — Llama 3.3 70B model for AI responses
- **In-Memory DB** — fallback when MongoDB unavailable

---

## 🤖 AI Capabilities

NexusAI can help users with:

- 📄 **CV / Resume Building** — Complete, ATS-optimized professional resumes
- 🎯 **Job Finding** — Match jobs based on skills and experience
- 🗺️ **Career Roadmaps** — Step-by-step career paths with timelines
- ⚡ **Skill Analysis** — Assess skills and suggest improvements
- 🎤 **Interview Preparation** — Mock interviews and expert answers
- 💡 **Career Advice** — Professional guidance and insights

---

## 📁 Project Structure

```
nexusai/
├── frontend/                     # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # AuthLayout
│   │   │   ├── chat/             # ChatWindow, ChatInput, Message, WelcomeHero
│   │   │   ├── layout/           # Sidebar, TopBar, SearchHistory, LogoutButton
│   │   │   └── ui/              # Button, InputField, Icons
│   │   ├── context/              # AuthContext, ChatContext, ThemeContext
│   │   ├── pages/                # LoginPage, SignupPage, ForgotPassword, ChatPage
│   │   ├── services/             # api.js (Axios instance)
│   │   ├── styles/               # globals.css, auth.css, chat.css, sidebar.css
│   │   └── utils/                # pdfExport.js
│   ├── netlify.toml
│   └── vite.config.js
│
└── backend/                      # Node.js + Express
    ├── config/                   # db.js (MongoDB + in-memory)
    ├── controllers/              # authController, chatController, userController
    ├── middleware/               # authMiddleware, errorHandler, rateLimiter
    ├── models/                   # User.js, Chat.js
    ├── routes/                   # auth.js, chat.js, user.js
    ├── utils/                    # mailer.js
    └── server.js
```

---

## 🔌 API Endpoints

### Auth Routes
```
POST   /api/auth/signup                 Register new user
POST   /api/auth/login                  Login (email or username)
POST   /api/auth/guest                  Guest session
POST   /api/auth/forgot-password        Send reset email
PATCH  /api/auth/reset-password/:token  Reset password
GET    /api/auth/me                     Get current user
```

### Chat Routes
```
POST   /api/chat/message                Send message → Groq AI
POST   /api/chat                        Create new chat
GET    /api/chat                        Get all chats (sidebar)
GET    /api/chat/:chatId                Load chat with messages
DELETE /api/chat/:chatId                Delete chat
PATCH  /api/chat/:chatId/title          Update chat title
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API Key — [console.groq.com](https://console.groq.com)

### 1. Clone the Repository
```bash
git clone https://github.com/AhmadMughal-web/nexusai.git
cd nexusai
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=gsk_your_groq_key
MONGO_URI=mongodb://localhost:27017/nexusai
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
```

```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open App
```
http://localhost:5173
```

---

## 🌐 Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Netlify | [nexusai-2026.netlify.app](https://nexusai-2026.netlify.app) |
| Backend | Render | [nexusai-naao.onrender.com](https://nexusai-naao.onrender.com) |
| Database | MongoDB Atlas | Cloud hosted |
| Monitoring | UptimeRobot | Ping every 5 minutes |

---

## 🔒 Security

- ✅ Passwords hashed with **bcryptjs** (salt rounds: 12)
- ✅ **JWT tokens** with expiry
- ✅ **Rate limiting** on auth routes
- ✅ **CORS** configured for specific origins
- ✅ Environment variables for all secrets
- ✅ `.env` never pushed to GitHub

---

## 📸 Screenshots

> Live Demo: [nexusai-2026.netlify.app](https://nexusai-2026.netlify.app)

---

## 👨‍💻 Author

**Muhammad Ahmad**
- Portfolio: [ahmad-ai-portfolio.netlify.app](https://ahmad-ai-portfolio.netlify.app)
- GitHub: [@AhmadMughal-web](https://github.com/AhmadMughal-web)
- Email: ahmadmughalweb@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ by Muhammad Ahmad**

*From pre-medical to full-stack AI developer — one project at a time.*

</div>
