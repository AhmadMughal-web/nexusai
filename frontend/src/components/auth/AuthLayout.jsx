import '../../styles/auth.css'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="grid-overlay" />
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-mark"><span>N</span></div>
          <span className="logo-wordmark">NexusAI</span>
        </div>

        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        <div className="auth-body">{children}</div>
      </div>
    </div>
  )
}
