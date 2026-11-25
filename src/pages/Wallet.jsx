import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { getTransactions } from '../services/tokenService.js';
import { TX_LABELS } from '../domain/constants.js';
import { formatDate } from '../utils/format.js';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

// Which transaction types add tokens to the balance and which take them away.
const SIGN = { bonus: '+', earned: '+', refund: '+', spent: '-', locked: '-' };

export default function Wallet() {
  const { user, tick } = useAuth();
  const [type, setType] = useState('');
  const { data, loading, error } = useLoad(() => getTransactions(user.id), [user.id, tick]);
  const { wallet } = user;

  if (loading && !data) return <Loading />;
  if (error) return <div className="container page"><ErrorBox error={error} /></div>;
  const rows = type ? data.filter((t) => t.type === type) : data;

  return (
    <div className="container page">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Wallet</h1></div>
      <div className="grid stats" style={{ marginBottom: '1rem' }}>
        <div className="card stat"><div className="num">{wallet.available}</div><div className="label">Available to spend</div></div>
        <div className="card stat"><div className="num">{wallet.locked}</div><div className="label">Locked in escrow</div></div>
        <div className="card stat"><div className="num">{wallet.total}</div><div className="label">Total tokens</div></div>
      </div>
      <div className="alert info small">Locked tokens belong to you until you approve a task. If the task is cancelled, they come back to your available balance.</div>

      <div className="card flat">
        <div className="card-head row between">
          <h2 style={{ margin: 0 }}>Transaction history</h2>
          <select className="input" style={{ width: 'auto' }} value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type">
            <option value="">All types</option>
            {Object.entries(TX_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Details</th><th>Tokens</th></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.createdAt)}</td>
                    <td>{TX_LABELS[t.type]}</td>
                    <td>{t.taskId ? <Link to={`/tasks/${t.taskId}`}>{t.note}</Link> : t.note}</td>
                    <td className={SIGN[t.type] === '+' ? 'plus' : 'minus'}>{SIGN[t.type]}{t.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '1.5rem' }}><Empty title="No transactions to show">Complete or post a task to see activity here.</Empty></div>
        )}
      </div>
    </div>
  );
}
