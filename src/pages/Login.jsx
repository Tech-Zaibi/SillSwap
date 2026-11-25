import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errorMessage } from '../utils/messages.js';
import AuthLayout from '../components/ui/AuthLayout.jsx';
import TextField from '../components/ui/TextField.jsx';
import Button from '../components/ui/Button.jsx';
import { MailIcon, LockIcon } from '../components/ui/AuthIcons.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.getDashboardRoute()} replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const u = await login(form.email, form.password);
      toast(`Welcome back, ${u.name.split(' ')[0]}.`, 'success');
      navigate(location.state?.from || u.getDashboardRoute(), { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back to SkillSwap."
      footer={
        <>
          No account?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-coral/30 bg-coral/10 px-3.5 py-2.5 text-sm text-coral">
          {error}
        </div>
      )}

      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          icon={<MailIcon />}
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          icon={<LockIcon />}
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" loading={busy} className="w-full">
          {busy ? 'Logging in...' : 'Log in'}
        </Button>
      </form>

      <div className="mt-5 rounded-lg border border-brand/20 bg-brand/5 p-3 text-sm text-ink">
        <p className="font-semibold">Demo accounts</p>
        <p className="mt-1 text-muted">Member: ali@demo.com / password123</p>
        <p className="text-muted">Admin: admin@skillswap.com / admin123</p>
      </div>
    </AuthLayout>
  );
}