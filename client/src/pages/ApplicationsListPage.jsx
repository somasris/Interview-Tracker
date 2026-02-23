import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { applicationsAPI } from '../services/api.js'
import ApplicationCard from '../components/ApplicationCard.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

function ApplicationsListPage() {
    const [applications, setApplications] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [resultFilter, setResultFilter] = useState('')
    const [page, setPage] = useState(1)

    const fetchApps = useCallback(async () => {
        setLoading(true)
        try {
            const res = await applicationsAPI.getAll({
                search: search || undefined,
                result: resultFilter || undefined,
                page,
                limit: 10,
            })
            setApplications(res.data.data.applications)
            setPagination(res.data.data.pagination)
        } catch {
            toast.error('Failed to load applications')
        } finally {
            setLoading(false)
        }
    }, [search, resultFilter, page])

    useEffect(() => { fetchApps() }, [fetchApps])

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1) }, [search, resultFilter])

    const handleDelete = async (id) => {
        if (!confirm('Delete this application? This cannot be undone.')) return
        try {
            await applicationsAPI.delete(id)
            toast.success('Application deleted')
            fetchApps()
        } catch {
            toast.error('Failed to delete')
        }
    }

    return (
        <div>
            <div className="page-header flex justify-between items-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1>📁 Applications</h1>
                    <p>{pagination.total} total application{pagination.total !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/applications/new" className="btn btn-primary">
                    + New Application
                </Link>
            </div>

            {/* Filter bar */}
            <div className="filter-bar">
                <input
                    className="form-control"
                    placeholder="🔍 Search company or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: 300 }}
                />
                <select
                    className="filter-select"
                    value={resultFilter}
                    onChange={(e) => setResultFilter(e.target.value)}
                >
                    <option value="">All Results</option>
                    <option value="pending">Pending</option>
                    <option value="offer">Offer</option>
                    <option value="rejected">Rejected</option>
                </select>
                {(search || resultFilter) && (
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => { setSearch(''); setResultFilter('') }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {loading ? (
                <LoadingSpinner text="Loading applications..." />
            ) : applications.length === 0 ? (
                <div className="empty-state">
                    <div className="icon">📭</div>
                    <h3>No applications found</h3>
                    <p>{search || resultFilter ? 'Try adjusting your filters.' : 'Add your first application to get started.'}</p>
                    {!search && !resultFilter && (
                        <Link to="/applications/new" className="btn btn-primary btn-lg">
                            + Add Application
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {applications.map(app => (
                            <ApplicationCard
                                key={app.id}
                                app={app}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    className={`page-btn${p === page ? ' active' : ''}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}
                            <button
                                className="page-btn"
                                disabled={page === pagination.pages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default ApplicationsListPage
