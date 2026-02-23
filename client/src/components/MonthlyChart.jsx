import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="card" style={{ padding: '12px 16px', minWidth: 140 }}>
                <p style={{ color: '#64748b', fontSize: '0.8125rem', marginBottom: 6 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'transparent' }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: 'transparent' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Legend wrapperStyle={{ color: '#64748b', fontSize: '0.8125rem' }} />
                <Bar dataKey="Applied" fill="#0066cc" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Offers" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Rejected" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

export default MonthlyChart
