// A white card that holds a table and scrolls sideways on small screens.
// Use: <TableCard><thead>...</thead><tbody>...</tbody></TableCard>
export function TableCard({ children }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#dde2ea] bg-white">
      <table className="w-full border-collapse text-[0.92rem]">{children}</table>
    </div>
  );
}

export const Th = ({ children, className = '' }) => (
  <th className={`border-b border-[#dde2ea] bg-[#fafbfd] px-4 py-3 text-left font-semibold text-[#5b667a] ${className}`}>{children}</th>
);

export const Td = ({ children, className = '' }) => (
  <td className={`border-b border-[#dde2ea] px-4 py-3 align-top ${className}`}>{children}</td>
);