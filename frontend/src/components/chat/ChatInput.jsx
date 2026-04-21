import { useState, useRef, useCallback } from 'react'
import { useChat } from '../../context/ChatContext'
import { SendIcon } from '../ui/Icons'

const HINTS = [
  { label: '📄 CV Builder',     text: 'Help me build a complete CV/Resume.' },
  { label: '🗺️ Career Roadmap', text: 'Create a career roadmap for becoming a ' },
  { label: '🎯 Job Finder',     text: 'Find jobs matching my skills: ' },
  { label: '🎤 Interview Prep', text: 'Help me prep for an interview at ' },
]

export default function ChatInput() {
  const { sendMessage, streaming } = useChat()
  const [text, setText] = useState('')
  const ref = useRef(null)

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  const handleChange = (e) => { setText(e.target.value); resize() }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const submit = useCallback(() => {
    const msg = text.trim()
    if (!msg || streaming) return
    setText('')
    if (ref.current) ref.current.style.height = 'auto'
    sendMessage(msg)
  }, [text, streaming, sendMessage])

  const applyHint = (t) => { setText(t); ref.current?.focus(); setTimeout(resize, 0) }

  return (
    <div className="chat-input-area">
      <div className="chat-input-wrap">
        {/* Hint chips — above input */}
        <div className="hint-chips-row">
          {HINTS.map(h => (
            <button key={h.label} className="hint-chip" type="button"
              onClick={() => applyHint(h.text)} disabled={streaming}>
              {h.label}
            </button>
          ))}
        </div>
        {/* Input + Send — same row */}
        <div className="input-box">
          <textarea ref={ref} value={text} onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message NexusAI..."
            rows={1} disabled={streaming} autoComplete="off"
          />
          <div className="input-footer">
            <button type="button" className="send-btn"
              onClick={submit} disabled={!text.trim() || streaming} aria-label="Send">
              {streaming ? <div className="send-spinner" /> : <SendIcon size={14} />}
            </button>
          </div>
        </div>
        <p className="input-note">NexusAI · Powered by Groq Llama 3.3 70B</p>
      </div>
    </div>
  )
}
