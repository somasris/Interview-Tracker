function StatCard({ icon: Icon, value, label, accentColor = 'var(--primary)' }) {
    return (
        <div
            className="stat-card"
            style={{
                '--accent-color': accentColor,
            }}
        >
            <div className="stat-icon">
                {typeof Icon === 'function' ? <Icon size={32} /> : Icon}
            </div>
            <div className="stat-value">{value ?? '—'}</div>
            <div className="stat-label">{label}</div>
        </div>
    )
}

export default StatCard
