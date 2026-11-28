import { errorMessage } from '../../utils/messages.js';

export const LoadingState = () => (
  <div role="status" className="p-12 text-center text-[#5b667a]">Loading...</div>
);

export const ErrorState = ({ error }) => (
  <div role="alert" className="mb-4 rounded-lg bg-[#fbe4de] px-4 py-3 text-[0.95rem] text-[#7e2412]">{errorMessage(error)}</div>
);

export function EmptyState({ title, children }) {
  return (
    <div className="rounded-[10px] border-2 border-dashed border-[#dde2ea] bg-white px-4 py-12 text-center text-[#5b667a]">
      <h3 className="mb-1 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}