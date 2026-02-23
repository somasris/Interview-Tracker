import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api.js'
import { setToken, setUser } from '../utils/auth.js'

function LoginPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await authAPI.login(form)
            const { token, user } = res.data.data
            setToken(token)
            setUser(user)
            toast.success(`Welcome back, ${user.name}!`)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                        <Briefcase size={28} color="#0066cc" />
                    </div>
                    <h1>Career Tracker</h1>
                    <p>Organize your job search in one place</p>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>
                    Sign in to your account
                </h2>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            className="form-control"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-control"
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: 24, textAlign: 'center' }}>
                    Don't have an account?{' '}
                    <Link to="/register">Create one</Link>
                </div>

                <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>Demo Account</strong>
                    <div>Email: demo@example.com</div>
                    <div>Password: password123</div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
