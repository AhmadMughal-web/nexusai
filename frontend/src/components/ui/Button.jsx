export default function Button({ children, type = 'button', onClick, loading, fullWidth, variant = 'primary', disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${loading ? 'btn-loading' : ''}`}
    >
      {loading ? (
        <span className="btn-spinner" />
      ) : children}
      <div className="btn-shimmer" />
    </button>
  )
}
