import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'

const CARDS = [
  { icon: '📄', title: 'Build My CV',     desc: 'Create a professional resume',   prompt: 'Help me build a complete professional CV/Resume. Ask me about my experience, skills, and education.' },
  { icon: '🎯', title: 'Find Jobs',        desc: 'Match jobs to your skills',      prompt: 'Help me find jobs that match my skills. Ask me about my background and what I am looking for.' },
  { icon: '🗺️', title: 'Career Roadmap',  desc: 'Plan your future path',          prompt: 'Create a detailed career roadmap for me. Ask what field I want to go into and my current level.' },
  { icon: '⚡', title: 'Skill Analysis',  desc: 'Discover your strengths',        prompt: 'Analyze my skills and suggest what I should learn next. Ask me about my current skill set.' },
  { icon: '🎤', title: 'Interview Prep',  desc: 'Ace your next interview',        prompt: 'Help me prepare for a job interview. Ask what role and company I am interviewing for.' },
  { icon: '💡', title: 'Career Advice',   desc: 'Expert guidance anytime',        prompt: 'Give me expert career advice. I want to make smart decisions about my professional growth.' },
]

export default function WelcomeHero() {
  const { user }        = useAuth()
  const { sendMessage, streaming } = useChat()
  const firstName = user?.name?.split(' ')[0] || 'Explorer'

  const handleCard = (prompt) => {
    if (streaming) return
    sendMessage(prompt)
  }

  return (
    <div className="welcome-hero">
      <div className="hero-fx">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
      </div>

      <div className="hero-content">
        <div className="hero-logo-wrap">
          <div className="hero-logo"><span>N</span></div>
        </div>

        <h1 className="hero-title">
          Hello, <span className="hero-name">{firstName}</span>
        </h1>
        <p className="hero-sub">
          Your AI-powered career intelligence platform. What can I help you with today?
        </p>

        <div className="quick-grid">
          {CARDS.map((card) => (
            <button
              key={card.title}
              type="button"
              className="quick-card"
              onClick={() => handleCard(card.prompt)}
              disabled={streaming}
            >
              <span className="quick-icon">{card.icon}</span>
              <div className="quick-text">
                <strong>{card.title}</strong>
                <span>{card.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
