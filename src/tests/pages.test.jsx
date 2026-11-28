import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import { seedIfEmpty } from '../services/seed.js';
import { loginAs, logout } from '../services/authService.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

async function renderAt(path, inspect) {
  const el = document.createElement('div');
  document.body.appendChild(el);
  const root = createRoot(el);
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastProvider><AuthProvider><App /></AuthProvider></ToastProvider>
      </MemoryRouter>
    );
  });
  await act(async () => { await new Promise((r) => setTimeout(r, 20)); });
  if (inspect) await act(async () => inspect(el));
  const text = el.textContent;
  await act(async () => root.unmount());
  el.remove();
  return text;
}

beforeEach(() => { localStorage.clear(); seedIfEmpty(); });

describe('pages render with demo data', () => {
  it('public pages', async () => {
    expect(await renderAt('/')).toContain('Get help with your skills');
    expect(await renderAt('/login')).toContain('Log in');
    expect(await renderAt('/register')).toContain('Create your account');
    expect(await renderAt('/nope')).toContain('Page not found');
  });

  it('redirects guests to login', async () => {
    expect(await renderAt('/wallet')).toContain('Log in');
  });

  it('redirects logged-in members and admins from login to the landing page', async () => {
    const accounts = [
      { userId: 'u_ali', dashboard: '/dashboard' },
      { userId: 'u_admin', dashboard: '/admin' },
    ];

    for (const account of accounts) {
      await loginAs(account.userId);
      await renderAt('/login', async (el) => {
        expect(el.querySelector('.hero h1')?.textContent).toContain('Get help with your skills');
        expect(el.querySelector('.hero a.btn')?.getAttribute('href')).toBe(account.dashboard);
        expect(el.querySelector(`.nav-links a[href="${account.dashboard}"]`)).not.toBeNull();
      });
      logout();
    }
  });

  it('member pages', async () => {
    await loginAs('u_ali');
    const checks = {
      '/dashboard': 'Needs your attention',
      '/tasks': 'Browse tasks',
      '/tasks/new': 'Post a task',
      '/tasks/t_1': 'Applicants',
      '/tasks/t_13': 'Review',
      '/my-tasks': 'My tasks',
      '/wallet': 'Transaction history',
      '/notifications': 'Notifications',
      '/profile': 'Your profile',
      '/users/u_ayesha': 'Reviews',
    };
    for (const [path, expected] of Object.entries(checks)) {
      const text = await renderAt(path);
      expect(text, path).toContain(expected);
      expect(text, path).not.toContain('Something went wrong');
    }
    expect(await renderAt('/admin')).toContain('Needs your attention'); // member is redirected away
    expect(await renderAt('/tasks/t_12')).not.toContain('Approve and pay'); // Ali is not part of this task
    logout();
  });

  it('requester sees approve button on a submitted task', async () => {
    await loginAs('u_hamza');
    expect(await renderAt('/tasks/t_12')).toContain('Approve and pay 4 tokens');
  });

  it('provider can add multiple files and sees combined file-limit errors', async () => {
    await loginAs('u_sara');
    await renderAt('/tasks/t_11', async (el) => {
      expect(el.textContent).not.toContain('Add a folder');
      const fileInput = el.querySelector('input[type="file"][multiple]');
      expect(fileInput).not.toBeNull();
      expect(el.querySelector('input[webkitdirectory]')).toBeNull();

      const files = Array.from({ length: 30 }, (_, index) =>
        new File([`file ${index}`], `file-${index}.txt`)
      );
      Object.defineProperty(fileInput, 'files', {
        configurable: true,
        value: files,
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(el.textContent).toContain('file-0.txt');

      Object.defineProperty(fileInput, 'files', {
        configurable: true,
        value: [new File(['extra'], 'extra.txt')],
      });
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      expect(el.textContent).toContain('You can attach up to 30 files.');
    });
  });

  it('admin pages', async () => {
    await loginAs('u_admin');
    expect(await renderAt('/admin')).toContain('Admin panel');
    expect(await renderAt('/dashboard')).toContain('Admin panel'); // redirected
  });
});
