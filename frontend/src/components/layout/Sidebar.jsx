import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LogoutButton from './LogoutButton'
import SearchHistory from './SearchHistory'
import { SparklesIcon } from '../ui/Icons'
import '../../styles/sidebar.css'

export default function Sidebar({ open, onClose, onNewChat }) {
  const { user } = useAuth()

  const handleNewChat = () => {
    onNewChat()
    if (window.innerWidth <= 768) onClose()
  }

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>

      {/* Header — logo + X close button on mobile */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-mark sm"><span>N</span></div>
          <span className="logo-wordmark">NexusAI</span>
        </div>
        {/* Close button — sirf mobile pe dikhega */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
          ✕
        </button>
      </div>

      {/* New Search */}
      <button className="new-chat-btn" onClick={handleNewChat}>
        <SparklesIcon size={16} />
        <span>New Search</span>
        <div className="btn-shimmer" />
      </button>

      {/* History */}
      <SearchHistory onSelectChat={() => { if (window.innerWidth <= 768) onClose() }} />

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar-sm">
            {user?.name?.[0]?.toUpperCase() || 'G'}
          </div>
          <div className="user-info-sm">
            <span className="user-name-sm">{user?.name || 'Guest'}</span>
            <span className="user-role-sm">{user?.isGuest ? 'Guest Mode' : `@${user?.username}`}</span>
          </div>
        </div>
        <LogoutButton />
      </div>

    </aside>
  )
}
