import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listMyTasks } from '../services/taskService.js';
import { getWalletSummary } from '../services/tokenService.js';
import { getRating } from '../services/reviewService.js';
import { actionHint } from '../utils/taskActions.js';
import TaskCard from '../components/TaskCard.jsx';
import { StarDisplay } from '../components/Badges.jsx';
import Icon from '../components/Icons.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';

export default function Dashboard() {
  const { user, tick } = useAuth();
  const { data, loading, error } = useLoad(async () => ({
    my: await listMyTasks(user.id),
    summary: await getWalletSummary(user.id),
    rating: await getRating(user.id),
  }), [user.id, tick]);

  if (loading && !data) return <LoadingState />;
  if (error) return <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><ErrorState error={error} /></div>;

  const unique = new Map();
  [...data.my.posted, ...data.my.working, ...data.my.applied].forEach((task) => unique.set(task.id, task));
  const active = [...unique.values()].filter((task) => !['Completed', 'Cancelled'].includes(task.status));
  const needsAction = active.filter((task) => actionHint(task, user.id));
  const others = active.filter((task) => !actionHint(task, user.id));
  const { wallet } = user;
  const stats = [
    { label: 'Available to spend', value: wallet.available, icon: 'wallet', tone: 'bg-[#e6f5f1] text-[#0a6b61]', link: '/wallet' },
    { label: 'Locked in escrow', value: wallet.locked, icon: 'wallet', tone: 'bg-[#fff4d8] text-[#936700]', link: '/wallet' },
    { label: 'Tokens earned', value: data.summary.earned, icon: 'tasks', tone: 'bg-[#eaf0ff] text-[#415caa]', link: '/wallet' },
    { label: 'Active tasks', value: active.length, icon: 'tasks', tone: 'bg-[#f1eafb] text-[#7046a0]', link: '/my-tasks' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <section className="relative isolate mb-7 overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#16263f_0%,#174d50_58%,#0e8a7d_100%)] px-6 py-7 text-white shadow-[0_18px_45px_rgba(17,57,68,0.16)] sm:px-9 sm:py-9">
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[38px] border-white/[0.06]" />
        <div aria-hidden="true" className="absolute -bottom-28 right-[26%] -z-10 h-56 w-56 rounded-full bg-[#e8a500]/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#a9e3d8]">Your SkillSwap workspace</p>
            <h1 className="mb-3 font-['Bricolage_Grotesque'] text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Hi, {user.name.split(' ')[0]}.
            </h1>
            <p className="mb-4 text-sm leading-6 text-white/75 sm:text-base">
              Pick up where you left off, or find your next opportunity to share a skill.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-white/85">
              {data.rating.count ? (
                <>
                  <StarDisplay value={data.rating.average} />
                  <span className="font-semibold">{data.rating.average}</span>
                  <span>from {data.rating.count} review{data.rating.count === 1 ? '' : 's'}</span>
                </>
              ) : <span>You haven&apos;t received a review yet.</span>}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white no-underline transition hover:bg-white/20"
            >
              Browse tasks
            </Link>
            <Link
              to="/tasks/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e8a500] px-4 py-2.5 text-sm font-bold text-[#19233b] no-underline transition hover:bg-[#f4b51b]"
            >
              <Icon name="plus" className="h-4 w-4" />
              Post a task
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Your account summary" className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="group rounded-2xl border border-[#e1e8e9] bg-white p-5 text-inherit no-underline shadow-[0_8px_30px_rgba(25,35,59,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(25,35,59,0.08)]"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#667085]">{stat.label}</span>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}>
                <Icon name={stat.icon} className="h-5 w-5" />
              </span>
            </div>
            <div className="font-['Bricolage_Grotesque'] text-3xl font-bold tracking-tight text-[#19233b]">{Number(stat.value).toLocaleString()}</div>
            <div className="mt-1 text-xs text-[#8a94a6] group-hover:text-[#0a6b61]">View details <span aria-hidden="true">→</span></div>
          </Link>
        ))}
      </section>

      <section className="mb-9">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Your next steps</p>
            <h2 className="mb-0 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">Needs your attention</h2>
          </div>
          <Link to="/my-tasks" className="text-sm font-semibold text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-4 hover:decoration-[#0a6b61]">
            View my tasks
          </Link>
        </div>
        {needsAction.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {needsAction.map((task) => <TaskCard key={task.id} task={task} hint={actionHint(task, user.id)} showStatus />)}
          </div>
        ) : (
          <EmptyState title="You are all caught up">Nothing is waiting for you right now.</EmptyState>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">In progress</p>
            <h2 className="mb-0 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">Other active tasks</h2>
          </div>
          <Link to="/tasks" className="text-sm font-semibold text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-4 hover:decoration-[#0a6b61]">
            Find a task
          </Link>
        </div>
        {others.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {others.map((task) => <TaskCard key={task.id} task={task} showStatus />)}
          </div>
        ) : (
          <EmptyState title="No other active tasks">
            Browse tasks to find your next opportunity to earn Skill Tokens.
            <Link to="/tasks" className="ml-1 font-semibold text-[#0a6b61] underline underline-offset-2">Browse tasks</Link>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
