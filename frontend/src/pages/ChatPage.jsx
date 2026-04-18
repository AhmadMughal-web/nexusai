import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import Sidebar    from '../components/layout/Sidebar'
import TopBar     from '../components/layout/TopBar'
import ChatWindow from '../components/chat/ChatWindow'
import ChatInput  from '../components/chat/ChatInput'
import WelcomeHero from '../components/chat/WelcomeHero'
import '../styles/chat.css'

export default function ChatPage() {
  const { chatId }  = useParams()
  const navigate    = useNavigate()
  const { currentChat, loadChat, fetchChats, newChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const fetchedRef = useRef(false)

  // Fetch sidebar once on mount
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchChats()
    }
  }, [fetchChats])

  // Load chat when URL chatId changes
  useEffect(() => {
    if (chatId) {
      loadChat(chatId)
    } else {
      newChat()
    }
  }, [chatId]) // eslint-disable-line

  const handleNewChat = () => {
    newChat()
    navigate('/')
    if (window.innerWidth <= 768) setSidebarOpen(false)
  }

  // Show welcome if no chat or empty messages
  const showWelcome = !currentChat || currentChat.messages.length === 0

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
      />

      <div className="main-content">
        <TopBar onMenuClick={() => setSidebarOpen(s => !s)} />

        <div className="chat-area">
          {showWelcome ? <WelcomeHero /> : <ChatWindow />}
        </div>

        <ChatInput />
      </div>
    </div>
  )
}
