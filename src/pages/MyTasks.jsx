import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listMyTasks } from '../services/taskService.js';
import { actionHint } from '../utils/taskActions.js';
import TaskCard from '../components/TaskCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';

const TABS = [
  { key: 'posted', label: 'Posted by me', empty: 'You have no active posted tasks.' },
  { key: 'working', label: 'Working on', empty: 'You are not working on any task right now.' },
  { key: 'applied', label: 'Applied to', empty: 'You have no pending applications.' },
  { key: 'history', label: 'History', empty: 'No finished tasks yet.' },
];

const isFinished = (task) => ['Completed', 'Cancelled'].includes(task.status);

export default function MyTasks() {
  const { user, tick } = useAuth();
  const [tab, setTab] = useState('posted');
  const { data, loading, error } = useLoad(() => listMyTasks(user.id), [user.id, tick]);

  if (loading && !data) return <LoadingState />;
  if (error) return <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><ErrorState error={error} /></div>;

  const everything = new Map();
  [...data.posted, ...data.working, ...data.applied].forEach((task) => everything.set(task.id, task));
  const lists = {
    posted: data.posted.filter((task) => !isFinished(task)),
    working: data.working.filter((task) => !isFinished(task)),
    applied: data.applied.filter((task) => !isFinished(task)),
    history: [...everything.values()].filter(isFinished),
  };
  const current = TABS.find((item) => item.key === tab);
  const list = lists[tab];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Your activity</p>
          <h1 className="mb-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">My tasks</h1>
          <p className="mb-0 text-sm text-[#667085] sm:text-base">Keep track of work you post, work you take on, and your task history.</p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0e8a7d] px-4 py-2.5 text-sm font-bold text-white no-underline shadow-sm transition hover:bg-[#0a6b61] hover:shadow-md"
        >
          <span aria-hidden="true" className="text-lg leading-none">+</span>
          Post a task
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="Task groups">
        {TABS.map((item, index) => {
          const selected = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.key)}
              style={{ animationDelay: `${index * 70}ms` }}
              className={`page-content-enter flex cursor-pointer items-center justify-between gap-3 rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e8a7d] ${
                selected
                  ? 'border-[#a9d8ce] bg-[#eff8f5] shadow-sm'
                  : 'border-[#e1e8e9] bg-white hover:border-[#c5ded9]'
              }`}
            >
              <span>
                <span className={`block text-sm font-bold ${selected ? 'text-[#0a6b61]' : 'text-[#344054]'}`}>{item.label}</span>
                <span className="mt-1 block text-xs text-[#7b8494]">{selected ? 'Currently selected' : 'View task group'}</span>
              </span>
              <span className={`grid h-9 min-w-9 place-items-center rounded-full px-2 text-sm font-bold ${selected ? 'bg-[#0e8a7d] text-white' : 'bg-[#f1f5f6] text-[#667085]'}`}>
                {lists[item.key].length}
              </span>
            </button>
          );
        })}
      </div>

      <section key={tab} className="page-content-enter">
        {list.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {list.map((task) => <TaskCard key={task.id} task={task} hint={actionHint(task, user.id)} showStatus />)}
          </div>
        ) : (
          <EmptyState title={current.empty}>
            {tab === 'posted' ? 'Share a task with the community to get started.' : 'Explore the marketplace and find your next opportunity.'}
            {' '}
            <Link
              className="font-semibold text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]"
              to={tab === 'posted' ? '/tasks/new' : '/tasks'}
            >
              {tab === 'posted' ? 'Post a task' : 'Browse tasks'}
            </Link>
          </EmptyState>
        )}
      </section>
    </div>
  );
}
