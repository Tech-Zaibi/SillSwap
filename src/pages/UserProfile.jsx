import Avatar from '../components/Avatar.jsx';
import { Link, useParams } from 'react-router-dom';
import { useLoad } from '../hooks/useLoad.js';
import { getUser } from '../services/authService.js';
import { getReviewsForUser, getRating } from '../services/reviewService.js';
import { listTasks } from '../services/taskService.js';
import { formatDate } from '../utils/format.js';
import { StarDisplay } from '../components/Badges.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';

export default function UserProfile() {
  const { id } = useParams();
  const { data, loading, error } = useLoad(async () => {
    const person = (await getUser(id)).toPublic();
    const [reviews, rating, done] = await Promise.all([getReviewsForUser(id), getRating(id), listTasks({ status: 'Completed' })]);
    return { person, reviews, rating, completed: done.filter((t) => t.providerId === id).length };
  }, [id]);

  if (loading && !data) return <LoadingState />;
  if (error) return <div className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6"><ErrorState error={error} /></div>;
  const { person, reviews, rating, completed } = data;

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-7 sm:px-6 sm:py-10">
      <section className="mb-8 overflow-hidden rounded-3xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.05)]">
        <div className="h-28 bg-linear-to-r from-ink via-[#1d3a5f] to-brand sm:h-36" />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-10 mb-4 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
            <Avatar user={person} size={96} />
            <span className="rounded-full bg-[#e6f5f1] px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0a6b61]">SkillSwap member</span>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              <h1 className="mb-1 font-['Bricolage_Grotesque'] text-3xl font-bold tracking-tight text-[#19233b]">{person.name}</h1>
              <p className="mb-4 text-sm text-[#7b8494]">Member since {formatDate(person.createdAt)}</p>
              {person.bio && <p className="mb-4 max-w-3xl whitespace-pre-wrap leading-7 text-[#475467]">{person.bio}</p>}
              {person.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {person.skills.map((skill) => <span className="rounded-full bg-[#f1f5f6] px-3 py-1 text-sm font-medium text-[#475467]" key={skill}>{skill}</span>)}
                </div>
              )}
            </div>
            <div className="grid min-w-[220px] grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f7f9f8] p-3">
                <span className="block text-xs font-semibold text-[#7b8494]">Rating</span>
                <span className="mt-1 flex items-center gap-1.5">
                  <strong className="text-lg text-[#25324a]">{rating.count ? rating.average : '—'}</strong>
                  {rating.count > 0 && <StarDisplay value={rating.average} />}
                </span>
              </div>
              <div className="rounded-xl bg-[#f7f9f8] p-3">
                <span className="block text-xs font-semibold text-[#7b8494]">Completed</span>
                <strong className="mt-1 block text-lg text-[#25324a]">{completed} task{completed === 1 ? '' : 's'}</strong>
              </div>
              <div className="col-span-2 text-xs text-[#7b8494]">
                {rating.count ? `${rating.count} review${rating.count === 1 ? '' : 's'} from the community` : 'No reviews yet'}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mb-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Community feedback</p>
        <h2 className="mb-0 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">Reviews</h2>
      </div>
      {reviews.length ? (
        <div className="space-y-4">
          {reviews.map((r) => (
            <article className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6" key={r.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <StarDisplay value={r.rating} />
                <span className="text-xs text-[#7b8494]">{formatDate(r.createdAt)}</span>
              </div>
              <p className="mb-4 whitespace-pre-wrap leading-6 text-[#344054]">{r.comment || 'No written comment.'}</p>
              <p className="mb-0 text-sm text-[#7b8494]">
                {r.reviewerName} on{' '}
                <Link className="font-semibold text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]" to={`/tasks/${r.taskId}`}>
                  {r.taskTitle}
                </Link>
              </p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No reviews yet">Reviews appear here after this person completes a task.</EmptyState>
      )}
    </div>
  );
}
