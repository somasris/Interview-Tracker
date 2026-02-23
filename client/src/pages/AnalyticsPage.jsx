import { useState, useEffect } from 'react'
import { dashboardAPI } from '../services/api.js'
import MonthlyChart from '../components/MonthlyChart.jsx'
import StatCard from '../components/StatCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'

const OUTCOME_COLORS = ['#8b5cf6', '#10b981', '#ef4444']

function AnalyticsPage() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dashboardAPI.getStats()
            .then(res => setStats(res.data.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <LoadingSpinner text="Loading analytics..." />

    const pieData = [
        { name: 'Pending', value: Number(stats?.total_pending ?? 0) },
        { name: 'Offers', value: Number(stats?.total_offers ?? 0) },
        { name: 'Rejected', value: Number(stats?.total_rejections ?? 0) },
    ].filter(d => d.value > 0)

    const areaData = (stats?.monthly ?? []).map(({ month, count, offers, rejections }) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        Applied: Number(count),
        Offers: Number(offers),
        Rejected: Number(rejections),
    }))

    return (
        <div>
            <div className="page-header">
                <h1>📈 Analytics</h1>
                <p>Insights into your job search performance</p>
            </div>

            {/* Top stats */}
            <div className="grid-4 mb-8" style={{ marginBottom: 32 }}>
                <StatCard icon="📁" value={stats?.total_applications ?? 0} label="Total Applications" accentColor="var(--primary)" />
                <StatCard icon="🎉" value={stats?.total_offers ?? 0} label="Total Offers" accentColor="var(--success)" />
                <StatCard icon="❌" value={stats?.total_rejections ?? 0} label="Total Rejections" accentColor="var(--danger)" />
                <StatCard icon="📊" value={`${stats?.success_rate ?? 0}%`} label="Success Rate" accentColor="var(--secondary)" />
            </div>

            <div className="grid-2 mb-8" style={{ marginBottom: 32 }}>
                {/* Outcome distribution pie */}
                <div className="chart-card">
                    <h3>🥧 Outcome Distribution</h3>
                    {pieData.length === 0 ? (
                        <div className="empty-state" style={{ padding: '24px' }}>
                            <p>No data yet</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: 'rgba(99,102,241,0.4)' }}
                                >
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={OUTCOME_COLORS[i % OUTCOME_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1e1e35', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10 }}
                                    itemStyle={{ color: '#f1f5f9' }}
                                />
                                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8125rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Key metrics */}
                <div className="card">
                    <div className="section-title">📐 Key Metrics</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[
                            {
                                label: 'Offer Rate',
                                value: `${stats?.success_rate ?? 0}%`,
                                bar: stats?.success_rate ?? 0,
                                color: 'var(--success)',
                            },
                            {
                                label: 'Rejection Rate',
                                value: stats?.total_applications
                                    ? `${Math.round((stats.total_rejections / stats.total_applications) * 100)}%`
                                    : '0%',
                                bar: stats?.total_applications
                                    ? Math.round((stats.total_rejections / stats.total_applications) * 100)
                                    : 0,
                                color: 'var(--danger)',
                            },
                            {
                                label: 'Active Pipeline',
                                value: stats?.active_pipeline ?? 0,
                                bar: stats?.total_applications
                                    ? Math.round((stats.active_pipeline / stats.total_applications) * 100)
                                    : 0,
                                color: 'var(--primary)',
                            },
                        ].map(m => (
                            <div key={m.label}>
                                <div className="flex justify-between items-center" style={{ marginBottom: 6 }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{m.label}</span>
                                    <strong style={{ fontSize: '1rem' }}>{m.value}</strong>
                                </div>
                                <div style={{ height: 6, borderRadius: 9999, background: 'var(--bg-elevated)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min(m.bar, 100)}%`, background: m.color, borderRadius: 9999, transition: 'width 0.5s ease' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Area chart */}
            <div className="chart-card mb-8" style={{ marginBottom: 32 }}>
                <h3>📈 Application Trend (Last 12 months)</h3>
                {areaData.length === 0 ? (
                    <div className="empty-state" style={{ padding: '24px' }}>
                        <p>No data yet — start adding applications!</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={areaData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'transparent' }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'transparent' }} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ background: '#1e1e35', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10 }}
                                itemStyle={{ color: '#f1f5f9' }}
                            />
                            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8125rem' }} />
                            <Area type="monotone" dataKey="Applied" stroke="#6366f1" fill="url(#colorApplied)" strokeWidth={2} dot={false} />
                            <Area type="monotone" dataKey="Offers" stroke="#10b981" fill="url(#colorOffers)" strokeWidth={2} dot={false} />
                            <Area type="monotone" dataKey="Rejected" stroke="#ef4444" fill="transparent" strokeWidth={2} strokeDasharray="4 2" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Monthly table */}
            {areaData.length > 0 && (
                <div className="chart-card">
                    <h3>📋 Monthly Breakdown</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Month', 'Applied', 'Offers', 'Rejected', 'Success Rate'].map(h => (
                                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 600 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {areaData.map((row) => (
                                <tr key={row.month} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{row.month}</td>
                                    <td style={{ padding: '10px 12px' }}>{row.Applied}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--success)' }}>{row.Offers}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--danger)' }}>{row.Rejected}</td>
                                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                                        {row.Applied > 0 ? `${Math.round((row.Offers / row.Applied) * 100)}%` : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AnalyticsPage
