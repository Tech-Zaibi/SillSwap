import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listMyTasks } from '../services/taskService.js';
import { getWalletSummary } from '../services/tokenService.js';
import { getRating } from '../services/reviewService.js';
import { actionHint } from '../utils/taskActions.js';
import TaskCard from '../components/TaskCard.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';
import { StarDisplay } from '../components/Badges.jsx';

export default function Dashboard() {
  const { user, tick } = useAuth();
  const { data, loading, error } = useLoad(async () => ({
    my: await listMyTasks(user.id),
    summary: await getWalletSummary(user.id),
    rating: await getRating(user.id),
  }), [user.id, tick]);

  if (loading && !data) return <Loading />;
  if (error) return <div className="container page"><ErrorBox error={error} /></div>;

  // Combine all my tasks (remove duplicates), keep only unfinished ones.
  const unique = new Map();
  [...data.my.posted, ...data.my.working, ...data.my.applied].forEach((t) => unique.set(t.id, t));
  const active = [...unique.values()].filter((t) => !['Completed', 'Cancelled'].includes(t.status));
  const needsAction = active.filter((t) => actionHint(t, user.id));
  const others = active.filter((t) => !actionHint(t, user.id));
  const { wallet } = user;

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Hi, {user.name.split(' ')[0]}</h1>
          <p className="muted">
            {data.rating.count ? <><StarDisplay value={data.rating.average} /> {data.rating.average} from {data.rating.count} review{data.rating.count > 1 ? 's' : ''}</> : 'You have no reviews yet.'}
          </p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">Post a task</Link>
      </div>

      <div className="grid stats" style={{ marginBottom: '2rem' }}>
        <div className="card stat"><div className="num">{wallet.available}</div><div className="label">Tokens you can spend</div></div>
        <div className="card stat"><div className="num">{wallet.locked}</div><div className="label">Tokens locked in escrow</div></div>
        <div className="card stat"><div className="num">{data.summary.earned}</div><div className="label">Tokens earned so far</div></div>
        <div className="card stat"><div className="num">{active.length}</div><div className="label">Active tasks</div></div>
      </div>

      <h2>Needs your attention</h2>
      {needsAction.length ? (
        <div className="grid cols-3" style={{ marginBottom: '2rem' }}>
          {needsAction.map((t) => <TaskCard key={t.id} task={t} hint={actionHint(t, user.id)} showStatus />)}
        </div>
      ) : (
        <div style={{ marginBottom: '2rem' }}><Empty title="You are all caught up">Nothing is waiting for you right now.</Empty></div>
      )}

      <h2>Other active tasks</h2>
      {others.length ? (
        <div className="grid cols-3">{others.map((t) => <TaskCard key={t.id} task={t} showStatus />)}</div>
      ) : (
        <Empty title="No other active tasks" action={<Link to="/tasks" className="btn btn-primary">Find a task to do</Link>}>
          Apply to a task to start earning tokens.
        </Empty>
      )}
    </div>
  );
}
