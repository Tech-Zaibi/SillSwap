import { useEffect, useState } from 'react';
import Btn from './Btn.jsx';

// A yes/no popup. Press Escape or click the dark area to close it.
export default function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function confirm() {
    setBusy(true);
    await onConfirm();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#19233b]/60 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-[480px] rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-2 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">{title}</h2>
        <p className="mb-5 text-[#19233b]">{message}</p>
        <div className="flex flex-wrap gap-3">
          <Btn variant={danger ? 'danger' : 'primary'} disabled={busy} onClick={confirm}>{confirmLabel}</Btn>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}