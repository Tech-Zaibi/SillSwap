import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Field } from '../components/Field.jsx';
import { errorMessage } from '../utils/messages.js';

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
    <div className="container page">
      <form className="card form-card" onSubmit={submit} noValidate>
        <h2>Log in</h2>
        {error && <div className="alert error" role="alert">{error}</div>}
        <Field label="Email" id="email">
          <input id="email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </Field>
        <Field label="Password" id="password">
          <input id="password" type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </Field>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        <p className="muted small" style={{ marginTop: '1rem' }}>No account? <Link to="/register">Sign up</Link></p>
        <div className="alert info small">
          <strong>Demo accounts</strong><br />
          Member: ali@demo.com / password123<br />
          Admin: admin@skillswap.com / admin123
        </div>
      </form>
    </div>
  );
}
