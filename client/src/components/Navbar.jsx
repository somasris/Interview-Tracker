import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../utils/auth.js'
import toast from 'react-hot-toast'

const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/applications', icon: '📁', label: 'Applications' },
    { to: '/analytics', icon: '📈', label: 'Analytics' },
]

function Navbar() {
    const navigate = useNavigate()
    const user = getUser()
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : '?'

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <span>🎯 Interview Tracker</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <span className="icon">{icon}</span>
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-user">
                <div className="sidebar-user-info">
                    <div className="user-avatar">{initials}</div>
                    <div>
                        <div className="user-name">{user?.name || 'User'}</div>
                        <div className="user-email">{user?.email || ''}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>
    )
}

export default Navbar
