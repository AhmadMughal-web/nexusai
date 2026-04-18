import { useEffect, useRef } from 'react'
import { useChat } from '../../context/ChatContext'
import Message from './Message'
import TypingIndicator from './TypingIndicator'

export default function ChatWindow() {
  const { currentChat, streaming } = useChat()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentChat?.messages, streaming])

  return (
    <div className="chat-window">
      <div className="messages-list">
        {currentChat?.messages?.map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
        {streaming && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
