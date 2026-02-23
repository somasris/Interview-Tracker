import { useState } from 'react'
import toast from 'react-hot-toast'
import { stagesAPI } from '../services/api.js'

function StageForm({ applicationId, onStageAdded, onClose }) {
    const [form, setForm] = useState({ stage_name: '', feedback_notes: '', result: 'pending' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.stage_name.trim()) {
            toast.error('Stage name is required')
            return
        }
        setLoading(true)
        try {
            const res = await stagesAPI.add(applicationId, form)
            onStageAdded(res.data.data)
            toast.success('Stage added!')
            onClose()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add stage')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3>Add New Stage</h3>
                    <button className="btn-icon" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Stage Name *</label>
                        <input
                            className="form-control"
                            placeholder="e.g. Technical Interview"
                            value={form.stage_name}
                            onChange={(e) => setForm({ ...form, stage_name: e.target.value })}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-control"
                            placeholder="Any notes about this stage..."
                            rows={3}
                            value={form.feedback_notes}
                            onChange={(e) => setForm({ ...form, feedback_notes: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Initial Result</label>
                        <select
                            className="form-control filter-select"
                            value={form.result}
                            onChange={(e) => setForm({ ...form, result: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                        </select>
                    </div>

                    <div className="flex gap-3" style={{ marginTop: '8px' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
                            {loading ? 'Adding...' : 'Add Stage'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default StageForm
