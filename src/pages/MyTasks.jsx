import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listMyTasks } from '../services/taskService.js';
import { actionHint } from '../utils/taskActions.js';
import TaskCard from '../components/TaskCard.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

const TABS = [
  { key: 'posted', label: 'Posted by me', empty: 'You have no active posted tasks.' },
  { key: 'working', label: 'Working on', empty: 'You are not working on any task right now.' },
  { key: 'applied', label: 'Applied to', empty: 'You have no pending applications.' },
  { key: 'history', label: 'History', empty: 'No finished tasks yet.' },
];

const isFinished = (t) => ['Completed', 'Cancelled'].includes(t.status);

export default function MyTasks() {
  const { user, tick } = useAuth();
  const [tab, setTab] = useState('posted');
  const { data, loading, error } = useLoad(() => listMyTasks(user.id), [user.id, tick]);

  if (loading && !data) return <Loading />;
  if (error) return <div className="container page"><ErrorBox error={error} /></div>;

  // Active tabs show only unfinished tasks. Finished ones go to History.
  const everything = new Map();
  [...data.posted, ...data.working, ...data.applied].forEach((t) => everything.set(t.id, t));

  const lists = {
    posted: data.posted.filter((t) => !isFinished(t)),
    working: data.working.filter((t) => !isFinished(t)),
    applied: data.applied.filter((t) => !isFinished(t)),
    history: [...everything.values()].filter(isFinished),
  };

  const list = lists[tab];
  const current = TABS.find((t) => t.key === tab);

  return (
    <div className="container page">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>My tasks</h1><Link to="/tasks/new" className="btn btn-primary">Post a task</Link></div>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label} ({lists[t.key].length})
          </button>
        ))}
      </div>
      {list.length ? (
        <div className="grid cols-3">{list.map((t) => <TaskCard key={t.id} task={t} hint={actionHint(t, user.id)} showStatus />)}</div>
      ) : (
        <Empty title={current.empty} action={<Link className="btn btn-primary" to={tab === 'posted' ? '/tasks/new' : '/tasks'}>{tab === 'posted' ? 'Post a task' : 'Browse tasks'}</Link>} />
      )}
    </div>
  );
}