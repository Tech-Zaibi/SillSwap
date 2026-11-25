import { useState } from 'react';

// Label + input + error message in one piece.
export function Field({ label, error, hint, id, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && !error && <span className="hint-text">{hint}</span>}
      {error && <span className="error-text" role="alert">{error}</span>}
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
          <span className="tag" key={t}>
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => onChange(value.filter((v) => v !== t))}>x</button>
          </span>
        ))}
      </div>
      <input
        id={id}
        className="input"
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
