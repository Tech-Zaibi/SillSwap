import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Tasks from './pages/Tasks.jsx';
import NewTask from './pages/NewTask.jsx';
import TaskDetails from './pages/TaskDetails.jsx';
import MyTasks from './pages/MyTasks.jsx';
import Wallet from './pages/Wallet.jsx';
import Notifications from './pages/Notifications.jsx';
import UserProfile from './pages/UserProfile.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';

// Every page shares the same navbar and footer.
function Layout() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main>
        <div key={location.key} className="route-transition">
          <Outlet />
        </div>
      </main>
      <footer className="border-t border-[#e1e8e9] bg-white py-6 text-sm text-[#667085]">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">&copy; {new Date().getFullYear()} SkillSwap. All rights reserved. Tokens here are virtual and have no cash value.</div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* pages for any logged-in user (member or admin) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/users/:id" element={<UserProfile />} />
        </Route>

        {/* member-only pages */}
        <Route element={<ProtectedRoute roles={['user']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<NewTask />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>

        {/* admin-only pages */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
