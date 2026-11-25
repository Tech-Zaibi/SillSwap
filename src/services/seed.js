import { hashPassword } from '../utils/hash.js';
import { usersCol, tasksCol, transactionsCol, reviewsCol, notificationsCol } from './storage.js';

const day = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const ago = (n) => new Date(Date.now() - n * 86400000).toISOString();

const user = (id, name, skills, bio, available, locked = 0) => ({
  id, role: 'user', name, email: `${id.slice(2)}@demo.com`, passwordHash: hashPassword('password123'),
  skills, bio, suspended: false, createdAt: ago(30), available, locked,
});

const task = (id, requesterId, title, category, reward, extra = {}) => ({
  id, requesterId, title, category, reward,
  description: extra.description || `${title}. Please reply with your experience and how long you think it will take. Clear communication is appreciated.`,
  deliverables: extra.deliverables || 'Working files plus a short note explaining what you did.',
  deadline: day(extra.days ?? 7), providerId: null, status: 'Open', applications: [], submission: null,
  revisionCount: 0, reviewed: false, createdAt: ago(extra.age ?? 1),
  history: [{ status: 'Open', note: 'Task posted', at: ago(extra.age ?? 1) }], ...extra.rest,
});

// Runs once, the first time the app opens in a browser.
export function seedIfEmpty() {
  if (usersCol.all().length) return;

  usersCol.save([
    { id: 'u_admin', role: 'admin', name: 'Admin', email: 'admin@skillswap.com', passwordHash: hashPassword('admin123'), skills: [], bio: '', suspended: false, createdAt: ago(60), available: 0, locked: 0 },
    user('u_ali', 'Ali Raza', ['Python', 'Django', 'SQL'], 'Backend student who loves clean APIs.', 7, 5),
    user('u_sara', 'Sara Khan', ['Figma', 'UI/UX', 'Branding'], 'Designer building a portfolio.', 7),
    user('u_hamza', 'Hamza Malik', ['React', 'JavaScript', 'CSS'], 'Frontend developer.', 6, 4),
    user('u_ayesha', 'Ayesha Noor', ['Excel', 'Data analysis', 'Technical writing'], 'Loves spreadsheets and clear docs.', 13),
    user('u_bilal', 'Bilal Ahmed', ['Java', 'Spring Boot', 'MySQL'], 'Learning backend engineering.', 10),
    user('u_zara', 'Zara Iqbal', ['Photoshop', 'Illustrator', 'Logo design'], 'Graphic designer.', 10),
  ]);

  const openTasks = [
    task('t_1', 'u_ali', 'Build a Figma prototype for a food delivery app', 'UI/UX design', 5, { days: 6 }),
    task('t_2', 'u_sara', 'Fix a Python script that crashes on empty input', 'Programming', 3, { days: 3, age: 2 }),
    task('t_3', 'u_hamza', 'Design a logo for a student society', 'Graphic design', 4, { days: 8, age: 0 }),
    task('t_4', 'u_ayesha', 'Write SQL queries for a library database', 'Database', 4, { days: 5, age: 3 }),
    task('t_5', 'u_bilal', 'Make a responsive landing page from a mockup', 'Web development', 6, { days: 10, age: 1 }),
    task('t_6', 'u_zara', 'Clean and summarise a messy Excel sheet', 'Data and Excel', 2, { days: 4, age: 2 }),
    task('t_7', 'u_ali', 'Proofread a 5-page project report', 'Writing and docs', 2, { days: 2, age: 0 }),
    task('t_8', 'u_sara', 'Add form validation to a React sign-up page', 'Web development', 3, { days: 5, age: 4 }),
    task('t_9', 'u_hamza', 'Design a business card and poster', 'Graphic design', 5, { days: 9, age: 5 }),
    task('t_10', 'u_bilal', 'Explain and fix a Java NullPointerException', 'Programming', 2, { days: 3, age: 1 }),
  ];
  openTasks[0].applications.push({ id: 'a_1', providerId: 'u_zara', message: 'I have designed three mobile app prototypes in Figma.', status: 'pending', createdAt: ago(0.5) });
  openTasks[0].applications.push({ id: 'a_2', providerId: 'u_hamza', message: 'I can build it in a day and share the Figma file.', status: 'pending', createdAt: ago(0.4) });

  const inProgress = task('t_11', 'u_ali', 'Create a Python script to rename 500 files', 'Programming', 5, {
    days: 4, age: 3, rest: {
      providerId: 'u_sara', status: 'In Progress',
      applications: [{ id: 'a_3', providerId: 'u_sara', message: 'I have done batch file scripts before.', status: 'accepted', createdAt: ago(3) }],
      history: [{ status: 'Open', note: 'Task posted', at: ago(3) }, { status: 'Assigned', note: '5 tokens locked in escrow', at: ago(2) }, { status: 'In Progress', note: 'Provider started work', at: ago(1) }],
    },
  });
  const submitted = task('t_12', 'u_hamza', 'Build a React component for a pricing table', 'Web development', 4, {
    days: 2, age: 4, rest: {
      providerId: 'u_bilal', status: 'Submitted',
      applications: [{ id: 'a_4', providerId: 'u_bilal', message: 'I know React hooks well.', status: 'accepted', createdAt: ago(4) }],
      submission: { text: 'Pricing table with three plans, responsive layout and tests.', link: 'https://github.com/example/pricing-table', submittedAt: ago(0.2) },
      history: [{ status: 'Open', note: 'Task posted', at: ago(4) }, { status: 'Assigned', note: '4 tokens locked in escrow', at: ago(3) }, { status: 'In Progress', note: 'Provider started work', at: ago(2) }, { status: 'Submitted', note: 'Work submitted', at: ago(0.2) }],
    },
  });
  const completed = task('t_13', 'u_sara', 'Convert survey results into charts', 'Data and Excel', 3, {
    days: -2, age: 9, rest: {
      providerId: 'u_ayesha', status: 'Completed', reviewed: true,
      applications: [{ id: 'a_5', providerId: 'u_ayesha', message: 'Charts are my specialty.', status: 'accepted', createdAt: ago(9) }],
      submission: { text: 'Five charts and a summary sheet.', link: '', submittedAt: ago(6) },
      history: [{ status: 'Open', note: 'Task posted', at: ago(9) }, { status: 'Assigned', note: '3 tokens locked in escrow', at: ago(8) }, { status: 'In Progress', note: 'Provider started work', at: ago(7) }, { status: 'Submitted', note: 'Work submitted', at: ago(6) }, { status: 'Completed', note: '3 tokens released to Ayesha Noor', at: ago(5) }],
    },
  });
  tasksCol.save([...openTasks, inProgress, submitted, completed]);

  const tx = (id, userId, type, amount, taskId, note, age) => ({ id, userId, type, amount, taskId, note, createdAt: ago(age) });
  transactionsCol.save([
    tx('tx_1', 'u_ali', 'locked', 5, 't_11', 'Escrow for "Create a Python script to rename 500 files"', 2),
    tx('tx_2', 'u_hamza', 'locked', 4, 't_12', 'Escrow for "Build a React component for a pricing table"', 3),
    tx('tx_3', 'u_ayesha', 'earned', 3, 't_13', 'Completed "Convert survey results into charts"', 5),
    tx('tx_4', 'u_sara', 'spent', 3, 't_13', 'Paid for "Convert survey results into charts"', 5),
    ...['u_ali', 'u_sara', 'u_hamza', 'u_ayesha', 'u_bilal', 'u_zara'].map((id, i) => tx(`tx_b${i}`, id, 'bonus', 10, null, 'Welcome bonus', 30)),
  ]);

  reviewsCol.save([{ id: 'r_1', taskId: 't_13', providerId: 'u_ayesha', reviewerId: 'u_sara', reviewerName: 'Sara Khan', taskTitle: 'Convert survey results into charts', rating: 5, comment: 'Fast, clear and exactly what I needed.', createdAt: ago(4) }]);

  notificationsCol.save([
    { id: 'n_1', userId: 'u_ali', text: 'Zara Iqbal applied to "Build a Figma prototype for a food delivery app".', link: '/tasks/t_1', read: false, createdAt: ago(0.5) },
    { id: 'n_2', userId: 'u_hamza', text: 'Work was submitted for "Build a React component for a pricing table". Please review it.', link: '/tasks/t_12', read: false, createdAt: ago(0.2) },
  ]);
}
