import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './AuthIcons.jsx';

export default function TextField({
  label,
  error,
  hint,
  icon,
  type = 'text',
  className = '',
  ...inputProps
}) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const messageId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-muted">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={messageId}
          className={`block w-full rounded-xl border bg-white py-3 text-sm text-ink placeholder:text-muted/70 focus:outline-none focus:ring-4 ${
            icon ? 'pl-11' : 'pl-3.5'
          } ${isPassword ? 'pr-11' : 'pr-3.5'} ${
            error
              ? 'border-coral focus:ring-coral/20'
              : 'border-line focus:border-brand focus:ring-brand/20'
          }`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-3 flex items-center border-0 bg-transparent px-1 text-muted hover:text-ink"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error ? (
        <p id={messageId} className="mt-1.5 text-sm text-coral">{error}</p>
      ) : hint ? (
        <p id={messageId} className="mt-1.5 text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}