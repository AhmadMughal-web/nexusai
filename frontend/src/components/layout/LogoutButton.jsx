import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogoutIcon } from '../ui/Icons'

export default function LogoutButton() {
  const { logoutManual } = useAuth()
  const navigate = useNavigate()

  const handle = () => {
    if (!window.confirm('Are you sure you want to logout?')) return
    logoutManual()
    navigate('/login')
  }

  return (
    <button className="logout-btn" onClick={handle} type="button">
      <LogoutIcon size={16} />
      <span>Logout</span>
    </button>
  )
}
