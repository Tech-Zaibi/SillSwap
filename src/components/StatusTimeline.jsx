import { STATUS } from '../domain/taskStatus.js';

const STEPS = [STATUS.OPEN, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.SUBMITTED, STATUS.COMPLETED];

// Shows where the task is on its journey.
export default function StatusTimeline({ status }) {
  if (status === STATUS.CANCELLED) return <div className="alert error">This task was cancelled.</div>;
  const disputed = status === STATUS.DISPUTED;
  const finished = status === STATUS.COMPLETED; // the journey is over, so every step is done
  const current = disputed ? STEPS.indexOf(STATUS.SUBMITTED) : STEPS.indexOf(status);

  return (
    <>
      <ol className="timeline" aria-label="Task progress">
        {STEPS.map((s, i) => {
          let cls = '';
          if (finished || i < current) cls = 'done';
          else if (i === current) cls = `current${disputed ? ' warn' : ''}`;
          if (finished && i === STEPS.length - 1) cls += ' final';
          return <li key={s} className={cls} aria-current={!finished && i === current ? 'step' : undefined}>{s}</li>;
        })}
      </ol>
      {disputed && <div className="alert warn">This task is in dispute. An administrator will decide how the tokens are settled.</div>}
    </>
  );
}