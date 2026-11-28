// Row of tabs. tabs = ['Overview', 'Users', ...], active = the selected one.
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div role="tablist" className="mb-0 flex gap-1 overflow-x-auto border-b border-[#dde2ea]">
      {tabs.map((t, index) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={active === t}
          onClick={() => onChange(t)}
          style={{ animationDelay: `${index * 80}ms` }}
          className={`admin-tab-enter cursor-pointer whitespace-nowrap rounded-t-lg border-b-[3px] px-4 py-2.5 font-semibold transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#f1f8f6] hover:text-[#0a6b61] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e8a7d] ${
            active === t
              ? 'border-[#0e8a7d] bg-[#f7fbfa] text-[#19233b]'
              : 'border-transparent text-[#5b667a]'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}