import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.identifier.trim()) e.identifier = 'Email or username is required.'
    if (!form.password) e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await login(form.identifier, form.password)
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      setErrors({ form: err.message })
    } finally { setLoading(false) }
  }

  const handleGuest = () => {
    loginAsGuest()
    toast.success('Continuing as Guest 🚀')
    navigate('/')
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your intelligent workspace">
      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Email or Username"
          type="text"
          placeholder="you@example.com or username"
          value={form.identifier}
          onChange={v => setForm(f => ({ ...f, identifier: v }))}
          error={errors.identifier}
          autoComplete="username"
          icon="user"
        />
        <InputField
          label="Password"
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={v => setForm(f => ({ ...f, password: v }))}
          error={errors.password}
          autoComplete="current-password"
          icon="lock"
          onTogglePassword={() => setShowPw(s => !s)}
          showPassword={showPw}
        />
        {errors.form && <p className="form-error">{errors.form}</p>}
        <div className="forgot-row">
          <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} fullWidth>Sign In</Button>
      </form>

      <div className="auth-divider"><span>or</span></div>
      <button className="guest-btn" onClick={handleGuest}>Continue as Guest</button>
      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </AuthLayout>
  )
}
