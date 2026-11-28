import { Link } from 'react-router-dom';
import { Token, StatusBadge } from './Badges.jsx';
import { formatDate } from '../utils/format.js';

export default function TaskCard({ task, hint, showStatus }) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      className="group flex h-full flex-col rounded-2xl border border-[#e1e8e9] bg-white p-5 text-inherit no-underline shadow-[0_8px_30px_rgba(25,35,59,0.04)] transition duration-200 hover:-translate-y-1 hover:border-[#b8dcd5] hover:shadow-[0_16px_34px_rgba(25,35,59,0.1)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="max-w-[65%] truncate rounded-full bg-[#eef5f3] px-3 py-1 text-xs font-semibold text-[#0a6b61]">{task.category}</span>
        {showStatus ? <StatusBadge status={task.status} /> : <Token amount={task.reward} />}
      </div>
      <h3 className="mb-2 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b] transition group-hover:text-[#0a6b61]">{task.title}</h3>
      <p className="mb-5 line-clamp-2 text-sm leading-6 text-[#667085]">{task.description}</p>
      {hint && (
        <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg bg-[#fff4d8] px-3 py-1.5 text-xs font-semibold text-[#805d0b]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#d49a00]" />
          {hint}
        </span>
      )}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#edf1f2] pt-4 text-xs text-[#7b8494]">
        <span className="truncate">By {task.requesterName}</span>
        <span className="whitespace-nowrap font-medium text-[#667085]">
          {showStatus ? <Token amount={task.reward} /> : `Due ${formatDate(task.deadline)}`}
        </span>
      </div>
    </Link>
  );
}
