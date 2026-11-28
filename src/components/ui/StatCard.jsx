// A big number with a label, used on the admin overview.
export default function StatCard({ label, value }) {
  return (
    <div className="rounded-[10px] border border-[#dde2ea] bg-white p-5">
      <div className="font-['Bricolage_Grotesque'] text-4xl font-extrabold leading-none text-[#19233b]">{value}</div>
      <div className="mt-1.5 text-sm text-[#5b667a]">{label}</div>
    </div>
  );
}