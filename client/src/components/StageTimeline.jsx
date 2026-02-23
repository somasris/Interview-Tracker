/**
 * Horizontal stage timeline with:
 * - Completed stages highlighted green
 * - Current stage glowing purple with pulse animation
 * - Failed stages in red
 * - Pending stages muted
 */
function StageTimeline({ stages = [], currentStageId }) {
    if (!stages.length) {
        return (
            <div className="empty-state" style={{ padding: '32px' }}>
                <div className="icon">🗺️</div>
                <p>No stages have been added yet.</p>
            </div>
        )
    }

    const getStageClass = (stage) => {
        if (stage.id === currentStageId) return 'current'
        if (stage.result === 'fail') return 'failed'
        if (stage.is_completed) return 'completed'
        return ''
    }

    const getIcon = (stage) => {
        if (stage.result === 'fail') return '✗'
        if (stage.is_completed) return '✓'
        if (stage.id === currentStageId) return stage.stage_order
        return stage.stage_order
    }

    return (
        <div className="stage-timeline">
            {stages.map((stage) => {
                const cls = getStageClass(stage)
                return (
                    <div key={stage.id} className={`stage-item ${cls}`}>
                        <div className="stage-dot">{getIcon(stage)}</div>
                        <div className="stage-label">{stage.stage_name}</div>
                        <div className="stage-status">
                            {stage.is_completed && stage.completed_at
                                ? new Date(stage.completed_at).toLocaleDateString()
                                : cls === 'current'
                                    ? 'In Progress'
                                    : '—'}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default StageTimeline
