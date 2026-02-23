import { Link } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, CheckCircle } from 'lucide-react'

function ResultBadge({ result }) {
    const map = {
        offer: { cls: 'badge-offer', text: 'Offer' },
        rejected: { cls: 'badge-rejected', text: 'Rejected' },
        pending: { cls: 'badge-pending', text: 'Pending' },
    }
    const { cls, text } = map[result] || map.pending
    return <span className={`badge ${cls}`}>{text}</span>
}

function ApplicationCard({ app, onDelete }) {
    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

    const formatSalary = (min, max) => {
        if (!min && !max) return null
        if (min && max) return `$${Number(min).toLocaleString()} – $${Number(max).toLocaleString()}`
        if (min) return `From $${Number(min).toLocaleString()}`
        return `Up to $${Number(max).toLocaleString()}`
    }

    const salary = formatSalary(app.salary_min, app.salary_max)

    return (
        <div className="app-card">
            <div className="app-card-header">
                <div>
                    <div className="app-company">{app.company_name}</div>
                    <div className="app-role">{app.job_title}</div>
                </div>
                <ResultBadge result={app.final_result} />
            </div>

            <div className="app-meta">
                {app.location && (
                    <span className="app-meta-item">
                        <MapPin size={16} />
                        {app.location}
                    </span>
                )}
                <span className="app-meta-item">
                    <Calendar size={16} />
                    {formatDate(app.application_date)}
                </span>
                {salary && (
                    <span className="app-meta-item">
                        <DollarSign size={16} />
                        {salary}
                    </span>
                )}
                {app.current_stage_name && (
                    <span className="app-meta-item">
                        <CheckCircle size={16} />
                        {app.current_stage_name}
                    </span>
                )}
            </div>

            <div className="app-actions">
                <Link
                    to={`/applications/${app.id}`}
                    className="btn btn-secondary btn-sm"
                >
                    View Details
                </Link>
                {app.job_link && (
                    <a
                        href={app.job_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                    >
                        🔗 Job Link
                    </a>
                )}
                <button
                    className="btn btn-danger btn-sm"
                    onClick={(e) => { e.preventDefault(); onDelete(app.id) }}
                    style={{ marginLeft: 'auto' }}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default ApplicationCard
