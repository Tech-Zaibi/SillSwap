import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { unreadCount } from '../services/notificationService.js';
import { listUsers } from '../services/authService.js';
import Avatar from './Avatar.jsx';
import Icon from './Icons.jsx';

export default function Navbar() {
  const { user, tick, logout, loginAs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [demoUsers, setDemoUsers] = useState([]);

  // Re-count unread notifications when the page or data changes.
  useEffect(() => { setUnread(user ? unreadCount(user.id) : 0); }, [user, tick, location.pathname]);
  useEffect(() => { listUsers().then(setDemoUsers); }, [tick]);

  async function switchTo(id) {
    if (!id) return;
    const target = demoUsers.find((u) => u.id === id);
    await loginAs(id);
    navigate(target.getDashboardRoute());
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#16263f]/95 text-white shadow-[0_8px_28px_rgba(25,35,59,0.12)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link to="/" className="order-1 mr-auto inline-flex items-center gap-2 font-['Bricolage_Grotesque'] text-xl font-extrabold text-white no-underline">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e8a500] text-sm font-bold text-[#19233b]">S</span>
          SkillSwap
        </Link>
        <nav key={`${location.pathname}-${user?.role || 'guest'}`} className="nav-links order-3 flex w-full flex-wrap items-center gap-1 lg:order-2 lg:w-auto" aria-label="Main">
          {user?.role === 'user' && (
            <>
              <NavLink to="/dashboard" aria-label="Dashboard" className={({ isActive }) => `inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold no-underline transition hover:bg-white/10 ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`}>
                <Icon name="dashboard" className="h-4 w-4" /><span className="nav-label sr-only lg:not-sr-only">Dashboard</span>
              </NavLink>
              <NavLink to="/tasks" end aria-label="Browse tasks" className={({ isActive }) => `inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold no-underline transition hover:bg-white/10 ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`}>
                <Icon name="browse" className="h-4 w-4" /><span className="nav-label sr-only lg:not-sr-only">Browse tasks</span>
              </NavLink>
              <NavLink to="/my-tasks" aria-label="My tasks" className={({ isActive }) => `inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold no-underline transition hover:bg-white/10 ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`}>
                <Icon name="tasks" className="h-4 w-4" /><span className="nav-label sr-only lg:not-sr-only">My tasks</span>
              </NavLink>
              <NavLink to="/wallet" aria-label="Wallet" className={({ isActive }) => `inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold no-underline transition hover:bg-white/10 ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`}>
                <Icon name="wallet" className="h-4 w-4" /><span className="nav-label sr-only lg:not-sr-only">Wallet</span>
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" aria-label="Admin" className={({ isActive }) => `inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold no-underline transition hover:bg-white/10 ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`}>
              <Icon name="admin" className="h-4 w-4" /><span className="nav-label sr-only lg:not-sr-only">Admin</span>
            </NavLink>
          )}
          {user && (
            <NavLink
              to="/notifications"
              className={({ isActive }) => `relative inline-flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold no-underline transition hover:bg-white/10 ${isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white'}`}
              aria-label={`Notifications, ${unread} unread`}
            >
              <Icon name="bell" className="h-4 w-4" />
              <span className="nav-label sr-only lg:not-sr-only">Alerts</span>
              {unread > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-[#c8442b] px-1 text-[10px] font-bold text-white">{unread}</span>}
            </NavLink>
          )}
        </nav>
        {user?.role === 'user' && (
          <Link to="/tasks/new" className="order-2 inline-flex items-center gap-2 rounded-xl bg-[#e8a500] px-3 py-2 text-sm font-bold text-[#19233b] no-underline transition hover:bg-[#f4b51b] lg:order-3">
            <Icon name="plus" className="h-4 w-4" /><span className="hidden sm:inline">Post a task</span><span className="sm:hidden">Post</span>
          </Link>
        )}
        {user && (
          <select className="order-4 w-[130px] rounded-lg border border-white/25 bg-[#1e334b] px-2 py-2 text-xs font-semibold text-white outline-none transition focus:border-[#a9e3d8] focus:ring-2 focus:ring-[#a9e3d8]/30 sm:w-[170px] sm:text-sm" value="" onChange={(e) => switchTo(e.target.value)} aria-label="Demo: switch user">
            <option className="bg-white text-[#19233b]" value="">Switch user</option>
            {demoUsers.map((u) => <option className="bg-white text-[#19233b]" key={u.id} value={u.id}>{u.name}{u.role === 'admin' ? ' (admin)' : ''}</option>)}
          </select>
        )}
        {user ? (
          <div className="order-5 flex items-center gap-2">
            <button type="button" className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#35a396] bg-[#0e8a7d] px-2.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a6b61] hover:shadow-md" onClick={() => { logout(); navigate('/'); }}>
              <Icon name="logout" className="h-4 w-4" /><span>Log out</span>
            </button>
            <NavLink to="/profile" className={({ isActive }) => `rounded-full transition hover:ring-2 hover:ring-[#a9e3d8] ${isActive ? 'ring-2 ring-[#a9e3d8]' : ''}`} aria-label={`Your profile (${user.name})`} title={user.name}>
              <Avatar user={user} size={36} />
            </NavLink>
          </div>
        ) : (
          <div className="order-2 flex items-center gap-2 lg:order-3">
            <Link to="/login" className="rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-white no-underline transition hover:bg-white/10">Log in</Link>
            <Link to="/register" className="rounded-lg bg-[#e8a500] px-3 py-2 text-sm font-bold text-[#19233b] no-underline transition hover:bg-[#f4b51b]">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}