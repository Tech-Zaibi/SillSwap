import { useEffect, useState } from 'react';
import { getFileBlob } from '../services/fileService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatBytes } from '../utils/format.js';
import { errorMessage } from '../utils/messages.js';

// Shows the files a provider attached: image previews + download buttons.
export default function SubmissionFiles({ files }) {
  const toast = useToast();
  const [previews, setPreviews] = useState({});
  const key = files.map((f) => f.id).join(',');

  useEffect(() => {
    let alive = true;
    const urls = [];
    (async () => {
      const map = {};
      for (const f of files.filter((x) => x.type.startsWith('image/'))) {
        try {
          const blob = await getFileBlob(f.id);
          if (blob) { const url = URL.createObjectURL(blob); urls.push(url); map[f.id] = url; }
        } catch { /* no preview, the download button still works */ }
      }
      if (alive) setPreviews(map);
    })();
    return () => { alive = false; urls.forEach((u) => URL.revokeObjectURL(u)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  async function download(file) {
    try {
      const blob = await getFileBlob(file.id);
      if (!blob) return toast('This file is no longer available in this browser.', 'error');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.split('/').pop();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  if (!files.length) return null;
  return (
    <div style={{ marginBottom: '.75rem' }}>
      <strong className="small">Attached files ({files.length})</strong>
      <ul className="file-list">
        {files.map((f) => (
          <li key={f.id}>
            {previews[f.id] && <img src={previews[f.id]} alt="" className="file-thumb" />}
            <span className="file-name">{f.name}</span>
            <span className="muted small">{formatBytes(f.size)}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => download(f)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
}