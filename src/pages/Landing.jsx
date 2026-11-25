import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listTasks } from '../services/taskService.js';
import TaskCard from '../components/TaskCard.jsx';

export default function Landing() {
  const { user } = useAuth();
  const { data: tasks } = useLoad(() => listTasks({ sort: 'newest' }), []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Get help with your skills, not your wallet.</h1>
          <p className="lead">
            Finish a small task for someone, earn Skill Tokens, then spend them to hire another
            person for something you need. No money. No matching schedules.
          </p>
          <div className="row">
            {user ? (
              <Link to={user.getDashboardRoute()} className="btn btn-gold">Go to your dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-gold">Create a free account</Link>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
              </>
            )}
          </div>

          {/* The escrow idea in one picture */}
          <div className="escrow-strip" aria-label="How escrow works: tokens move from the requester to escrow, then to the provider">
            <div className="escrow-node"><div className="who">Ali hires Sara</div><div className="amt">-5</div><div className="who">leaves Ali's wallet</div></div>
            <div className="escrow-arrow" aria-hidden="true" />
            <div className="escrow-node mid"><div className="who">Held safely</div><div className="amt">5</div><div className="who">in escrow</div></div>
            <div className="escrow-arrow" aria-hidden="true" />
            <div className="escrow-node"><div className="who">Ali approves the work</div><div className="amt">+5</div><div className="who">reaches Sara's wallet</div></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>How it works</h2>
        <ol className="steps">
          <li><h3>Post or pick a task</h3><p className="muted">Describe what you need, or browse tasks that match your skills.</p></li>
          <li><h3>Tokens are locked</h3><p className="muted">When you accept an applicant, the reward is held in escrow so both sides are protected.</p></li>
          <li><h3>Approve and pay</h3><p className="muted">Review the delivered work. Approve it and the tokens go to the provider.</p></li>
          <li><h3>Spend what you earn</h3><p className="muted">Save your tokens and use them whenever you need help with something else.</p></li>
        </ol>
      </section>

      <section className="section container">
        <div className="page-head"><h2>Open tasks right now</h2><Link to={user ? '/tasks' : '/login'} className="btn btn-ghost">See all tasks</Link></div>
        <div className="grid cols-3">
          {(tasks || []).slice(0, 3).map((t) => <TaskCard key={t.id} task={t} />)}
        </div>
      </section>
    </>
  );
}
