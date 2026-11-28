import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { getTransactions } from '../services/tokenService.js';
import { TX_LABELS } from '../domain/constants.js';
import { formatDate } from '../utils/format.js';
import Icon from '../components/Icons.jsx';
import { Pill } from '../components/ui/Pill.jsx';
import { TableCard, Th, Td } from '../components/ui/TableCard.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';

const SIGN = { bonus: '+', earned: '+', refund: '+', spent: '-', locked: '-' };

export default function Wallet() {
  const { user, tick } = useAuth();
  const [type, setType] = useState('');
  const { data, loading, error } = useLoad(() => getTransactions(user.id), [user.id, tick]);
  const { wallet } = user;

  if (loading && !data) return <LoadingState />;
  if (error) return <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><ErrorState error={error} /></div>;
  const rows = type ? data.filter((transaction) => transaction.type === type) : data;
  const stats = [
    { label: 'Available to spend', value: wallet.available, tone: 'bg-[#e6f5f1] text-[#0a6b61]' },
    { label: 'Locked in escrow', value: wallet.locked, tone: 'bg-[#fff4d8] text-[#936700]' },
    { label: 'Total tokens', value: wallet.total, tone: 'bg-[#eaf0ff] text-[#415caa]' },
  ];

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Your Skill Token balance</p>
        <h1 className="mb-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">Wallet</h1>
        <p className="mb-0 text-sm text-[#667085] sm:text-base">Track your tokens and see how they move through the marketplace.</p>
      </div>

      <section aria-label="Wallet balances" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[#667085]">{stat.label}</span>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}>
                <Icon name="wallet" className="h-5 w-5" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <strong className="font-['Bricolage_Grotesque'] text-3xl font-bold tracking-tight text-[#19233b]">{Number(stat.value).toLocaleString()}</strong>
              <span className="text-sm text-[#7b8494]">tokens</span>
            </div>
          </div>
        ))}
      </section>

      <div className="mb-7 flex items-start gap-3 rounded-2xl border border-[#f1dfb6] bg-[#fff9e9] p-4 text-sm text-[#755a1b]">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#fff0c8] text-[#936700]">
          <Icon name="wallet" className="h-5 w-5" />
        </span>
        <p className="mb-0 leading-6">
          <strong className="text-[#614a16]">Your tokens stay yours.</strong> Locked tokens remain in escrow until you approve a task. If the task is cancelled, they return to your available balance.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#edf1f2] px-5 py-5 sm:px-6">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Wallet activity</p>
            <h2 className="mb-0 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Transaction history</h2>
            <p className="mb-0 mt-1 text-sm text-[#7b8494]">{rows.length} transaction{rows.length === 1 ? '' : 's'}</p>
          </div>
          <label className="block w-full sm:w-56">
            <span className="mb-1.5 block text-xs font-semibold text-[#667085]">Filter transactions</span>
            <select
              className="w-full rounded-xl border border-[#dce5e7] bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10"
              value={type}
              onChange={(event) => setType(event.target.value)}
              aria-label="Filter by type"
            >
              <option value="">All types</option>
              {Object.entries(TX_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>
        {rows.length ? (
          <TableCard>
            <thead>
              <tr><Th>Date</Th><Th>Type</Th><Th>Details</Th><Th>Tokens</Th></tr>
            </thead>
            <tbody>
              {rows.map((transaction) => (
                <tr key={transaction.id} className="transition hover:bg-[#f8faf9]">
                  <Td><span className="whitespace-nowrap text-sm text-[#667085]">{formatDate(transaction.createdAt)}</span></Td>
                  <Td><Pill tone={SIGN[transaction.type] === '+' ? 'green' : 'gray'}>{TX_LABELS[transaction.type]}</Pill></Td>
                  <Td>
                    {transaction.taskId ? (
                      <Link className="min-w-[170px] text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]" to={`/tasks/${transaction.taskId}`}>
                        {transaction.note}
                      </Link>
                    ) : <span className="min-w-[170px] text-[#667085]">{transaction.note}</span>}
                  </Td>
                  <Td>
                    <span className={`whitespace-nowrap font-bold ${SIGN[transaction.type] === '+' ? 'text-[#0a6b61]' : 'text-[#344054]'}`}>
                      {SIGN[transaction.type]}{Number(transaction.amount).toLocaleString()}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableCard>
        ) : (
          <div className="p-5">
            <EmptyState title="No transactions to show">
              {type ? 'Try another transaction type.' : 'Complete or post a task to see activity here.'}
            </EmptyState>
          </div>
        )}
      </section>
    </div>
  );
}
