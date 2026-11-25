import { Link } from 'react-router-dom';
import { Token, StatusBadge } from './Badges.jsx';
import { formatDate } from '../utils/format.js';

export default function TaskCard({ task, hint, showStatus }) {
  return (
    <Link to={`/tasks/${task.id}`} className="card task-card">
      <div className="row between">
        <span className="tag">{task.category}</span>
        {showStatus ? <StatusBadge status={task.status} /> : <Token amount={task.reward} />}
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      {hint && <span className="hint">{hint}</span>}
      <div className="task-meta">
        <span>By {task.requesterName}</span>
        <span>{showStatus && <Token amount={task.reward} />} {!showStatus && `Due ${formatDate(task.deadline)}`}</span>
      </div>
    </Link>
  );
}
