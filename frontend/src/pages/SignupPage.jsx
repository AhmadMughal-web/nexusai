import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.length < 2) e.name = 'Full name must be at least 2 characters.'
    if (!form.username.trim() || form.username.length < 3) e.username = 'Username must be at least 3 characters.'
    if (!/^[a-z0-9_]+$/i.test(form.username)) e.username = 'Only letters, numbers, and underscores allowed.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Please enter a valid email address.'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form.name, form.username, form.email, form.password)
      toast.success('Account created! Welcome to NexusAI 🎉')
      navigate('/')
    } catch (err) {
      setErrors({ form: err.message })
    } finally { setLoading(false) }
  }

  const set = (key) => (v) => setForm(f => ({ ...f, [key]: v }))

  return (
    <AuthLayout title="Join NexusAI" subtitle="Create your intelligent career workspace">
      <form onSubmit={handleSubmit} noValidate>
        <InputField label="Full Name" type="text" placeholder="John Doe"
          value={form.name} onChange={set('name')} error={errors.name} icon="user" />
        <InputField label="Username" type="text" placeholder="johndoe"
          value={form.username} onChange={set('username')} error={errors.username} icon="at" />
        <InputField label="Email" type="email" placeholder="you@example.com"
          value={form.email} onChange={set('email')} error={errors.email} icon="mail" autoComplete="email" />
        <InputField label="Password" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
          value={form.password} onChange={set('password')} error={errors.password} icon="lock"
          onTogglePassword={() => setShowPw(s => !s)} showPassword={showPw} autoComplete="new-password" />
        {errors.form && <p className="form-error">{errors.form}</p>}
        <Button type="submit" loading={loading} fullWidth>Create Account</Button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  )
}
