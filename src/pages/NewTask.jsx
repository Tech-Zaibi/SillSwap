import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createTask } from '../services/taskService.js';
import { CATEGORIES } from '../domain/constants.js';
import { Field } from '../components/Field.jsx';
import { errorMessage } from '../utils/messages.js';
import Btn from '../components/ui/Btn.jsx';
import Icon from '../components/Icons.jsx';

const CONTROL_BASE = 'w-full rounded-xl border bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10';

export default function NewTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: '', deliverables: '', reward: '', deadline: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const cls = (key) => `${CONTROL_BASE} ${errors[key] ? 'border-[#c8442b] focus:border-[#c8442b] focus:ring-[#c8442b]/10' : 'border-[#dce5e7]'}`;
  const reward = Number(form.reward);
  const tooExpensive = reward > user.wallet.available;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const task = await createTask(user.id, form);
      toast('Task posted.', 'success');
      navigate(`/tasks/${task.id}`);
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-7 sm:px-6 sm:py-10">
      <div className="mb-7">
        <Link
          to="/dashboard"
          className="mb-4 inline-flex cursor-pointer items-center rounded-xl border border-[#cce7e0] bg-[#e6f5f1] px-4 py-2 text-sm font-semibold text-[#0a6b61] no-underline shadow-sm transition-all delay-75 duration-200 hover:-translate-y-0.5 hover:border-[#0e8a7d] hover:bg-[#0e8a7d] hover:text-white hover:shadow-md"
        >
          Back to dashboard
        </Link>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Share an opportunity</p>
        <h1 className="mb-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">Post a task</h1>
        <p className="mb-0 max-w-2xl text-sm text-[#667085] sm:text-base">Describe what you need, set a fair token reward, and connect with someone in the community.</p>
      </div>

      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-br from-ink via-[#1d3a5f] to-brand p-4 text-white shadow-[0_14px_36px_rgba(17,57,68,0.14)] sm:px-6 sm:py-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#e8a500] text-[#19233b]">
            <Icon name="wallet" className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-wide text-white/70">Available tokens</span>
            <strong className="font-['Bricolage_Grotesque'] text-xl font-bold text-white sm:text-2xl">
              {Number(user.wallet.available).toLocaleString()} tokens
            </strong>
          </span>
        </div>
        <Link to="/wallet" className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/20">
          Manage wallet <span aria-hidden="true">→</span>
        </Link>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-3">
        <form className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6 lg:col-span-2" onSubmit={submit} noValidate>
          <div className="mb-6 border-b border-[#edf1f2] pb-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Task details</p>
            <h2 className="mb-1 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Help others understand what you need</h2>
            <p className="mb-0 text-sm text-[#7b8494]">Specific details make it easier for the right person to respond.</p>
          </div>

          <Field label="Task title" id="title" error={errors.title}>
            <input id="title" className={cls('title')} value={form.title} onChange={set('title')} placeholder="e.g. Build a responsive portfolio page" aria-invalid={Boolean(errors.title)} />
          </Field>

          <Field label="Category" id="category" error={errors.category}>
            <select id="category" className={cls('category')} value={form.category} onChange={set('category')} aria-invalid={Boolean(errors.category)}>
              <option value="">Choose a category</option>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </Field>

          <Field label="Description" id="description" error={errors.description} hint="Include the context and any requirements that will help someone get started.">
            <textarea id="description" className={`${cls('description')} min-h-32 resize-y leading-6`} value={form.description} onChange={set('description')} placeholder="What are you trying to accomplish?" aria-invalid={Boolean(errors.description)} />
          </Field>

          <Field label="What you expect to receive" id="deliverables" error={errors.deliverables} hint="List the final files, results, or deliverables you expect.">
            <textarea id="deliverables" className={`${cls('deliverables')} min-h-28 resize-y leading-6`} value={form.deliverables} onChange={set('deliverables')} placeholder="Describe the finished work..." aria-invalid={Boolean(errors.deliverables)} />
          </Field>

          <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
            <Field label="Reward in Skill Tokens" id="reward" error={errors.reward} hint={`You can spend ${user.wallet.available} tokens right now.`}>
              <input id="reward" type="number" min="1" max="100" className={cls('reward')} value={form.reward} onChange={set('reward')} placeholder="10" aria-invalid={Boolean(errors.reward)} />
            </Field>
            <Field label="Deadline" id="deadline" error={errors.deadline}>
              <input id="deadline" type="date" className={cls('deadline')} value={form.deadline} onChange={set('deadline')} aria-invalid={Boolean(errors.deadline)} />
            </Field>
          </div>

          {tooExpensive && !errors.reward && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-[#f1dfb6] bg-[#fff9e9] p-4 text-sm leading-6 text-[#755a1b]">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#fff0c8] text-[#936700]">
                <Icon name="wallet" className="h-4 w-4" />
              </span>
              <p className="mb-0">This reward is higher than your current balance. You can still post it, but you will need {reward - user.wallet.available} more tokens before accepting an applicant. Earn tokens by completing a task.</p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[#edf1f2] pt-5">
            <Btn type="submit" disabled={busy} className="rounded-xl px-5">
              {busy ? 'Posting...' : 'Post task'}
            </Btn>
            <Link to="/tasks" className="text-sm font-semibold text-[#667085] no-underline transition hover:text-[#0a6b61]">Cancel</Link>
          </div>
        </form>

        <aside className="space-y-4 lg:col-span-1">
          <section className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">A great task post</p>
            <h2 className="mb-4 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">A few helpful tips</h2>
            <ul className="mb-0 list-none space-y-3 pl-0 text-sm text-[#667085]">
              {[
                'Use a clear title that explains the outcome.',
                'Include useful context, constraints, and examples.',
                'Describe exactly what you expect to receive.',
                'Choose a realistic reward and deadline.',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <span className="mt-1 grid h-4 w-4 flex-none place-items-center rounded-full bg-[#e6f5f1] text-[10px] font-bold text-[#0a6b61]">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
