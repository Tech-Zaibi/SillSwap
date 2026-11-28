const STATUS_TONES = {
  Open: 'bg-[#eaf0ff] text-[#415caa]',
  Assigned: 'bg-[#fff4d8] text-[#805d0b]',
  'In Progress': 'bg-[#fff4d8] text-[#805d0b]',
  Submitted: 'bg-[#f1eafb] text-[#7046a0]',
  Completed: 'bg-[#e6f5f1] text-[#0a6b61]',
  Disputed: 'bg-[#fff0ec] text-[#b8402c]',
  Cancelled: 'bg-[#f1f5f6] text-[#667085]',
};

export const Token = ({ amount, big = false }) => (
  <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#fff1cc] px-3 py-1 font-bold text-[#6b4a00] ${big ? 'text-lg' : 'text-xs'}`}>
    <span className="h-3.5 w-3.5 rounded-full bg-[#e8a500] ring-[3px] ring-inset ring-white/40" />
    {amount} {amount === 1 ? 'token' : 'tokens'}
  </span>
);

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_TONES[status] || 'bg-[#f1f5f6] text-[#667085]'}`}>
    {status}
  </span>
);

export function StarDisplay({ value }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5 text-sm text-[#d3d9e2]" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= full ? 'text-[#e8a500]' : ''} aria-hidden="true">★</span>)}
    </span>
  );
}

export function StarInput({ value, onChange }) {
  return (
    <span className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={`cursor-pointer rounded-lg px-1 text-2xl transition hover:scale-110 ${n <= value ? 'text-[#e8a500]' : 'text-[#c3cad6]'}`} onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>★</button>
      ))}
    </span>
  );
}
