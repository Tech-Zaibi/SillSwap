// The little gold coin + number.
export const Token = ({ amount, big }) => <span className={`token${big ? ' big' : ''}`}>{amount} {amount === 1 ? 'token' : 'tokens'}</span>;

export const StatusBadge = ({ status }) => <span className={`badge ${status.replace(' ', '-')}`}>{status}</span>;

export function StarDisplay({ value }) {
  const full = Math.round(value);
  return (
    <span className="star-static" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= full ? 'on' : ''}>★</span>)}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <span className="stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={`star${n <= value ? ' on' : ''}`} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
      ))}
    </span>
  );
}
