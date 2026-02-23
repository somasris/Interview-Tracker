import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { applicationsAPI, templatesAPI } from '../services/api.js'

function CreateApplicationPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [templates, setTemplates] = useState([])
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [manualStages, setManualStages] = useState([{ stage_name: '', stage_order: 1 }])
    const [stageMode, setStageMode] = useState('template') // 'template' | 'manual' | 'none'

    const [form, setForm] = useState({
        company_name: '',
        job_title: '',
        location: '',
        application_date: new Date().toISOString().split('T')[0],
        salary_min: '',
        salary_max: '',
        job_link: '',
        notes: '',
        final_result: 'pending',
    })

    useEffect(() => {
        templatesAPI.getAll()
            .then(res => setTemplates(res.data.data))
            .catch(console.error)
    }, [])

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const addManualStage = () => {
        setManualStages(prev => [...prev, { stage_name: '', stage_order: prev.length + 1 }])
    }

    const updateManualStage = (index, value) => {
        setManualStages(prev =>
            prev.map((s, i) => i === index ? { ...s, stage_name: value } : s)
        )
    }

    const removeManualStage = (index) => {
        setManualStages(prev =>
            prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, stage_order: i + 1 }))
        )
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.company_name.trim() || !form.job_title.trim()) {
            toast.error('Company name and job title are required.')
            return
        }

        const payload = { ...form }
        if (stageMode === 'template' && selectedTemplate) {
            payload.template_id = Number(selectedTemplate)
        } else if (stageMode === 'manual') {
            const valid = manualStages.filter(s => s.stage_name.trim())
            if (!valid.length) {
                toast.error('Add at least one stage or choose a template.')
                return
            }
            payload.stages = valid
        }

        setLoading(true)
        try {
            const res = await applicationsAPI.create(payload)
            toast.success('Application created! 🎉')
            navigate(`/applications/${res.data.data.id}`)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create application')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="page-header">
                <h1>➕ New Application</h1>
                <p>Track a new job opportunity</p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="card mb-6">
                    <div className="section-title">📋 Job Details</div>

                    <div className="form-row mb-4" style={{ marginBottom: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Company Name *</label>
                            <input
                                className="form-control"
                                name="company_name"
                                placeholder="Google, Meta, ..."
                                value={form.company_name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Job Title *</label>
                            <input
                                className="form-control"
                                name="job_title"
                                placeholder="Software Engineer"
                                value={form.job_title}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row mb-4" style={{ marginBottom: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Location</label>
                            <input
                                className="form-control"
                                name="location"
                                placeholder="San Francisco, CA / Remote"
                                value={form.location}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Application Date *</label>
                            <input
                                className="form-control"
                                type="date"
                                name="application_date"
                                value={form.application_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row mb-4" style={{ marginBottom: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Salary Min ($)</label>
                            <input
                                className="form-control"
                                type="number"
                                name="salary_min"
                                placeholder="80000"
                                value={form.salary_min}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Salary Max ($)</label>
                            <input
                                className="form-control"
                                type="number"
                                name="salary_max"
                                placeholder="120000"
                                value={form.salary_max}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Job Link</label>
                        <input
                            className="form-control"
                            type="url"
                            name="job_link"
                            placeholder="https://..."
                            value={form.job_link}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-control"
                            name="notes"
                            rows={3}
                            placeholder="Referral, how you found the job, recruiter name..."
                            value={form.notes}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Initial Result</label>
                        <select
                            className="form-control filter-select"
                            name="final_result"
                            value={form.final_result}
                            onChange={handleChange}
                        >
                            <option value="pending">Pending</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Stage Workflow */}
                <div className="card mb-6">
                    <div className="section-title">🗺️ Interview Stage Workflow</div>

                    <div className="flex gap-3 mb-6" style={{ marginBottom: '20px' }}>
                        {[
                            { key: 'template', label: '📋 Use Template' },
                            { key: 'manual', label: '✏️ Manual Stages' },
                            { key: 'none', label: '⏭️ Skip' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                className={`btn ${stageMode === key ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                onClick={() => setStageMode(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {stageMode === 'template' && (
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Select Pipeline Template</label>
                            <select
                                className="form-control filter-select"
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                            >
                                <option value="">— Choose a template —</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {selectedTemplate && (
                                <p className="form-hint" style={{ marginTop: 8 }}>
                                    Stages will be copied from the selected template automatically.
                                </p>
                            )}
                        </div>
                    )}

                    {stageMode === 'manual' && (
                        <div>
                            {manualStages.map((stage, i) => (
                                <div key={i} className="flex gap-2 items-center mb-4" style={{ marginBottom: '10px' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: 24, textAlign: 'center' }}>
                                        {i + 1}
                                    </span>
                                    <input
                                        className="form-control"
                                        placeholder={`Stage ${i + 1} name`}
                                        value={stage.stage_name}
                                        onChange={(e) => updateManualStage(i, e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    {manualStages.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-icon"
                                            onClick={() => removeManualStage(i)}
                                            title="Remove stage"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                onClick={addManualStage}
                                style={{ marginTop: 4 }}
                            >
                                + Add Stage
                            </button>
                        </div>
                    )}

                    {stageMode === 'none' && (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            You can add stages later from the application detail page.
                        </p>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{ flex: 1 }}
                    >
                        {loading ? 'Creating...' : '✨ Create Application'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary btn-lg"
                        onClick={() => navigate('/applications')}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateApplicationPage
