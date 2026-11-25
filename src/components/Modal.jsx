import { useEffect, useState } from 'react';
import { errorMessage } from '../utils/messages.js';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

// A modal with a text box (used for revision notes and dispute reasons).
export function TextModal({ title, label, confirmLabel, danger, onSubmit, onClose, children }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(text);
      onClose();
    } catch (err) {
      setError(err.fields?.text || errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      {children}
      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="modal-text">{label}</label>
          <textarea id="modal-text" className={`input${error ? ' invalid' : ''}`} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          {error && <span className="error-text" role="alert">{error}</span>}
        </div>
        <div className="row">
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} disabled={busy}>{confirmLabel}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </form>
    </Modal>
  );
}

// A yes/no confirmation.
export function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal title={title} onClose={onClose}>
      <p>{message}</p>
      <div className="row">
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          disabled={busy}
          onClick={async () => { setBusy(true); await onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
        <button className="btn btn-ghost" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
