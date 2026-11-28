// Small rounded labels. Pill picks a color tone; StatusPill picks it from a task status.
const TONES = {
  gray: 'bg-[#eef1f6] text-[#5b667a]',
  blue: 'bg-[#e3eafb] text-[#274091]',
  gold: 'bg-[#fff1cc] text-[#7a5300]',
  purple: 'bg-[#efe3fb] text-[#5b2a8a]',
  green: 'bg-[#ddf3ef] text-[#0a6b61]',
  red: 'bg-[#fbe4de] text-[#c8442b]',
};

const STATUS_TONE = {
  Open: 'blue',
  Assigned: 'gold',
  'In Progress': 'gold',
  Submitted: 'purple',
  Completed: 'green',
  Disputed: 'red',
  Cancelled: 'red',
};

export function Pill({ tone = 'gray', children }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.8rem] font-semibold ${TONES[tone]}`}>{children}</span>;
}

export const StatusPill = ({ status }) => <Pill tone={STATUS_TONE[status] || 'gray'}>{status}</Pill>;