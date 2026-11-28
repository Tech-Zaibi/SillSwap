# SkillSwap

SkillSwap is a skill-based micro-freelancing platform. Members earn **Skill Tokens** by completing tasks and spend them to hire other members. Tokens are held in **escrow** until the requester approves the submitted work.

> **Project status:** This repository contains the complete frontend and a browser-based mock backend. There is no server yet; demo data and workflow changes are stored in the browser's `localStorage`.

## Features

### Members

- Register, sign in, update a profile, and browse member profiles.
- Browse and filter open tasks, post tasks, and apply to tasks.
- Manage posted tasks, applications, active work, and task history.
- Start work, submit files or links, request revisions, approve delivery, or raise a dispute.
- View available and escrowed tokens, transaction history, and notifications.
- Rate completed work and leave reviews.

### Administrators

- View marketplace statistics and manage users.
- Review tasks, disputes, and transactions.
- Resolve disputes by releasing the escrowed tokens to the provider or refunding the requester.

### Interface

- Responsive member and administrator interfaces styled with **Tailwind CSS v4**.
- Page transitions, task progress indicators, accessible form feedback, and notifications.

## Tech stack

- React 18 and React Router 6
- Vite 5
- Tailwind CSS 4 with the Vite plugin
- Browser `localStorage` mock services
- Vitest and jsdom for automated tests

## Run locally

Install Node.js and npm, then run:

```bash
npm install
npm run dev
```

Vite prints the local development URL, usually <http://localhost:5173>.

Other useful commands:

```bash
npm test       # Run the automated tests
npm run build  # Create a production build in dist/
npm run preview # Preview the production build locally
```

## Demo accounts

Demo accounts are seeded automatically on the first visit:

| Role | Email | Password |
|---|---|---|
| Member | `ali@demo.com`, `sara@demo.com`, `hamza@demo.com`, `ayesha@demo.com`, `bilal@demo.com`, `zara@demo.com` | `password123` |
| Admin | `admin@skillswap.com` | `admin123` |

Use the **Switch user** menu in the navbar to move between demo accounts. To reset demo data, clear this site's local storage in your browser's developer tools and reload. SkillSwap stores its data under keys prefixed with `skillswap:`.

**Security note:** These credentials and the frontend's password encoding are for demonstration only. They are not suitable for real accounts or production use.

## Try the task and escrow workflow

1. Sign in as Ali and open **Build a Figma prototype for a food delivery app**.
2. Accept Zara's application. The task reward moves from Ali's available balance into escrow.
3. Switch to Zara, open the task, start work, and submit the result.
4. Switch back to Ali, review the submission, approve it, and leave a review. The escrowed tokens are released to Zara.
5. Switch to the admin account to review marketplace users, tasks, disputes, and transactions.

An eligible task can also be disputed and resolved from the administrator interface.

## Project structure

```text
src/
  domain/             Business rules and models, independent of React
    Wallet.js         Token balances and escrow accounting
    models/User.js    User and Admin classes
    taskStatus.js     Valid task-state transitions
    errors.js         Domain and validation errors
    constants.js      Categories and workflow limits
  services/           Browser-backed mock backend
    storage.js        localStorage wrapper and collections
    authService.js    Registration, login, and profiles
    taskService.js    Task creation, browsing, filtering, and applications
    escrowService.js  Task lifecycle and escrow operations
    tokenService.js   Wallet totals and transaction history
    reviewService.js  Ratings and reviews
    notificationService.js
    adminService.js   Administrator data and actions
    seed.js           Initial demo accounts and tasks
  context/            Authentication and toast state
  hooks/              Shared React hooks
  components/         Reusable interface components
    ui/               Shared form, button, dialog, and table components
  pages/              Landing, member, and administrator screens
  utils/              Validation, formatting, and helper functions
  tests/              Unit and page-rendering tests
```

Tailwind's theme and application-level animations are defined in `src/index.css`. The interface is composed with Tailwind utilities; business logic remains in the domain and service layers.

## Design and workflow rules

- New accounts receive **10 Skill Tokens**.
- Task rewards are locked only after the requester accepts an application.
- Requesters can ask for up to **2 revision rounds** before raising a dispute.
- Cancelling an assigned task refunds its escrow to the requester.
- Administrators settle disputes by releasing the escrow or refunding the requester.
- Tokens are virtual and have no cash value.

## Architecture concepts

| Concept | Example |
|---|---|
| Encapsulation | Private balance fields in `domain/Wallet.js` and the private wallet in `domain/models/User.js` |
| Inheritance | `Admin` extends `User` in `domain/models/User.js` |
| Polymorphism | `getDashboardRoute()` and `getPermissions()` are specialized by `Admin` |
| Collections and iteration | Task filtering, dashboard lists, wallet history, and admin statistics |
| Modular design | Pages call service modules; services own data access and domain operations |
| Error handling | Domain errors, field validation, toast notifications, and `ErrorBoundary` |
| Testing | Wallet, task-state, escrow-flow, and page-rendering tests in `src/tests/` |

## Replacing the mock backend

The current services read and write data in each browser's local storage. This lets one browser demonstrate the workflow, but it does not provide shared accounts, server-side authorization, or data shared between devices.

When adding a backend:

1. Keep the service layer as the boundary between the UI and data access.
2. Replace local storage operations in `src/services/` with requests to the API.
3. Preserve service contracts where practical, updating callers only where asynchronous API behavior requires it.
4. Implement server-side authentication and authorization, input validation, durable storage, and atomic escrow/transaction operations.
5. Store real passwords using a secure password-hashing algorithm such as Argon2id or bcrypt; never rely on the demo frontend's encoding.
