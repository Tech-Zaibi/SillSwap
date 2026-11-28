import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listTasks } from '../services/taskService.js';
import TaskCard from '../components/TaskCard.jsx';

const ESCROW_ARROW_CLASS = 'h-0.5 w-7 animate-[flow_1s_linear_infinite] bg-[repeating-linear-gradient(90deg,#e8a500_0_6px,transparent_6px_10px)] [background-position:0_0] max-sm:mx-auto max-sm:h-5 max-sm:w-[3px] max-sm:bg-[repeating-linear-gradient(180deg,#e8a500_0_6px,transparent_6px_10px)]';

export default function Landing() {
  const { user } = useAuth();
  const { data: tasks } = useLoad(() => listTasks({ sort: 'newest' }), []);

  return (
    <>
      <section className="hero relative overflow-hidden bg-linear-to-br from-ink via-[#1d3a5f] to-brand py-14 text-white sm:py-20">
        <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#a9e3d8]">A community built on shared skills</p>
            <h1 className="mb-5 max-w-[16ch] font-['Bricolage_Grotesque'] text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">Get help with your skills, not your wallet.</h1>
            <p className="mb-7 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
            Finish a small task for someone, earn Skill Tokens, then spend them to hire another
            person for something you need. No money. No matching schedules.
            </p>
          </div>
          <div className="mb-8 flex flex-wrap gap-3">
            {user ? (
              <Link to={user.getDashboardRoute()} className="btn btn-gold inline-flex cursor-pointer items-center rounded-xl bg-[#e8a500] px-5 py-3 font-bold text-[#19233b] no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f4b51b] hover:shadow-md">Go to your dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-gold inline-flex cursor-pointer items-center rounded-xl bg-[#e8a500] px-5 py-3 font-bold text-[#19233b] no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f4b51b] hover:shadow-md">Create a free account</Link>
                <Link to="/login" className="btn btn-ghost inline-flex cursor-pointer items-center rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-white/20">Log in</Link>
              </>
            )}
          </div>

          <div className="mt-10 grid max-w-[760px] grid-cols-1 items-center gap-3 sm:grid-cols-[minmax(0,1fr)_28px_minmax(0,1fr)_28px_minmax(0,1fr)]" aria-label="How escrow works: tokens move from the requester to escrow, then to the provider">
            <div className="rounded-xl border border-white/15 bg-white/[0.08] p-4 text-center">
              <div className="text-sm opacity-[.85]">Ali hires Sara</div>
              <div className="font-display text-[1.7rem] font-extrabold">-5</div>
              <div className="text-sm opacity-[.85]">leaves Ali&apos;s wallet</div>
            </div>
            <div className={ESCROW_ARROW_CLASS} aria-hidden="true" />
            <div className="rounded-xl border border-[#e8a500] bg-[#e8a500] p-4 text-center text-ink">
              <div className="text-sm opacity-[.85]">Held safely</div>
              <div className="font-display text-[1.7rem] font-extrabold">5</div>
              <div className="text-sm opacity-[.85]">in escrow</div>
            </div>
            <div className={ESCROW_ARROW_CLASS} aria-hidden="true" />
            <div className="rounded-xl border border-white/15 bg-white/[0.08] p-4 text-center">
              <div className="text-sm opacity-[.85]">Ali approves the work</div>
              <div className="font-display text-[1.7rem] font-extrabold">+5</div>
              <div className="text-sm opacity-[.85]">reaches Sara&apos;s wallet</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Simple and secure</p>
        <h2 className="mb-6 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b] sm:text-3xl">How it works</h2>
        <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-4">
          <li className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)]"><span className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand font-bold text-white" aria-hidden="true">1</span><h3 className="mb-2 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">Post or pick a task</h3><p className="mb-0 text-sm leading-6 text-[#667085]">Describe what you need, or browse tasks that match your skills.</p></li>
          <li className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)]"><span className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand font-bold text-white" aria-hidden="true">2</span><h3 className="mb-2 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">Tokens are locked</h3><p className="mb-0 text-sm leading-6 text-[#667085]">When you accept an applicant, the reward is held in escrow so both sides are protected.</p></li>
          <li className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)]"><span className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand font-bold text-white" aria-hidden="true">3</span><h3 className="mb-2 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">Approve and pay</h3><p className="mb-0 text-sm leading-6 text-[#667085]">Review the delivered work. Approve it and the tokens go to the provider.</p></li>
          <li className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)]"><span className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand font-bold text-white" aria-hidden="true">4</span><h3 className="mb-2 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">Spend what you earn</h3><p className="mb-0 text-sm leading-6 text-[#667085]">Save your tokens and use them whenever you need help with something else.</p></li>
        </ol>
      </section>

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Get started</p>
            <h2 className="mb-0 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">Open tasks right now</h2>
          </div>
          <Link to={user ? '/tasks' : '/login'} className="inline-flex cursor-pointer items-center rounded-xl border border-[#dce5e7] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] no-underline transition hover:border-[#0e8a7d] hover:bg-[#f1f8f6] hover:text-[#0a6b61]">See all tasks</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(tasks || []).slice(0, 3).map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      </section>
    </>
  );
}
