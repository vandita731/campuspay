import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    // 1. call logout()
    // 2. navigate to '/login'
    await logout()
    navigate("/login")
  }

  return (
    <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="text-indigo-600 font-bold text-xl">💰 CampusPay</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-600 text-sm">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-gray-700"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}