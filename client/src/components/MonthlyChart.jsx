import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="card" style={{ padding: '12px 16px', minWidth: 140 }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 6 }}>
                    {label}
                </p>
                {payload.map((p) => (
                    <p key={p.name} style={{ color: p.color, fontSize: '0.875rem', fontWeight: 600 }}>
                        {p.name}: {p.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

function MonthlyChart({ data = [] }) {
    if (!data.length) {
        return (
            <div className="empty-state" style={{ padding: '32px' }}>
                <div className="icon">📊</div>
                <p>No monthly data yet</p>
            </div>
        )
    }

    // Format month labels like "Jan 24"
    const formatted = data.map(({ month, count, offers, rejections }) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        Applied: Number(count),
        Offers: Number(offers),
        Rejected: Number(rejections),
    }))

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'transparent' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'transparent' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8125rem' }} />
                <Bar dataKey="Applied" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offers" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default MonthlyChart
