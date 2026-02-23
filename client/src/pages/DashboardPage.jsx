import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, TrendingUp, XCircle, Clock, Plus } from 'lucide-react'
import { dashboardAPI } from '../services/api.js'
import { getUser } from '../utils/auth.js'
import StatCard from '../components/StatCard.jsx'
import MonthlyChart from '../components/MonthlyChart.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

function ResultBadge({ result }) {
    const map = { offer: 'badge-offer', rejected: 'badge-rejected', pending: 'badge-pending' }
    return <span className={`badge ${map[result] || 'badge-pending'}`}>{result}</span>
}

function DashboardPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const user = getUser()

    useEffect(() => {
        dashboardAPI.getStats()
            .then(res => setStats(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <LoadingSpinner text="Loading dashboard..." />

    return (
        <div>
            <div className="page-header">
                <h1>Welcome back, {user?.name?.split(' ')[0] || 'there'}!</h1>
                <p>Here's your job search overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid-4 mb-8">
                <StatCard
                    icon={Briefcase}
                    value={stats?.total_applications ?? 0}
                    label="Total Applications"
                    accentColor="#0066cc"
                />
                <StatCard
                    icon={TrendingUp}
                    value={stats?.total_offers ?? 0}
                    label="Offers Received"
                    accentColor="#059669"
                />
                <StatCard
                    icon={XCircle}
                    value={stats?.total_rejections ?? 0}
                    label="Rejections"
                    accentColor="#dc2626"
                />
                <StatCard
                    icon={Clock}
                    value={`${stats?.success_rate ?? 0}%`}
                    label="Success Rate"
                    accentColor="#0ea5e9"
                />
            </div>

            <div className="grid-2 mb-8">
                {/* Monthly Chart */}
                <div className="chart-card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 20 }}>Monthly Applications</h3>
                    <MonthlyChart data={stats?.monthly ?? []} />
                </div>

                {/* Pipeline stats */}
                <div className="card">
                    <div className="section-title" style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 20 }}>Pipeline Summary</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-secondary)' }}>Active Applications</span>
                            <strong>{stats?.active_pipeline ?? 0}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-secondary)' }}>Total Pending</span>
                            <strong>{stats?.total_pending ?? 0}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                            <span style={{ color: 'var(--text-secondary)' }}>Offer Rate</span>
                            <strong style={{ color: 'var(--success)' }}>{stats?.success_rate ?? 0}%</strong>
                        </div>
                        <div className="divider" style={{ margin: '4px 0' }} />
                        <Link to="/applications/new" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                            + New Application
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recent Applications */}
            {stats?.recent_applications?.length > 0 && (
                <div className="card">
                    <div className="flex justify-between items-center mb-4" style={{ marginBottom: 20 }}>
                        <div className="section-title" style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Recent Applications</div>
                        <Link to="/applications" className="btn btn-secondary btn-sm">View All</Link>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Company', 'Role', 'Date', 'Stage', 'Result'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent_applications.map((app) => (
                                <tr
                                    key={app.id}
                                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                    onClick={() => window.location.href = `/applications/${app.id}`}
                                >
                                    <td style={{ padding: '12px', fontWeight: 600 }}>{app.company_name}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{app.job_title}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {new Date(app.application_date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        {app.current_stage_name || '—'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <ResultBadge result={app.final_result} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Zero state */}
            {stats?.total_applications === 0 && (
                <div className="empty-state">
                    <div className="icon">🚀</div>
                    <h3>Start tracking your applications!</h3>
                    <p>Add your first job application to begin your journey.</p>
                    <Link to="/applications/new" className="btn btn-primary btn-lg">
                        + Add First Application
                    </Link>
                </div>
            )}
        </div>
    )
}

export default DashboardPage
