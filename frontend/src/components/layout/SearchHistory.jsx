import { useNavigate, useParams } from 'react-router-dom'
import { useChat } from '../../context/ChatContext'
import { TrashIcon, MessageIcon } from '../ui/Icons'

export default function SearchHistory({ onSelectChat }) {
  const { chats, deleteChat, loadChat, currentChat } = useChat()
  const navigate = useNavigate()
  const { chatId } = useParams()

  const handleSelect = (chat) => {
    navigate(`/chat/${chat.id}`)
    onSelectChat?.()
  }

  const handleDelete = async (e, chatId) => {
    e.stopPropagation()
    if (confirm('Delete this search?')) await deleteChat(chatId)
  }

  if (chats.length === 0) {
    return (
      <div className="history-section">
        <p className="history-label">Recent Searches</p>
        <div className="history-empty">
          <MessageIcon size={20} />
          <span>No searches yet</span>
        </div>
      </div>
    )
  }

  // Group by date
  const now = new Date()
  const today = [], yesterday = [], older = []
  chats.forEach(chat => {
    const d = new Date(chat.updatedAt || chat.createdAt)
    const diff = Math.floor((now - d) / 86400000)
    if (diff === 0) today.push(chat)
    else if (diff === 1) yesterday.push(chat)
    else older.push(chat)
  })

  const Group = ({ label, items }) => items.length === 0 ? null : (
    <div className="history-group">
      <p className="history-label">{label}</p>
      {items.map(chat => (
        <div
          key={chat.id}
          className={`history-item ${(chatId === chat.id || currentChat?.id === chat.id) ? 'active' : ''}`}
          onClick={() => handleSelect(chat)}
        >
          <MessageIcon size={14} className="history-icon" />
          <span className="history-title">{chat.title}</span>
          <button className="history-delete" onClick={(e) => handleDelete(e, chat.id)} title="Delete">
            <TrashIcon size={13} />
          </button>
        </div>
      ))}
    </div>
  )

  return (
    <div className="history-section">
      <Group label="Today" items={today} />
      <Group label="Yesterday" items={yesterday} />
      <Group label="Earlier" items={older} />
    </div>
  )
}
