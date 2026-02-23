import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { applicationsAPI, stagesAPI } from '../services/api.js'
import StageTimeline from '../components/StageTimeline.jsx'
import StageForm from '../components/StageForm.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

function ResultBadge({ result }) {
    const map = { offer: 'badge-offer', rejected: 'badge-rejected', pending: 'badge-pending' }
    return <span className={`badge ${map[result] || 'badge-pending'}`}>{result}</span>
}

function ApplicationDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [app, setApp] = useState(null)
    const [stages, setStages] = useState([])
    const [loading, setLoading] = useState(true)
    const [showStageForm, setShowStageForm] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState({})

    const fetchData = useCallback(async () => {
        try {
            const [appRes, stagesRes] = await Promise.all([
                applicationsAPI.getById(id),
                stagesAPI.getAll(id),
            ])
            setApp(appRes.data.data)
            setStages(stagesRes.data.data)
            setEditForm({
                company_name: appRes.data.data.company_name,
                job_title: appRes.data.data.job_title,
                location: appRes.data.data.location || '',
                application_date: appRes.data.data.application_date?.split('T')[0] || '',
                salary_min: appRes.data.data.salary_min || '',
                salary_max: appRes.data.data.salary_max || '',
                job_link: appRes.data.data.job_link || '',
                notes: appRes.data.data.notes || '',
                final_result: appRes.data.data.final_result,
            })
        } catch {
            toast.error('Failed to load application')
            navigate('/applications')
        } finally {
            setLoading(false)
        }
    }, [id, navigate])

    useEffect(() => { fetchData() }, [fetchData])

    const handleCompleteStage = async (stageId) => {
        const resultInput = prompt('Mark result for this stage:\n(pass / fail / pending)', 'pass')
        if (!resultInput) return
        if (!['pass', 'fail', 'pending'].includes(resultInput.trim())) {
            toast.error("Enter 'pass', 'fail', or 'pending'")
            return
        }
        setActionLoading(true)
        try {
            await stagesAPI.complete(stageId, { result: resultInput.trim() })
            toast.success('Stage completed!')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete stage')
        } finally {
            setActionLoading(false)
        }
    }

    const handleMoveNext = async () => {
        setActionLoading(true)
        try {
            await stagesAPI.moveNext(id)
            toast.success('Moved to next stage!')
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'No more stages remaining')
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteStage = async (stageId) => {
        if (!confirm('Delete this stage?')) return
        try {
            await stagesAPI.delete(stageId)
            toast.success('Stage deleted')
            fetchData()
        } catch {
            toast.error('Failed to delete stage')
        }
    }

    const handleSaveEdit = async (e) => {
        e.preventDefault()
        try {
            await applicationsAPI.update(id, editForm)
            toast.success('Application updated!')
            setEditing(false)
            fetchData()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed')
        }
    }

    const handleDelete = async () => {
        if (!confirm('Delete this application? All stages will be removed.')) return
        try {
            await applicationsAPI.delete(id)
            toast.success('Application deleted')
            navigate('/applications')
        } catch {
            toast.error('Failed to delete')
        }
    }

    const currentStage = stages.find(s => s.id === app?.current_stage_id)

    if (loading) return <LoadingSpinner text="Loading application..." />
    if (!app) return null

    const formatDate = (d) =>
        d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'

    const formatSalary = (min, max) => {
        if (!min && !max) return '—'
        if (min && max) return `$${Number(min).toLocaleString()} – $${Number(max).toLocaleString()}`
        if (min) return `From $${Number(min).toLocaleString()}`
        return `Up to $${Number(max).toLocaleString()}`
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ marginBottom: 8 }}>
                        <Link to="/applications" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            ← Back to Applications
                        </Link>
                    </div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {app.company_name}
                        <ResultBadge result={app.final_result} />
                    </h1>
                    <p>{app.job_title} {app.location ? `• ${app.location}` : ''}</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(!editing)}>
                        {editing ? 'Cancel Edit' : '✏️ Edit'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        🗑 Delete
                    </button>
                </div>
            </div>

            {/* Edit form */}
            {editing && (
                <div className="card mb-6">
                    <div className="section-title">✏️ Edit Application</div>
                    <form onSubmit={handleSaveEdit}>
                        <div className="form-row mb-4" style={{ marginBottom: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Company Name</label>
                                <input className="form-control" value={editForm.company_name}
                                    onChange={e => setEditForm({ ...editForm, company_name: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Job Title</label>
                                <input className="form-control" value={editForm.job_title}
                                    onChange={e => setEditForm({ ...editForm, job_title: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-row mb-4" style={{ marginBottom: 16 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Location</label>
                                <input className="form-control" value={editForm.location}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Final Result</label>
                                <select className="form-control filter-select" value={editForm.final_result}
                                    onChange={e => setEditForm({ ...editForm, final_result: e.target.value })}>
                                    <option value="pending">Pending</option>
                                    <option value="offer">Offer</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea className="form-control" rows={3} value={editForm.notes}
                                onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            )}

            {/* Application Info */}
            <div className="card mb-6">
                <div className="section-title">📋 Application Details</div>
                <div className="detail-grid">
                    <div className="detail-item">
                        <label>Company</label>
                        <span>{app.company_name}</span>
                    </div>
                    <div className="detail-item">
                        <label>Role</label>
                        <span>{app.job_title}</span>
                    </div>
                    <div className="detail-item">
                        <label>Location</label>
                        <span>{app.location || '—'}</span>
                    </div>
                    <div className="detail-item">
                        <label>Applied On</label>
                        <span>{formatDate(app.application_date)}</span>
                    </div>
                    <div className="detail-item">
                        <label>Salary Range</label>
                        <span>{formatSalary(app.salary_min, app.salary_max)}</span>
                    </div>
                    <div className="detail-item">
                        <label>Current Stage</label>
                        <span>{currentStage?.stage_name || '—'}</span>
                    </div>
                    {app.job_link && (
                        <div className="detail-item">
                            <label>Job Link</label>
                            <a href={app.job_link} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-light)' }}>
                                View Posting ↗
                            </a>
                        </div>
                    )}
                    {app.notes && (
                        <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                            <label>Notes</label>
                            <span style={{ whiteSpace: 'pre-wrap' }}>{app.notes}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Stage Timeline */}
            <div className="card mb-6">
                <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
                    <div className="section-title" style={{ margin: 0 }}>
                        🗺️ Interview Pipeline ({stages.length} stage{stages.length !== 1 ? 's' : ''})
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={handleMoveNext}
                            disabled={actionLoading || !stages.length}
                        >
                            ⏭ Move Next
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setShowStageForm(true)}
                        >
                            + Add Stage
                        </button>
                    </div>
                </div>

                <StageTimeline stages={stages} currentStageId={app.current_stage_id} />

                {/* Stage cards */}
                {stages.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                        <div className="divider" />
                        <div className="section-title">Stage Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {stages.map(stage => (
                                <div
                                    key={stage.id}
                                    className="card"
                                    style={{
                                        padding: '16px 20px',
                                        borderColor: stage.id === app.current_stage_id
                                            ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                                        background: stage.id === app.current_stage_id
                                            ? 'rgba(99,102,241,0.07)' : 'var(--bg-elevated)',
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <span style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: stage.is_completed ? 'var(--success)'
                                                    : stage.id === app.current_stage_id ? 'var(--primary)'
                                                        : 'var(--bg-hover)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.8rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                                            }}>
                                                {stage.is_completed ? '✓' : stage.stage_order}
                                            </span>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{stage.stage_name}</div>
                                                {stage.feedback_notes && (
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 2 }}>
                                                        {stage.feedback_notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {stage.result !== 'pending' && (
                                                <span className={`badge badge-${stage.result}`}>{stage.result}</span>
                                            )}
                                            {!stage.is_completed && (
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleCompleteStage(stage.id)}
                                                    disabled={actionLoading}
                                                >
                                                    ✓ Complete
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDeleteStage(stage.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showStageForm && (
                <StageForm
                    applicationId={id}
                    onStageAdded={(newStage) => {
                        setStages(prev => [...prev, newStage].sort((a, b) => a.stage_order - b.stage_order))
                        if (!app.current_stage_id) {
                            setApp(prev => ({ ...prev, current_stage_id: newStage.id }))
                        }
                    }}
                    onClose={() => setShowStageForm(false)}
                />
            )}
        </div>
    )
}

export default ApplicationDetailPage
