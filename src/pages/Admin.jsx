import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import * as admin from '../services/adminService.js';
import { resolveDispute } from '../services/escrowService.js';
import { listUsers } from '../services/authService.js';
import { TX_LABELS } from '../domain/constants.js';
import { formatDate } from '../utils/format.js';
import { errorMessage } from '../utils/messages.js';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';
import { StatusBadge, Token } from '../components/Badges.jsx';
import { ConfirmModal } from '../components/Modal.jsx';

const TABS = ['Overview', 'Users', 'Tasks', 'Disputes', 'Transactions'];

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="container page">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Admin panel</h1></div>
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Overview' && <Overview />}
      {tab === 'Users' && <Users />}
      {tab === 'Tasks' && <AllTasks />}
      {tab === 'Disputes' && <Disputes />}
      {tab === 'Transactions' && <Transactions />}
    </div>
  );
}

function Overview() {
  const { user, tick } = useAuth();
  const { data, loading, error } = useLoad(() => admin.getStats(user.id), [user.id, tick]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const items = [
    ['Members', data.users], ['Suspended', data.suspended], ['Open tasks', data.openTasks], ['Active tasks', data.activeTasks],
    ['Open disputes', data.disputes], ['Tokens in escrow', data.tokensInEscrow], ['Tokens in the system', data.tokensTotal],
  ];
  return (
    <div className="grid stats">
      {items.map(([label, num]) => <div className="card stat" key={label}><div className="num">{num}</div><div className="label">{label}</div></div>)}
    </div>
  );
}

function Users() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useLoad(() => listUsers(), []);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  async function toggle(u) {
    try {
      await admin.setSuspended(user.id, u.id, !u.suspended);
      toast(u.suspended ? `${u.name} was reactivated.` : `${u.name} was suspended.`, 'success');
      await refresh();
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  return (
    <div className="card flat table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Tokens</th><th>Status</th><th /></tr></thead>
        <tbody>
          {data.map((u) => (
            <tr key={u.id}>
              <td>{u.role === 'user' ? <Link to={`/users/${u.id}`}>{u.name}</Link> : u.name}</td>
              <td>{u.email}</td><td>{u.role}</td>
              <td>{u.wallet.available} ({u.wallet.locked} locked)</td>
              <td>{u.suspended ? <span className="badge Disputed">Suspended</span> : <span className="badge Completed">Active</span>}</td>
              <td>{u.role === 'user' && <button className={`btn btn-sm ${u.suspended ? 'btn-primary' : 'btn-ghost'}`} onClick={() => toggle(u)}>{u.suspended ? 'Reactivate' : 'Suspend'}</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AllTasks() {
  const { user } = useAuth();
  const { data, loading, error } = useLoad(() => admin.listAllTasks(user.id), [user.id]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <div className="card flat table-wrap">
      <table>
        <thead><tr><th>Task</th><th>Requester</th><th>Provider</th><th>Reward</th><th>Status</th></tr></thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id}>
              <td><Link to={`/tasks/${t.id}`}>{t.title}</Link></td><td>{t.requesterName}</td><td>{t.providerName || '-'}</td>
              <td><Token amount={t.reward} /></td><td><StatusBadge status={t.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Disputes() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null); // { task, decision }
  const { data, loading, error, reload } = useLoad(async () => (await admin.listAllTasks(user.id)).filter((t) => t.status === 'Disputed'), [user.id]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  async function decide() {
    try {
      await resolveDispute(confirm.task.id, user.id, confirm.decision);
      toast('Dispute resolved.', 'success');
      await refresh();
      reload();
    } catch (err) {
      toast(errorMessage(err), 'error');
    }
  }

  if (!data.length) return <Empty title="No open disputes">When a requester or provider raises a dispute, it shows up here.</Empty>;
  return (
    <div className="stack">
      {data.map((t) => (
        <div className="card" key={t.id}>
          <div className="row between"><h3 style={{ margin: 0 }}><Link to={`/tasks/${t.id}`}>{t.title}</Link></h3><Token amount={t.reward} /></div>
          <p className="muted small">{t.requesterName} (requester) and {t.providerName} (provider)</p>
          <p><strong>Reason:</strong> {t.disputeReason}</p>
          <div className="row">
            <button className="btn btn-primary btn-sm" onClick={() => setConfirm({ task: t, decision: 'release' })}>Release to {t.providerName}</button>
            <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ task: t, decision: 'refund' })}>Refund {t.requesterName}</button>
          </div>
        </div>
      ))}
      {confirm && (
        <ConfirmModal
          danger={confirm.decision === 'refund'}
          title={confirm.decision === 'release' ? 'Release tokens to the provider?' : 'Refund the requester?'}
          message={`${confirm.task.reward} tokens will ${confirm.decision === 'release' ? `go to ${confirm.task.providerName}` : `return to ${confirm.task.requesterName}`}.`}
          confirmLabel={confirm.decision === 'release' ? 'Release tokens' : 'Refund tokens'}
          onConfirm={decide}
          onClose={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function Transactions() {
  const { user } = useAuth();
  const { data, loading, error } = useLoad(() => admin.listAllTransactions(user.id), [user.id]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  return (
    <div className="card flat table-wrap">
      <table>
        <thead><tr><th>Date</th><th>User</th><th>Type</th><th>Details</th><th>Tokens</th></tr></thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id}><td>{formatDate(t.createdAt)}</td><td>{t.userName}</td><td>{TX_LABELS[t.type]}</td><td>{t.taskId ? <Link to={`/tasks/${t.taskId}`}>{t.note}</Link> : t.note}</td><td>{t.amount}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
