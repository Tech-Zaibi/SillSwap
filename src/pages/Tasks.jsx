import { useState } from 'react';
import { useLoad } from '../hooks/useLoad.js';
import { listTasks } from '../services/taskService.js';
import { CATEGORIES } from '../domain/constants.js';
import TaskCard from '../components/TaskCard.jsx';
import Btn from '../components/ui/Btn.jsx';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/StateMessage.jsx';

const EMPTY = { search: '', category: '', minReward: '', maxReward: '', sort: 'newest' };
const inputClass = 'w-full rounded-xl border border-[#dce5e7] bg-[#fbfcfc] px-3.5 py-2.5 text-sm text-[#25324a] outline-none transition placeholder:text-[#98a2b3] focus:border-[#0e8a7d] focus:ring-4 focus:ring-[#0e8a7d]/10';

export default function Tasks() {
  const [filters, setFilters] = useState(EMPTY);
  const { data, loading, error } = useLoad(() => listTasks(filters), [JSON.stringify(filters)]);
  const set = (key) => (event) => setFilters({ ...filters, [key]: event.target.value });

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Find your next opportunity</p>
          <h1 className="mb-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold tracking-tight text-[#19233b] sm:text-4xl">Browse tasks</h1>
          <p className="mb-0 max-w-2xl text-sm text-[#667085] sm:text-base">Discover projects where your skills can make a difference.</p>
        </div>
      </div>

      <section className="mb-7 rounded-2xl border border-[#e1e8e9] bg-white p-5 shadow-[0_8px_30px_rgba(25,35,59,0.04)] sm:p-6">
        <div className="mb-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[#0e8a7d]">Search & refine</p>
          <h2 className="mb-0 font-['Bricolage_Grotesque'] text-lg font-bold text-[#19233b]">Find the right fit</h2>
        </div>
        <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_minmax(170px,1.3fr)_minmax(120px,0.8fr)_minmax(120px,0.8fr)_minmax(170px,1.2fr)_auto]" role="search" aria-label="Filter open tasks">
          <div>
            <label htmlFor="q" className="mb-1.5 block text-sm font-semibold text-[#344054]">Search</label>
            <input id="q" className={inputClass} value={filters.search} onChange={set('search')} placeholder="Python, logo, SQL..." />
          </div>
          <div>
            <label htmlFor="cat" className="mb-1.5 block text-sm font-semibold text-[#344054]">Category</label>
            <select id="cat" className={inputClass} value={filters.category} onChange={set('category')}>
              <option value="">All categories</option>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="min" className="mb-1.5 block text-sm font-semibold text-[#344054]">Min tokens</label>
            <input id="min" type="number" min="0" className={inputClass} value={filters.minReward} onChange={set('minReward')} />
          </div>
          <div>
            <label htmlFor="max" className="mb-1.5 block text-sm font-semibold text-[#344054]">Max tokens</label>
            <input id="max" type="number" min="0" className={inputClass} value={filters.maxReward} onChange={set('maxReward')} />
          </div>
          <div>
            <label htmlFor="sort" className="mb-1.5 block text-sm font-semibold text-[#344054]">Sort by</label>
            <select id="sort" className={inputClass} value={filters.sort} onChange={set('sort')}>
              <option value="newest">Newest first</option>
              <option value="rewardHigh">Highest reward</option>
              <option value="rewardLow">Lowest reward</option>
              <option value="deadline">Deadline soonest</option>
            </select>
          </div>
          <Btn variant="ghost" className="h-[42px] rounded-xl px-4" onClick={() => setFilters(EMPTY)}>Clear filters</Btn>
        </div>
      </section>

      {loading && !data && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (data.length ? (
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="mb-0 text-sm text-[#667085]">
              Showing <span className="font-bold text-[#25324a]">{data.length}</span> open task{data.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        </section>
      ) : (
        <EmptyState title="No tasks match your filters">
          Try a different search, or{' '}
          <button type="button" className="cursor-pointer font-semibold text-[#0a6b61] underline underline-offset-2" onClick={() => setFilters(EMPTY)}>
            clear the filters
          </button>.
        </EmptyState>
      ))}
    </div>
  );
}
