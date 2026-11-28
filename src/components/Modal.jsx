import { useEffect, useState } from 'react';
import { errorMessage } from '../utils/messages.js';
import Btn from './ui/Btn.jsx';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#19233b]/60 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-2xl border border-white/60 bg-white p-5 shadow-[0_24px_70px_rgba(25,35,59,0.28)] sm:p-7" role="dialog" aria-modal="true" aria-label={title}>
        <h2 className="mb-4 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">{title}</h2>
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
        <div className="mb-5 flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-[#344054]" htmlFor="modal-text">{label}</label>
          <textarea
            id="modal-text"
            className={`min-h-32 w-full rounded-xl border bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition focus:ring-4 ${error ? 'border-[#c8442b] focus:border-[#c8442b] focus:ring-[#c8442b]/10' : 'border-[#dce5e7] focus:border-[#0e8a7d] focus:ring-[#0e8a7d]/10'}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-invalid={Boolean(error)}
            autoFocus
          />
          {error && <span className="text-sm text-[#b8402c]" role="alert">{error}</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          <Btn type="submit" variant={danger ? 'danger' : 'primary'} disabled={busy}>{confirmLabel}</Btn>
          <Btn type="button" variant="ghost" onClick={onClose}>Close</Btn>
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
      <p className="mb-5 leading-6 text-[#475467]">{message}</p>
      <div className="flex flex-wrap gap-3">
        <Btn
          variant={danger ? 'danger' : 'primary'}
          disabled={busy}
          onClick={async () => { setBusy(true); await onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </Btn>
        <Btn variant="ghost" onClick={onClose}>Close</Btn>
      </div>
    </Modal>
  );
}
