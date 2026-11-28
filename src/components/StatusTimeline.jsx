import { STATUS } from '../domain/taskStatus.js';

const STEPS = [STATUS.OPEN, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.SUBMITTED, STATUS.COMPLETED];

// Shows where the task is on its journey.
export default function StatusTimeline({ status }) {
  if (status === STATUS.CANCELLED) {
    return <div className="rounded-xl border border-[#f1d8d1] bg-[#fff0ec] px-4 py-3 text-sm font-medium text-[#b8402c]">This task was cancelled.</div>;
  }
  const disputed = status === STATUS.DISPUTED;
  const finished = status === STATUS.COMPLETED; // the journey is over, so every step is done
  const current = disputed ? STEPS.indexOf(STATUS.SUBMITTED) : STEPS.indexOf(status);

  return (
    <>
      <div className="relative mb-6">
        <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-3.5 h-0.5 bg-[#e1e8e9]" />
        <div
          aria-hidden="true"
          className="absolute left-[10%] top-3.5 h-0.5 bg-[#0e8a7d] transition-all duration-500"
          style={{ width: `${Math.max(0, current) * 20}%` }}
        />
        <ol className="relative grid grid-cols-5 gap-1" aria-label="Task progress">
          {STEPS.map((step, index) => {
            const done = finished || index < current;
            const active = !finished && index === current;
            return (
              <li key={step} className="flex min-w-0 flex-col items-center gap-2 text-center" aria-current={active ? 'step' : undefined}>
                <span className={`grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-bold transition ${
                  done ? 'border-[#0e8a7d] bg-[#0e8a7d] text-white'
                    : active ? 'border-[#0e8a7d] bg-white text-[#0e8a7d] ring-4 ring-[#e6f5f1]'
                      : 'border-[#dce3e9] bg-white text-[#98a2b3]'
                }`}>
                  {done ? '✓' : index + 1}
                </span>
                <span className={`max-w-full truncate text-[10px] sm:text-xs ${active ? 'font-bold text-[#19233b]' : done ? 'font-semibold text-[#0a6b61]' : 'text-[#7b8494]'}`}>
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      {disputed && (
        <div className="mb-5 rounded-xl border border-[#f1dfb6] bg-[#fff9e9] px-4 py-3 text-sm leading-6 text-[#755a1b]">
          This task is in dispute. An administrator will decide how the tokens are settled.
        </div>
      )}
    </>
  );
}