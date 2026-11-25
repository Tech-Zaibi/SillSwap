import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Field, TagInput } from '../components/Field.jsx';
import { SIGNUP_BONUS } from '../domain/constants.js';
import { errorMessage } from '../utils/messages.js';
import AuthLayout from '../components/ui/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import { UserIcon, MailIcon, LockIcon } from '../components/ui/AuthIcons.jsx';

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
    <AuthLayout
      title="Create your account"
      subtitle={`You get ${SIGNUP_BONUS} free Skill Tokens when you join.`}
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField
          label="Full name"
          icon={<UserIcon />}
          autoComplete="name"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />
        <TextField
          label="Email"
          type="email"
          icon={<MailIcon />}
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          icon={<LockIcon />}
          autoComplete="new-password"
          hint="At least 6 characters."
          value={form.password}
          onChange={set('password')}
          error={errors.password}
        />

        {/* Still the old Field + TagInput. We restyle these in a later phase. */}
        <Field label="Your skills (optional)" id="skills" hint="For example: Python, Figma, SQL.">
          <TagInput
            id="skills"
            value={form.skills}
            onChange={(skills) => setForm({ ...form, skills })}
          />
        </Field>

        <Button type="submit" loading={busy} className="w-full">
          {busy ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}