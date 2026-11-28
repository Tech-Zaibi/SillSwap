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
import Btn from '../components/ui/Btn.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import { TableCard, Th, Td } from '../components/ui/TableCard.jsx';
import { Pill, StatusPill } from '../components/ui/Pill.jsx';
import TokenChip from '../components/ui/TokenChip.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';

const TABS = ['Overview', 'Users', 'Transactions', 'Tasks', 'Disputes'];

export default function Admin() {
  const [tab, setTab] = useState('Overview');

  return (
    <div className="min-h-[75vh] bg-[#f4f7f8]">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-14 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#0e8a7d]">
              <span className="h-2 w-2 rounded-full bg-[#0e8a7d]" />
              SkillSwap workspace
            </div>
            <h1 className="mb-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">
              Admin panel
            </h1>
            <p className="max-w-2xl text-sm text-[#667085] sm:text-base">
              Oversee your community, keep work moving, and manage the marketplace.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[#dce5e7] bg-white px-4 py-2.5 text-sm font-semibold text-[#344054] no-underline shadow-sm transition hover:border-[#0e8a7d] hover:text-[#0a6b61]"
          >
            View marketplace
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="mb-7 rounded-2xl border border-[#e1e8e9] bg-white p-2 shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
        </div>

        <div key={tab} className="admin-page-enter">
          {tab === 'Overview' && <Overview onNavigate={setTab} />}
          {tab === 'Users' && <Users />}
          {tab === 'Tasks' && <AllTasks />}
          {tab === 'Disputes' && <Disputes />}
          {tab === 'Transactions' && <Transactions />}
        </div>
      </div>
    </div>
  );
}

function Overview({ onNavigate }) {
  const { user, tick } = useAuth();
  const { data, loading, error } = useLoad(() => admin.getStats(user.id), [user.id, tick]);
  const firstName = user.name.split(' ')[0];

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const metrics = [
    { label: 'Community members', value: data.users, detail: 'Registered members', icon: 'users', tone: 'teal' },
    { label: 'Open tasks', value: data.openTasks, detail: 'Ready for a match', icon: 'tasks', tone: 'blue' },
    { label: 'Active tasks', value: data.activeTasks, detail: 'Currently in progress', icon: 'activity', tone: 'gold' },
    { label: 'Open disputes', value: data.disputes, detail: 'Require your attention', icon: 'alert', tone: 'rose' },
  ];

  return (
    <div className="space-y-6">
      <section className="relative isolate overflow-hidden rounded-3xl bg-[linear-gradient(115deg,#16263f_0%,#174d50_58%,#0e8a7d_100%)] px-6 py-7 text-white shadow-[0_18px_45px_rgba(17,57,68,0.18)] sm:px-9 sm:py-9">
        <div aria-hidden="true" className="absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border-[38px] border-white/[0.06]" />
        <div aria-hidden="true" className="absolute -bottom-28 right-[26%] -z-10 h-56 w-56 rounded-full bg-[#e8a500]/10 blur-2xl" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
              <AdminIcon name="shield" className="h-4 w-4" />
              ADMINISTRATOR WORKSPACE
            </div>
            <h2 className="mb-3 font-['Bricolage_Grotesque'] text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Welcome back, {firstName}.
            </h2>
            <p className="mb-0 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Here&apos;s what&apos;s happening across your SkillSwap community. Review important items and keep the marketplace running smoothly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('Disputes')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8a500] px-4 py-2.5 text-sm font-bold text-[#19233b] shadow-sm transition hover:bg-[#f4b51b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Review disputes
              <AdminIcon name="arrow" className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('Users')}
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Manage members
            </button>
          </div>
        </div>
      </section>

      <section aria-label="Marketplace statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
        <section className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Action center</p>
              <h3 className="mb-0 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Needs your attention</h3>
            </div>
            <span className="rounded-full bg-[#f1f5f6] px-3 py-1 text-xs font-semibold text-[#667085]">Priority items</span>
          </div>
          <div className="divide-y divide-[#edf1f2]">
            <AttentionItem
              icon="alert"
              title="Review open disputes"
              detail={data.disputes ? `${data.disputes} case${data.disputes === 1 ? '' : 's'} waiting for a decision` : 'No cases are waiting for review'}
              count={data.disputes}
              tone={data.disputes ? 'rose' : 'teal'}
              onClick={() => onNavigate('Disputes')}
            />
            <AttentionItem
              icon="users"
              title="Check suspended accounts"
              detail={data.suspended ? `${data.suspended} member${data.suspended === 1 ? '' : 's'} currently suspended` : 'All member accounts are active'}
              count={data.suspended}
              tone={data.suspended ? 'gold' : 'teal'}
              onClick={() => onNavigate('Users')}
            />
            <AttentionItem
              icon="tasks"
              title="Explore open tasks"
              detail={`${data.openTasks} task${data.openTasks === 1 ? '' : 's'} looking for a skilled match`}
              count={data.openTasks}
              tone="blue"
              onClick={() => onNavigate('Tasks')}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6">
          <div className="mb-5">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Platform overview</p>
            <h3 className="mb-0 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">Token economy</h3>
          </div>
          <div className="rounded-xl bg-[#f7f9f8] p-4 sm:p-5">
            <div className="mb-1 text-sm font-medium text-[#667085]">Tokens currently in escrow</div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff1cc] text-[#9a6b00]">
                <AdminIcon name="coin" className="h-5 w-5" />
              </span>
              <strong className="font-['Bricolage_Grotesque'] text-3xl font-bold tracking-tight text-[#19233b]">
                {Number(data.tokensInEscrow).toLocaleString()}
              </strong>
              <span className="text-sm text-[#667085]">tokens</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 border-b border-[#edf1f2] py-3 text-sm">
            <span className="text-[#667085]">Tokens in the system</span>
            <span className="font-bold text-[#19233b]">{Number(data.tokensTotal).toLocaleString()}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-[#19233b]">Keep the community moving</div>
              <div className="mt-1 text-sm text-[#667085]">Review tasks and member activity.</div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('Tasks')}
              aria-label="View all tasks"
              className="grid h-10 w-10 flex-none place-items-center rounded-full border border-[#dce5e7] text-[#0e8a7d] transition hover:bg-[#eaf5f3]"
            >
              <AdminIcon name="arrow" className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, icon, tone }) {
  const tones = {
    teal: 'bg-[#e6f5f1] text-[#0a6b61]',
    blue: 'bg-[#eaf0ff] text-[#415caa]',
    gold: 'bg-[#fff4d8] text-[#936700]',
    rose: 'bg-[#fff0ec] text-[#b8402c]',
  };

  return (
    <div className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(25,35,59,0.08)]">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#667085]">{label}</span>
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
          <AdminIcon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="font-['Bricolage_Grotesque'] text-3xl font-bold tracking-tight text-[#19233b]">{Number(value).toLocaleString()}</div>
      <div className="mt-1 text-xs text-[#8a94a6]">{detail}</div>
    </div>
  );
}

