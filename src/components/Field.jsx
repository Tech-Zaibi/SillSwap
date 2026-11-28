import { useState } from 'react';

// Label + input + error message in one piece.
export function Field({ label, error, hint, id, children }) {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-[#344054]" htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="text-xs leading-5 text-[#7b8494]">{hint}</span>}
      {error && <span className="text-sm text-[#b8402c]" role="alert">{error}</span>}
    </div>
  );
}

// Type a skill, press Enter or comma to add it.
export function TagInput({ value, onChange, id }) {
  const [text, setText] = useState('');

  function add() {
    const tag = text.trim();
    if (tag && !value.some((v) => v.toLowerCase() === tag.toLowerCase())) onChange([...value, tag]);
    setText('');
  }

  return (
    <div>
      <div>
        {value.map((t) => (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f5f1] px-3 py-1 text-sm font-medium text-[#0a6b61]" key={t}>
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              className="cursor-pointer rounded-full px-1 text-[#0a6b61] transition hover:bg-[#cce7e0]"
              onClick={() => onChange(value.filter((v) => v !== t))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={id}
        className="w-full rounded-xl border border-[#dce5e7] bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10"
        value={text}
        placeholder="Type a skill and press Enter"
        onChange={(e) => setText(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
        }}
      />
    </div>
  );
}
