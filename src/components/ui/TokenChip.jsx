// The gold coin + amount.
export default function TokenChip({ amount }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#fff1cc] py-0.5 pl-1 pr-3 text-sm font-bold text-[#6b4a00]">
      <span className="h-4 w-4 rounded-full bg-[#e8a500] ring-[3px] ring-inset ring-white/40" />
      {amount} {amount === 1 ? 'token' : 'tokens'}
    </span>
  );
}