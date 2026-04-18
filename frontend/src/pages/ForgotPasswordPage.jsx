import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await forgotPassword(email)
      setSuccess(data.message)
    } catch (err) {
      setError(err.message)
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="We'll send a reset link to your email">
      {success ? (
        <div className="success-box">
          <div className="success-icon">✉️</div>
          <p>{success}</p>
          <p className="success-note">Check your spam folder if you don't see it in a few minutes.</p>
          <Link to="/login" className="back-link">← Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <InputField label="Email Address" type="email" placeholder="you@example.com"
            value={email} onChange={setEmail} error={error} icon="mail" autoComplete="email" />
          <Button type="submit" loading={loading} fullWidth>Send Reset Link</Button>
          <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
        </form>
      )}
    </AuthLayout>
  )
}
