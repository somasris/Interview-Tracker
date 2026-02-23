import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api.js'
import { setToken, setUser } from '../utils/auth.js'

function RegisterPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        setLoading(true)
        try {
            const res = await authAPI.register(form)
            const { token, user } = res.data.data
            setToken(token)
            setUser(user)
            toast.success('Account created successfully!')
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.')
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
                    <p>Organize your job search easily</p>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 24, color: 'var(--text-primary)' }}>
                    Create your account
                </h2>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            className="form-control"
                            type="text"
                            name="name"
                            placeholder="John Doe"
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

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
                            placeholder="Minimum 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ width: '100%', marginTop: 16 }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer" style={{ marginTop: 24, textAlign: 'center' }}>
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage
