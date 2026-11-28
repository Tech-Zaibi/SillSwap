import { useEffect, useState } from 'react';
import { getFileBlob } from '../services/fileService.js';
import { useToast } from '../context/ToastContext.jsx';
import { formatBytes } from '../utils/format.js';
import { errorMessage } from '../utils/messages.js';
import Btn from './ui/Btn.jsx';

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
    <div className="mb-4">
      <strong className="mb-2 block text-sm font-bold text-[#344054]">Attached files ({files.length})</strong>
      <ul className="m-0 list-none divide-y divide-[#edf1f2] rounded-xl border border-[#e1e8e9] p-0">
        {files.map((f) => (
          <li key={f.id} className="flex flex-wrap items-center gap-3 p-3">
            {previews[f.id] && <img src={previews[f.id]} alt="" className="h-11 w-11 flex-none rounded-lg border border-[#e1e8e9] object-cover" />}
            <span className="min-w-0 flex-1 break-all text-sm font-medium text-[#344054]">{f.name}</span>
            <span className="text-xs text-[#7b8494]">{formatBytes(f.size)}</span>
            <Btn type="button" size="sm" variant="ghost" className="rounded-lg" onClick={() => download(f)}>Download</Btn>
          </li>
        ))}
      </ul>
    </div>
  );
}