import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { createTask } from '../services/taskService.js';
import { CATEGORIES } from '../domain/constants.js';
import { Field } from '../components/Field.jsx';
import { errorMessage } from '../utils/messages.js';

export default function NewTask() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: '', deliverables: '', reward: '', deadline: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const cls = (key) => `input${errors[key] ? ' invalid' : ''}`;
  const reward = Number(form.reward);
  const tooExpensive = reward > user.wallet.available;

  async function submit(e) {
    e.preventDefault();
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
    <div className="site-container page">
      <form className="card form-card" onSubmit={submit} noValidate>
        <h2>Post a task</h2>
        <Field label="Title" id="title" error={errors.title}><input id="title" className={cls('title')} value={form.title} onChange={set('title')} /></Field>
        <Field label="Category" id="category" error={errors.category}>
          <select id="category" className={cls('category')} value={form.category} onChange={set('category')}>
            <option value="">Choose a category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Description" id="description" error={errors.description}><textarea id="description" className={cls('description')} value={form.description} onChange={set('description')} /></Field>
        <Field label="What you expect to receive" id="deliverables" error={errors.deliverables}><textarea id="deliverables" className={cls('deliverables')} value={form.deliverables} onChange={set('deliverables')} /></Field>
        <Field label="Reward in Skill Tokens" id="reward" error={errors.reward} hint={`You can spend ${user.wallet.available} tokens right now.`}>
          <input id="reward" type="number" min="1" max="100" className={cls('reward')} value={form.reward} onChange={set('reward')} />
        </Field>
        {tooExpensive && !errors.reward && (
          <div className="alert warn">This reward is more than your balance. You can still post it, but you will need {reward - user.wallet.available} more tokens before you can accept an applicant. Earn some by completing a task.</div>
        )}
        <Field label="Deadline" id="deadline" error={errors.deadline}><input id="deadline" type="date" className={cls('deadline')} value={form.deadline} onChange={set('deadline')} /></Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Posting...' : 'Post task'}</button>
      </form>
    </div>
  );
}
