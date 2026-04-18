import { useState, useRef, useCallback } from 'react'
import { useChat } from '../../context/ChatContext'
import { SendIcon } from '../ui/Icons'

const HINTS = [
  { label: '📄 CV Builder',    text: 'Help me build a complete professional CV/Resume.' },
  { label: '🗺️ Roadmap',       text: 'Create a step-by-step career roadmap for becoming a ' },
  { label: '🎯 Job Finder',    text: 'Find jobs that match my skills: ' },
  { label: '🎤 Interview Prep', text: 'Help me prepare for a job interview at ' },
]

export default function ChatInput() {
  const { sendMessage, streaming } = useChat()
  const [text, setText] = useState('')
  const ref  = useRef(null)

  // Resize textarea as user types
  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const handleChange = (e) => {
    setText(e.target.value)
    resize()
  }

  // Send on Enter (Shift+Enter = new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = useCallback(() => {
    const msg = text.trim()
    if (!msg || streaming) return
    setText('')
    // Reset height
    if (ref.current) ref.current.style.height = 'auto'
    sendMessage(msg)        // fire and forget — ChatContext handles state
  }, [text, streaming, sendMessage])

  const applyHint = (hint) => {
    setText(hint)
    ref.current?.focus()
    // Resize after state update
    setTimeout(resize, 0)
  }

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrap">
        <div className="input-box">
          <textarea
            ref={ref}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — CV, jobs, roadmap, career advice..."
            rows={1}
            disabled={streaming}
            autoComplete="off"
          />
          <div className="input-footer">
            <div className="hint-chips">
              {HINTS.map(h => (
                <button
                  key={h.label}
                  className="hint-chip"
                  type="button"
                  onClick={() => applyHint(h.text)}
                  disabled={streaming}
                >
                  {h.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="send-btn"
              onClick={submit}
              disabled={!text.trim() || streaming}
              aria-label="Send message"
            >
              {streaming
                ? <div className="send-spinner" />
                : <SendIcon size={16} />
              }
            </button>
          </div>
        </div>
        <p className="input-note">
          NexusAI · Powered by Groq Llama 3.3 · 70B
        </p>
      </div>
    </div>
  )
}
