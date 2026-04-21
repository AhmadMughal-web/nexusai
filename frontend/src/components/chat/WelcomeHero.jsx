import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'

const CARDS = [
  { icon: '📄', title: 'Build My CV',    prompt: 'Help me build a complete professional CV/Resume.' },
  { icon: '🎯', title: 'Find Jobs',       prompt: 'Help me find jobs that match my skills. Ask me about my background.' },
  { icon: '🗺️', title: 'Career Roadmap', prompt: 'Create a career roadmap for me. Ask what field I want to go into.' },
  { icon: '⚡', title: 'Skill Analysis', prompt: 'Analyze my skills and suggest what I should learn next.' },
  { icon: '🎤', title: 'Interview Prep', prompt: 'Help me prepare for a job interview. Ask what role I am applying for.' },
  { icon: '💡', title: 'Career Advice',  prompt: 'Give me expert career advice for my professional growth.' },
]

export default function WelcomeHero() {
  const { user } = useAuth()
  const { sendMessage, streaming } = useChat()
  const firstName = user?.name?.split(' ')[0] || 'Explorer'

  return (
    <div className="welcome-hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Hello, <span className="hero-name">{firstName}</span>
        </h1>
        <p className="hero-sub">
          Your AI-powered career intelligence platform. What can I help you with today?
        </p>
        <div className="quick-grid">
          {CARDS.map(card => (
            <button
              key={card.title}
              type="button"
              className="quick-card"
              onClick={() => sendMessage(card.prompt)}
              disabled={streaming}
            >
              <span className="quick-icon">{card.icon}</span>
              <div className="quick-text">
                <strong>{card.title}</strong>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
