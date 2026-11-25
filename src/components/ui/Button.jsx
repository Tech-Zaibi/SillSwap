const VARIANTS = {
  primary: 'border border-transparent bg-brand text-white shadow-sm hover:bg-brand-dark hover:shadow-md',
  secondary: 'border border-line bg-white text-ink hover:bg-paper',
  danger: 'border border-transparent bg-coral text-white shadow-sm hover:opacity-90',
};

const SIZES = {
  md: 'px-4 py-2.5 text-sm',
  sm: 'px-3 py-1.5 text-sm',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      {...props}
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading && (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}