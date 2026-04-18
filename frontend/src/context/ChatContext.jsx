import { createContext, useContext, useState, useCallback, useRef } from 'react'
import api from '../services/api'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { user, logout } = useAuth()
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)

  // Always-fresh ref — avoids stale closure in callbacks
  const chatRef = useRef(null)
  chatRef.current = currentChat

  // ─── 401 handler ──────────────────────────────────────────
  const on401 = useCallback(() => {
    logout()
  }, [logout])

  // ─── Fetch sidebar history ─────────────────────────────────
  const fetchChats = useCallback(async () => {
    if (!user || user.isGuest) return
    try {
      const { data } = await api.get('/chat')
      setChats(data.chats || [])
    } catch (e) {
      if (e.status === 401) on401()
    }
  }, [user, on401])

  // ─── Create a new chat session ─────────────────────────────
  const createChat = useCallback(async (title = 'New Search') => {
    // Guest — local only, no API call
    if (user?.isGuest) {
      const chat = { id: 'g_' + Date.now(), title, messages: [], createdAt: new Date().toISOString() }
      setCurrentChat(chat)
      chatRef.current = chat
      return chat
    }
    // Logged-in user
    const { data } = await api.post('/chat', { title })
    const chat = { ...data.chat, messages: data.chat.messages || [] }
    setChats(prev => [data.chat, ...prev])
    setCurrentChat(chat)
    chatRef.current = chat
    return chat
  }, [user])

  // ─── Load existing chat ────────────────────────────────────
  const loadChat = useCallback(async (chatId) => {
    if (user?.isGuest) return
    setLoading(true)
    try {
      const { data } = await api.get(`/chat/${chatId}`)
      setCurrentChat(data.chat)
      chatRef.current = data.chat
    } catch (e) {
      if (e.status === 401) on401()
    } finally {
      setLoading(false)
    }
  }, [user, on401])

  // ─── Delete chat ───────────────────────────────────────────
  const deleteChat = useCallback(async (chatId) => {
    if (!user?.isGuest) {
      try { await api.delete(`/chat/${chatId}`) }
      catch (e) { if (e.status === 401) { on401(); return } }
    }
    setChats(prev => prev.filter(c => c.id !== chatId))
    if (chatRef.current?.id === chatId) {
      setCurrentChat(null)
      chatRef.current = null
    }
  }, [user, on401])

  // ─── MAIN: Send message ────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || streaming) return

    // ── Step 1: ensure a chat exists ──────────────────────────
    let chat = chatRef.current
    if (!chat) {
      try {
        chat = await createChat(trimmed.slice(0, 50))
      } catch (e) {
        if (e.status === 401) { on401(); return }
        // Show error in UI even without a chat
        console.error('createChat failed:', e.message)
        return
      }
    }

    // ── Step 2: show user message instantly ───────────────────
    const userMsg = { role: 'user', content: trimmed, createdAt: new Date().toISOString() }
    const isFirst = chat.messages.length === 0
    const title = isFirst ? trimmed.slice(0, 50) + (trimmed.length > 50 ? '…' : '') : chat.title

    const optimistic = { ...chat, title, messages: [...chat.messages, userMsg] }
    setCurrentChat(optimistic)
    chatRef.current = optimistic

    if (isFirst) {
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, title } : c))
    }

    // ── Step 3: call backend ───────────────────────────────────
    setStreaming(true)
    try {
      const { data } = await api.post('/chat/message', {
        chatId: chat.id,
        message: trimmed,
        messages: chat.messages.map(m => ({ role: m.role, content: m.content })),
      })

      const aiMsg = { role: 'assistant', content: data.reply, createdAt: new Date().toISOString() }

      setCurrentChat(prev => prev
        ? { ...prev, messages: [...prev.messages, aiMsg] }
        : null
      )

      // Bubble to top of sidebar
      setChats(prev => {
        const found = prev.find(c => c.id === chat.id)
        if (!found) return prev
        return [
          { ...found, title, updatedAt: new Date().toISOString() },
          ...prev.filter(c => c.id !== chat.id),
        ]
      })

    } catch (err) {
      if (err.status === 401) { on401(); return }

      // Show error as AI message
      const errMsg = {
        role: 'assistant',
        content: `⚠️ **${err.message || 'Something went wrong. Please try again.'}**`,
        createdAt: new Date().toISOString(),
        isError: true,
      }
      setCurrentChat(prev => prev
        ? { ...prev, messages: [...prev.messages, errMsg] }
        : null
      )
    } finally {
      setStreaming(false)
    }
  }, [streaming, createChat, on401])

  // ─── Reset to welcome screen ───────────────────────────────
  const newChat = useCallback(() => {
    setCurrentChat(null)
    chatRef.current = null
  }, [])

  return (
    <ChatContext.Provider value={{
      chats, currentChat, loading, streaming,
      fetchChats, createChat, loadChat, deleteChat, sendMessage, newChat,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
