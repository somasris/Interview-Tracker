function StatCard({ icon, value, label, accentColor = 'var(--primary)' }) {
    return (
        <div
            className="stat-card"
            style={{
                '--accent-gradient': `linear-gradient(90deg, ${accentColor}, transparent)`,
            }}
        >
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value ?? '—'}</div>
            <div className="stat-label">{label}</div>
        </div>
    )
}

export default StatCard
