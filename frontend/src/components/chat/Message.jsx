import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../context/AuthContext'

export default function Message({ message }) {
  const { user } = useAuth()
  const isAI = message.role === 'assistant'
  const initial = user?.name?.[0]?.toUpperCase() || 'Y'

  return (
    <div className={`message ${isAI ? 'message-ai' : 'message-user'}`}>
      <div className={`msg-avatar ${isAI ? 'avatar-ai' : 'avatar-user'}`}>
        {isAI ? 'N' : initial}
      </div>
      <div className="msg-body">
        <span className="msg-sender">{isAI ? 'NexusAI' : (user?.name?.split(' ')[0] || 'You')}</span>
        <div className={`msg-bubble ${isAI ? 'bubble-ai' : 'bubble-user'} ${message.isError ? 'bubble-error' : ''}`}>
          {isAI ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline
                    ? <code className="inline-code" {...props}>{children}</code>
                    : <pre className="code-block"><code {...props}>{children}</code></pre>
                },
                a({ href, children }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
      </div>
    </div>
  )
}
