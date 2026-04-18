import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useChat } from '../../context/ChatContext'
import { MenuIcon, SunIcon, MoonIcon } from '../ui/Icons'

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { currentChat } = useChat()

  const title = currentChat?.title && currentChat.messages.length > 0
    ? currentChat.title
    : 'NexusAI'

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
        <MenuIcon size={20} />
      </button>

      <h2 className="topbar-title" title={title}>{title}</h2>

      <div className="topbar-actions">
        <button className="theme-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        <div className="topbar-user">
          <div className="user-avatar-top">
            {user?.name?.[0]?.toUpperCase() || 'G'}
          </div>
          <span className="user-name-top">{user?.name?.split(' ')[0] || 'Guest'}</span>
        </div>
      </div>
    </header>
  )
}
