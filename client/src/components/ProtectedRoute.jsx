import { Navigate, Outlet } from 'react-router-dom'
import { isLoggedIn } from '../utils/auth.js'
import Navbar from './Navbar.jsx'

/**
 * Wraps protected routes — redirects to /login if not authenticated.
 * Also renders the sidebar layout.
 */
function ProtectedRoute() {
    if (!isLoggedIn()) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="app-layout">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}

export default ProtectedRoute
