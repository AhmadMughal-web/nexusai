import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/auth/AuthLayout'
import InputField from '../components/ui/InputField'
import Button from '../components/ui/Button'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = {}
    if (password.length < 8) e2.password = 'Password must be at least 8 characters.'
    if (password !== confirm) e2.confirm = 'Passwords do not match.'
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    try {
      await resetPassword(token, password)
      toast.success('Password reset successfully! 🔑')
      navigate('/')
    } catch (err) {
      setErrors({ form: err.message })
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="New Password" subtitle="Create a strong new password for your account">
      <form onSubmit={handleSubmit} noValidate>
        <InputField label="New Password" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters"
          value={password} onChange={setPassword} error={errors.password} icon="lock"
          onTogglePassword={() => setShowPw(s => !s)} showPassword={showPw} />
        <InputField label="Confirm Password" type={showPw ? 'text' : 'password'} placeholder="Repeat password"
          value={confirm} onChange={setConfirm} error={errors.confirm} icon="lock" />
        {errors.form && <p className="form-error">{errors.form}</p>}
        <Button type="submit" loading={loading} fullWidth>Reset Password</Button>
      </form>
    </AuthLayout>
  )
}
