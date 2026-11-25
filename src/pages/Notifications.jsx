import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listNotifications, markRead, markAllRead } from '../services/notificationService.js';
import { timeAgo } from '../utils/format.js';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

export default function Notifications() {
  const { user, tick, refresh } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useLoad(() => listNotifications(user.id), [user.id, tick]);

  if (loading && !data) return <Loading />;
  if (error) return <div className="container page"><ErrorBox error={error} /></div>;
  const unread = data.filter((n) => !n.read).length;

  async function open(n) {
    await markRead(n.id);
    await refresh();
    navigate(n.link);
  }

  async function readAll() {
    await markAllRead(user.id);
    await refresh();
    reload();
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1 style={{ fontSize: '2rem' }}>Notifications</h1>
        {unread > 0 && <button className="btn btn-ghost" onClick={readAll}>Mark all as read</button>}
      </div>
      {data.length ? (
        <div className="card flat">
          {data.map((n) => (
            <button key={n.id} className={`notif${n.read ? '' : ' unread'}`} onClick={() => open(n)}>
              <span>{n.text}</span>
              <span className="muted small" style={{ whiteSpace: 'nowrap' }}>{timeAgo(n.createdAt)}</span>
            </button>
          ))}
        </div>
      ) : (
        <Empty title="No notifications yet">You will see updates about your tasks and tokens here.</Empty>
      )}
    </div>
  );
}
