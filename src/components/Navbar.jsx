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
    <header className="navbar">
      <div className="site-container">
        <Link to="/" className="brand"><span className="brand-coin" />SkillSwap</Link>
        <nav className="nav-links" aria-label="Main">
          {user?.role === 'user' && (
            <>
              <NavLink to="/dashboard"><Icon name="dashboard" /><span className="nav-label">Dashboard</span></NavLink>
              <NavLink to="/tasks" end><Icon name="browse" /><span className="nav-label">Browse tasks</span></NavLink>
              <NavLink to="/my-tasks"><Icon name="tasks" /><span className="nav-label">My tasks</span></NavLink>
              <NavLink to="/wallet"><Icon name="wallet" /><span className="nav-label">Wallet</span></NavLink>
            </>
          )}
          {user?.role === 'admin' && <NavLink to="/admin"><Icon name="admin" /><span className="nav-label">Admin</span></NavLink>}
          {user && (
            <NavLink to="/notifications" className="bell" aria-label={`Notifications, ${unread} unread`}>
            <Icon name="bell" /><span className="nav-label">Alerts</span>{unread > 0 && <span className="bell-count">{unread}</span>}
            </NavLink>
          )}
        </nav>
        {user?.role === 'user' && <Link to="/tasks/new" className="btn btn-gold btn-sm"><Icon name="plus" />Post a task</Link>}
        {user && (
          <select className="demo-switch" value="" onChange={(e) => switchTo(e.target.value)} aria-label="Demo: switch user">
            <option value="">Demo: switch user</option>
            {demoUsers.map((u) => <option key={u.id} value={u.id}>{u.name}{u.role === 'admin' ? ' (admin)' : ''}</option>)}
          </select>
        )}
        {user ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}><Icon name="logout" />Log out</button>
            {/* Profile sits at the far right: photo (or initials) + name */}
            <NavLink to="/profile" className="profile-chip" aria-label={`Your profile (${user.name})`} title={user.name}>
              <Avatar user={user} size={38} />
            </NavLink>
          </>
        ) : (
          <div className="row">
            <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-gold btn-sm">Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}