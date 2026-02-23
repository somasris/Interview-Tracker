import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../utils/auth.js'
import { BarChart3, FileText, TrendingUp, LogOut, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

const navItems = [
    { to: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { to: '/applications', icon: Briefcase, label: 'Applications' },
    { to: '/analytics', icon: TrendingUp, label: 'Analytics' },
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
                <Briefcase size={24} style={{ marginRight: 8 }} />
                <span>Career Tracker</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `sidebar-link${isActive ? ' active' : ''}`
                        }
                    >
                        <Icon size={18} />
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
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}

export default Navbar
