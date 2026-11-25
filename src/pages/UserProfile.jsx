import Avatar from '../components/Avatar.jsx';
import { Link, useParams } from 'react-router-dom';
import { useLoad } from '../hooks/useLoad.js';
import { getUser } from '../services/authService.js';
import { getReviewsForUser, getRating } from '../services/reviewService.js';
import { listTasks } from '../services/taskService.js';
import { formatDate } from '../utils/format.js';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';
import { StarDisplay } from '../components/Badges.jsx';

export default function UserProfile() {
  const { id } = useParams();
  const { data, loading, error } = useLoad(async () => {
    const person = (await getUser(id)).toPublic();
    const [reviews, rating, done] = await Promise.all([getReviewsForUser(id), getRating(id), listTasks({ status: 'Completed' })]);
    return { person, reviews, rating, completed: done.filter((t) => t.providerId === id).length };
  }, [id]);

  if (loading && !data) return <Loading />;
  if (error) return <div className="site-container page"><ErrorBox error={error} /></div>;
  const { person, reviews, rating, completed } = data;

  return (
    <div className="site-container page">
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="row" style={{ marginBottom: '.75rem' }}>
          <Avatar user={person} size={72} />
          <div>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>{person.name}</h1>
            <p className="muted" style={{ margin: 0 }}>Member since {formatDate(person.createdAt)}</p>
          </div>
        </div>
        {person.bio && <p>{person.bio}</p>}
        <div style={{ marginBottom: '.75rem' }}>{person.skills.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
        <div className="row">
          {rating.count ? <><StarDisplay value={rating.average} /><strong>{rating.average}</strong><span className="muted">({rating.count} review{rating.count > 1 ? 's' : ''})</span></> : <span className="muted">No reviews yet</span>}
          <span className="muted">{completed} task{completed === 1 ? '' : 's'} completed</span>
        </div>
      </div>

      <h2>Reviews</h2>
      {reviews.length ? (
        <div className="stack">
          {reviews.map((r) => (
            <div className="card" key={r.id}>
              <div className="row between"><StarDisplay value={r.rating} /><span className="muted small">{formatDate(r.createdAt)}</span></div>
              <p style={{ margin: '.5rem 0' }}>{r.comment || 'No written comment.'}</p>
              <p className="muted small" style={{ margin: 0 }}>{r.reviewerName} on <Link to={`/tasks/${r.taskId}`}>{r.taskTitle}</Link></p>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="No reviews yet">Reviews appear here after this person completes a task.</Empty>
      )}
    </div>
  );
}
