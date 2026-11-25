# SkillSwap (frontend)

A skill-based micro-freelancing platform. Users earn **Skill Tokens** by completing tasks and spend them to hire others. Tokens are held in **escrow** until the requester approves the work.

This is a complete frontend. There is no server yet: a "mock backend" in `src/services` saves everything in the browser's localStorage, so the full workflow works today. Later you replace the localStorage calls with `fetch()` calls to a real backend.

## Run it

```bash
npm install
npm run dev        # opens http://localhost:5173
npm test           # runs the automated tests
npm run build      # production build
```

Demo logins (created automatically on first run):

| Role | Email | Password |
|---|---|---|
| Member | ali@demo.com (also sara, hamza, ayesha, bilal, zara @demo.com) | password123 |
| Admin | admin@skillswap.com | admin123 |

Use the **"Demo: switch user"** menu in the navbar to jump between accounts. To reset all data, clear the site's localStorage in browser dev tools (Application tab) and reload.

## Demo script (2 minutes)

1. Log in as **Ali**. Open "Build a Figma prototype..." and **Accept** Zara. Tokens move to "locked" (see Wallet).
2. Switch to **Zara**. Open the task, **Start working**, then **Submit work**.
3. Switch back to **Ali**. **Approve and pay**. Tokens move to Zara. Leave a review.
4. Switch to **Admin** to see users, tasks, disputes and every transaction.
5. Try a dispute: as Sara on "Create a Python script..." click **Raise a dispute**, then resolve it as Admin.

## Folder guide (what each part does)

```
src/
  domain/        Pure JavaScript. No React. The "rules" of the app.
    Wallet.js        Token balance with PRIVATE fields (encapsulation)
    models/User.js   User and Admin classes (inheritance + polymorphism)
    taskStatus.js    Which task status may follow which (state machine)
    errors.js        Custom error classes (error handling)
    constants.js     Categories, signup bonus, max revisions
  services/      The mock backend. Each file is one area of the system.
    storage.js       localStorage wrapper (swap for a database/API later)
    authService.js   Register, login, profile
    taskService.js   Create, list, search, filter, apply
    escrowService.js Accept (lock), start, submit, approve (release), revise, dispute, cancel (refund)
    tokenService.js  Transaction history and wallet totals
    reviewService.js Ratings and reviews
    notificationService.js  Alerts
    adminService.js  Stats, suspend users, all tasks and transactions
    seed.js          Demo users and tasks
  context/       App-wide state: who is logged in (Auth) and pop-up messages (Toast)
  hooks/useLoad.js  Small helper that loads data and tracks loading/error
  components/    Reusable UI pieces (Navbar, TaskCard, Modal, StatusTimeline...)
  pages/         One file per screen
  utils/         Validation rules, date formatting, error messages
  tests/         Automated tests
```

## Where each construction concept lives

| Concept from the proposal | Where |
|---|---|
| Encapsulation | `domain/Wallet.js` (private `#available`, `#locked`) and `User.js` (private `#wallet`) |
| Inheritance | `Admin extends User` in `domain/models/User.js` |
| Polymorphism | `getDashboardRoute()` and `getPermissions()` overridden by `Admin` |
| Collections and iteration | `taskService.listTasks` (filter, sort), `Wallet.jsx` and `Tasks.jsx` (map), `adminService.getStats` (reduce) |
| Modular design | The folder structure above: UI never touches storage directly, it calls services |
| Error handling | `domain/errors.js`, `utils/messages.js`, field errors in forms, toasts, `ErrorBoundary.jsx` |
| Testing | `src/tests/` (wallet, state machine, escrow flow, page rendering) |

## Design decisions beyond the proposal

- New users get **10 free tokens** so they can hire someone before earning.
- A requester can ask for **2 revision rounds**. After that they must raise a dispute.
- Cancelling an Assigned task **refunds** the locked tokens. Disputes are settled by an admin (release or refund).
- Tokens are locked only when an applicant is accepted. Posting a task with a reward above your balance shows a warning.
- Passwords are only lightly encoded here. A real backend must hash them (bcrypt or argon2).

## Moving to a real backend later

Keep the function names and arguments in `src/services/*.js`. Replace the body of each function with a `fetch('/api/...')` call. The pages and components will not need to change.
