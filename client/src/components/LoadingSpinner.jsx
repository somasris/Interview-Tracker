function LoadingSpinner({ text = 'Loading...' }) {
    return (
        <div className="loading-wrap">
            <div className="spinner" />
            <span>{text}</span>
        </div>
    )
}

export default LoadingSpinner
