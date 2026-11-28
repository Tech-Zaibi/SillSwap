import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLoad } from '../hooks/useLoad.js';
import { listNotifications, markRead, markAllRead } from '../services/notificationService.js';
import { timeAgo } from '../utils/format.js';
import Icon from '../components/Icons.jsx';
import Btn from '../components/ui/Btn.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';

export default function Notifications() {
  const { user, tick, refresh } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useLoad(() => listNotifications(user.id), [user.id, tick]);

  if (loading && !data) return <LoadingState />;
  if (error) return <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8"><ErrorState error={error} /></div>;
  const unread = data.filter((notification) => !notification.read).length;

  async function open(notification) {
    await markRead(notification.id);
    await refresh();
    navigate(notification.link);
  }

  async function readAll() {
    await markAllRead(user.id);
    await refresh();
    reload();
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Your updates</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="mb-0 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">Notifications</h1>
            {unread > 0 && <span className="rounded-full bg-[#fff0ec] px-3 py-1 text-xs font-bold text-[#b8402c]">{unread} unread</span>}
          </div>
          <p className="mb-0 mt-2 text-sm text-[#667085] sm:text-base">Updates about your tasks, applications, and tokens.</p>
        </div>
        {unread > 0 && (
          <Btn variant="ghost" className="rounded-xl" onClick={readAll}>Mark all as read</Btn>
        )}
      </div>

      {data.length ? (
        <section className="overflow-hidden rounded-2xl border border-[#e1e8e9] bg-white shadow-[0_8px_30px_rgba(25,35,59,0.04)]" aria-label="Notification list">
          {data.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => open(notification)}
              className={`group flex w-full cursor-pointer items-start gap-4 border-b border-[#edf1f2] p-4 text-left transition last:border-b-0 sm:p-5 ${
                notification.read ? 'bg-white hover:bg-[#f8faf9]' : 'bg-[#f1faf7] hover:bg-[#eaf6f2]'
              }`}
            >
              <span className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${notification.read ? 'bg-[#f1f5f6] text-[#7b8494]' : 'bg-[#dff2ec] text-[#0a6b61]'}`}>
                <Icon name="bell" className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm leading-6 ${notification.read ? 'font-medium text-[#475467]' : 'font-bold text-[#25324a]'}`}>
                  {notification.text}
                </span>
                <span className="mt-1 block text-xs text-[#8a94a6]">{timeAgo(notification.createdAt)}</span>
              </span>
              {!notification.read && <span aria-label="Unread" className="mt-2 h-2.5 w-2.5 flex-none rounded-full bg-[#0e8a7d]" />}
              <span aria-hidden="true" className="mt-1 text-sm text-[#98a2b3] transition group-hover:translate-x-0.5 group-hover:text-[#0e8a7d]">→</span>
            </button>
          ))}
        </section>
      ) : (
        <EmptyState title="No notifications yet">You will see updates about your tasks and tokens here.</EmptyState>
      )}
    </div>
  );
}
