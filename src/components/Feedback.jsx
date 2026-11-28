import { errorMessage } from '../utils/messages.js';

export const Loading = () => <div className="p-12 text-center text-muted" role="status">Loading...</div>;

export const ErrorBox = ({ error }) => (
  <div className="mb-4 rounded-lg bg-[#fbe4de] px-4 py-3 text-[0.95rem] text-[#7e2412]">
    {errorMessage(error)}
  </div>
);

export function Empty({ title, children, action }) {
  return (
    <div className="rounded-[10px] border-2 border-dashed border-line bg-white px-4 py-12 text-center text-muted">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