function AttentionItem({ icon, title, detail, count, tone, onClick }) {
  const tones = {
    teal: 'bg-[#e6f5f1] text-[#0a6b61]',
    blue: 'bg-[#eaf0ff] text-[#415caa]',
    gold: 'bg-[#fff4d8] text-[#936700]',
    rose: 'bg-[#fff0ec] text-[#b8402c]',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 py-4 text-left first:pt-0 last:pb-0"
    >
      <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${tones[tone]}`}>
        <AdminIcon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-[#25324a] group-hover:text-[#0a6b61]">{title}</span>
        <span className="mt-0.5 block text-xs text-[#7b8494]">{detail}</span>
      </span>
      <span className="min-w-8 rounded-full bg-[#f3f6f7] px-2.5 py-1 text-center text-xs font-bold text-[#475467]">{count}</span>
      <AdminIcon name="chevron" className="h-4 w-4 flex-none text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:text-[#0e8a7d]" />
    </button>
  );
}

function Users() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const { data, loading, error, reload } = useLoad(() => listUsers(), []);
  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

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

  const filteredUsers = data.filter((u) =>
    `${u.name} ${u.email} ${u.role} ${u.suspended ? 'suspended' : 'active'}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
      <PanelHeading
        eyebrow="Community"
        title="Members"
        description="Review member accounts, wallet balances, and access status."
        count={`${data.length} total`}
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search members..." label="Search members" />
      </PanelHeading>
      <TableCard>
        <thead>
          <tr>
            <Th>Member</Th><Th>Role</Th><Th>Wallet</Th><Th>Account status</Th><Th><span className="sr-only">Actions</span></Th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr key={u.id} className="transition hover:bg-[#f8faf9]">
              <Td>
                <div className="flex min-w-[210px] items-center gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-[#e6f5f1] text-sm font-bold text-[#0a6b61]">
                    {initials(u.name)}
                  </span>
                  <span className="min-w-0">
                    {u.role === 'user' ? (
                      <Link className="block truncate font-semibold text-[#25324a] no-underline hover:text-[#0a6b61]" to={`/users/${u.id}`}>{u.name}</Link>
                    ) : (
                      <span className="block truncate font-semibold text-[#25324a]">{u.name}</span>
                    )}
                    <span className="block truncate text-xs text-[#7b8494]">{u.email}</span>
                  </span>
                </div>
              </Td>
              <Td><Pill tone={u.role === 'admin' ? 'purple' : 'blue'}>{u.role === 'admin' ? 'Admin' : 'Member'}</Pill></Td>
              <Td>
                <span className="block whitespace-nowrap font-semibold text-[#344054]">{Number(u.wallet.available).toLocaleString()} tokens</span>
                <span className="text-xs text-[#7b8494]">{Number(u.wallet.locked).toLocaleString()} locked</span>
              </Td>
              <Td>{u.suspended ? <Pill tone="red">Suspended</Pill> : <Pill tone="green">Active</Pill>}</Td>
              <Td>
                {u.role === 'user' && (
                  <Btn
                    size="sm"
                    variant={u.suspended ? 'primary' : 'ghost'}
                    className="rounded-lg"
                    onClick={() => toggle(u)}
                  >
                    {u.suspended ? 'Reactivate' : 'Suspend'}
                  </Btn>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {!filteredUsers.length && <div className="p-5"><EmptyState title="No members found">Try a different name, email, or account status.</EmptyState></div>}
    </section>
  );
}

function AllTasks() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const { data, loading, error } = useLoad(() => admin.listAllTasks(user.id), [user.id]);
  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const filteredTasks = data.filter((task) =>
    `${task.title} ${task.requesterName} ${task.providerName || ''} ${task.status}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
      <PanelHeading
        eyebrow="Marketplace"
        title="All tasks"
        description="Track task progress and see who is involved."
        count={`${data.length} total`}
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search tasks..." label="Search tasks" />
      </PanelHeading>
      <TableCard>
        <thead>
          <tr><Th>Task</Th><Th>Requester</Th><Th>Provider</Th><Th>Reward</Th><Th>Status</Th></tr>
        </thead>
        <tbody>
          {filteredTasks.map((task) => (
            <tr key={task.id} className="transition hover:bg-[#f8faf9]">
              <Td>
                <Link className="block min-w-[180px] font-semibold text-[#25324a] no-underline hover:text-[#0a6b61]" to={`/tasks/${task.id}`}>
                  {task.title}
                </Link>
              </Td>
              <Td>{task.requesterName}</Td>
              <Td>{task.providerName || <span className="text-[#98a2b3]">Unassigned</span>}</Td>
              <Td><TokenChip amount={task.reward} /></Td>
              <Td><StatusPill status={task.status} /></Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {!filteredTasks.length && <div className="p-5"><EmptyState title="No tasks found">Try another title, member name, or status.</EmptyState></div>}
    </section>
  );
}

function Disputes() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const [confirm, setConfirm] = useState(null);
  const { data, loading, error, reload } = useLoad(
    async () => (await admin.listAllTasks(user.id)).filter((task) => task.status === 'Disputed'),
    [user.id]
  );
  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

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

  if (!data.length) {
    return (
      <section className="rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6">
        <PanelHeading eyebrow="Marketplace support" title="Dispute review" description="Review both sides and make a resolution." count="All clear" />
        <EmptyState title="No open disputes">When a requester or provider raises a dispute, it will appear here.</EmptyState>
      </section>
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Marketplace support</p>
          <h2 className="mb-1 font-['Bricolage_Grotesque'] text-2xl font-bold text-[#19233b]">Dispute review</h2>
          <p className="mb-0 text-sm text-[#667085]">Review both sides and decide how escrowed tokens should be handled.</p>
        </div>
        <Pill tone="red">{data.length} awaiting review</Pill>
      </div>
      <div className="grid gap-4">
        {data.map((task) => (
          <article key={task.id} className="rounded-2xl border border-[#f1d8d1] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#fff0ec] text-[#b8402c]">
                  <AdminIcon name="alert" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#b8402c]">Dispute case</p>
                  <h3 className="mb-1 truncate font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">
                    <Link className="text-inherit no-underline hover:text-[#0a6b61]" to={`/tasks/${task.id}`}>{task.title}</Link>
                  </h3>
                  <p className="mb-0 text-sm text-[#667085]">{task.requesterName} <span className="text-[#98a2b3]">vs.</span> {task.providerName}</p>
                </div>
              </div>
              <TokenChip amount={task.reward} />
            </div>
            <div className="my-5 rounded-xl bg-[#fff8f5] p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#8b554a]">Reason provided</p>
              <p className="mb-0 text-sm leading-6 text-[#475467]">{task.disputeReason || 'No reason was provided.'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Btn size="sm" className="rounded-lg" onClick={() => setConfirm({ task, decision: 'release' })}>
                Release to {task.providerName}
              </Btn>
              <Btn size="sm" variant="danger" className="rounded-lg" onClick={() => setConfirm({ task, decision: 'refund' })}>
                Refund {task.requesterName}
              </Btn>
            </div>
          </article>
        ))}
      </div>
      {confirm && (
        <ConfirmDialog
          danger={confirm.decision === 'refund'}
          title={confirm.decision === 'release' ? 'Release tokens to the provider?' : 'Refund the requester?'}
          message={`${confirm.task.reward} tokens will ${confirm.decision === 'release' ? `go to ${confirm.task.providerName}` : `return to ${confirm.task.requesterName}`}.`}
          confirmLabel={confirm.decision === 'release' ? 'Release tokens' : 'Refund tokens'}
          onConfirm={decide}
          onClose={() => setConfirm(null)}
        />
      )}
    </>
  );
}

function Transactions() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const { data, loading, error } = useLoad(() => admin.listAllTransactions(user.id), [user.id]);
  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const filteredTransactions = data.filter((transaction) =>
    `${transaction.userName} ${TX_LABELS[transaction.type] || transaction.type} ${transaction.note || ''}`
      .toLowerCase()
      .includes(query.trim().toLowerCase())
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.04)]">
      <PanelHeading
        eyebrow="Token economy"
        title="Transactions"
        description="A record of wallet activity across the marketplace."
        count={`${data.length} total`}
      >
        <SearchInput value={query} onChange={setQuery} placeholder="Search activity..." label="Search transactions" />
      </PanelHeading>
      <TableCard>
        <thead>
          <tr><Th>Date</Th><Th>Member</Th><Th>Type</Th><Th>Details</Th><Th>Tokens</Th></tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction) => (
            <tr key={transaction.id} className="transition hover:bg-[#f8faf9]">
              <Td><span className="whitespace-nowrap text-sm text-[#667085]">{formatDate(transaction.createdAt)}</span></Td>
              <Td><span className="font-semibold text-[#344054]">{transaction.userName}</span></Td>
              <Td><Pill tone="blue">{TX_LABELS[transaction.type] || transaction.type}</Pill></Td>
              <Td>
                {transaction.taskId ? (
                  <Link className="min-w-[170px] text-[#0a6b61] underline decoration-[#b4d9d3] underline-offset-2 hover:decoration-[#0a6b61]" to={`/tasks/${transaction.taskId}`}>
                    {transaction.note}
                  </Link>
                ) : <span className="min-w-[170px] text-[#667085]">{transaction.note}</span>}
              </Td>
              <Td><span className="whitespace-nowrap font-bold text-[#25324a]">{Number(transaction.amount).toLocaleString()}</span></Td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      {!filteredTransactions.length && <div className="p-5"><EmptyState title="No transactions found">Try another member name or transaction detail.</EmptyState></div>}
    </section>
  );
}

function PanelHeading({ eyebrow, title, description, count, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#edf1f2] px-5 py-5 sm:px-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">{eyebrow}</p>
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="mb-0 font-['Bricolage_Grotesque'] text-xl font-bold text-[#19233b]">{title}</h2>
          {count && <span className="rounded-full bg-[#f1f5f6] px-2.5 py-1 text-xs font-semibold text-[#667085]">{count}</span>}
        </div>
        <p className="mb-0 mt-1 text-sm text-[#7b8494]">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder, label }) {
  return (
    <label className="relative block w-full sm:w-64">
      <span className="sr-only">{label}</span>
      <AdminIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#dce5e7] bg-[#fbfcfc] py-2.5 pl-9 pr-3 text-sm text-[#25324a] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10"
      />
    </label>
  );
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function AdminIcon({ name, className = '' }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    tasks: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M8 9h8M8 13h8M8 17h5M9 4V2m6 2V2" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    alert: <><path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M16 8.5c-.6-.8-1.6-1.2-3-1.2-1.6 0-2.7.8-2.7 2s1 1.8 2.7 2.1 2.7.9 2.7 2.2-1.1 2.1-2.9 2.1c-1.3 0-2.4-.5-3.1-1.4M12.7 5.5v13" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
  };

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...common}>
      {paths[name]}
    </svg>
  );
}
