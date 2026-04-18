export default function TypingIndicator() {
  return (
    <div className="message message-ai">
      <div className="msg-avatar avatar-ai">N</div>
      <div className="msg-body">
        <span className="msg-sender">NexusAI</span>
        <div className="msg-bubble bubble-ai typing-bubble">
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  )
}
