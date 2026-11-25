import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Field, TagInput } from '../components/Field.jsx';
import { SIGNUP_BONUS } from '../domain/constants.js';
import { errorMessage } from '../utils/messages.js';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', skills: [] });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.getDashboardRoute()} replace />;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const u = await register(form);
      toast(`Account created. ${SIGNUP_BONUS} tokens were added to your wallet.`, 'success');
      navigate(u.getDashboardRoute(), { replace: true });
    } catch (err) {
      if (err.fields) setErrors(err.fields);
      else toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <form className="card form-card" onSubmit={submit} noValidate>
        <h2>Create your account</h2>
        <p className="muted">You get {SIGNUP_BONUS} free Skill Tokens when you join.</p>
        <Field label="Full name" id="name" error={errors.name}>
          <input id="name" className={`input${errors.name ? ' invalid' : ''}`} value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field label="Email" id="email" error={errors.email}>
          <input id="email" type="email" className={`input${errors.email ? ' invalid' : ''}`} value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="Password" id="password" error={errors.password} hint="At least 6 characters.">
          <input id="password" type="password" className={`input${errors.password ? ' invalid' : ''}`} value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <Field label="Your skills (optional)" id="skills" hint="For example: Python, Figma, SQL.">
          <TagInput id="skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} />
        </Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating account...' : 'Create account'}</button>
        <p className="muted small" style={{ marginTop: '1rem' }}>Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
