import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '../../context/AuthContext'
import { downloadAsPDF } from '../../utils/pdfExport'

export default function Message({ message }) {
  const { user } = useAuth()
  const isAI = message.role === 'assistant'
  const initial = user?.name?.[0]?.toUpperCase() || 'Y'
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)

  // Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  // Download as PDF
  const handleDownload = async () => {
    setDownloading(true)
    try {
      await downloadAsPDF(message.content, 'NexusAI-Export.pdf')
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF mein error aaya. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className={`message ${isAI ? 'message-ai' : 'message-user'}`}>
      <div className={`msg-avatar ${isAI ? 'avatar-ai' : 'avatar-user'}`}>
        {isAI ? 'N' : initial}
      </div>

      <div className="msg-body">
        <span className="msg-sender">
          {isAI ? 'NexusAI' : (user?.name?.split(' ')[0] || 'You')}
        </span>

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

        {/* Action buttons — sirf AI messages pe */}
        {isAI && !message.isError && (
          <div className="msg-actions">
            {/* Copy button */}
            <button
              className={`msg-action-btn ${copied ? 'action-success' : ''}`}
              onClick={handleCopy}
              title="Copy text"
            >
              {copied ? '✓ Copied!' : '⎘ Copy'}
            </button>

            {/* PDF Download button */}
            <button
              className={`msg-action-btn pdf-btn ${downloaded ? 'action-success' : ''}`}
              onClick={handleDownload}
              disabled={downloading}
              title="Download as PDF"
            >
              {downloading ? (
                <><span className="pdf-spinner" /> Generating...</>
              ) : downloaded ? (
                '✓ Downloaded!'
              ) : (
                '⬇ Download PDF'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
