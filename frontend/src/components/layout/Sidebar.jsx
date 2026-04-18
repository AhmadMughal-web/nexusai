import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useChat } from '../../context/ChatContext'
import LogoutButton from './LogoutButton'
import SearchHistory from './SearchHistory'
import { PlusIcon, SparklesIcon } from '../ui/Icons'
import '../../styles/sidebar.css'

export default function Sidebar({ open, onClose, onNewChat }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleNewChat = () => {
    onNewChat()
    if (window.innerWidth <= 768) onClose()
  }

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-mark sm"><span>N</span></div>
          <span className="logo-wordmark">NexusAI</span>
        </div>
      </div>

      {/* New Search Button */}
      <button className="new-chat-btn" onClick={handleNewChat}>
        <SparklesIcon size={16} />
        <span>New Search</span>
        <div className="btn-shimmer" />
      </button>

      {/* Search History */}
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
