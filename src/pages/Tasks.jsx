import { useState } from 'react';
import { useLoad } from '../hooks/useLoad.js';
import { listTasks } from '../services/taskService.js';
import { CATEGORIES } from '../domain/constants.js';
import TaskCard from '../components/TaskCard.jsx';
import { Loading, ErrorBox, Empty } from '../components/Feedback.jsx';

const EMPTY = { search: '', category: '', minReward: '', maxReward: '', sort: 'newest' };

export default function Tasks() {
  const [filters, setFilters] = useState(EMPTY);
  const { data, loading, error } = useLoad(() => listTasks(filters), [JSON.stringify(filters)]);
  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  return (
    <div className="site-container page">
      <div className="page-head"><h1 style={{ fontSize: '2rem' }}>Browse tasks</h1></div>

      <div className="filters" role="search">
        <div className="field"><label htmlFor="q">Search</label><input id="q" className="input" value={filters.search} onChange={set('search')} placeholder="Python, logo, SQL..." /></div>
        <div className="field"><label htmlFor="cat">Category</label>
          <select id="cat" className="input" value={filters.category} onChange={set('category')}>
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="min">Min tokens</label><input id="min" type="number" min="0" className="input" value={filters.minReward} onChange={set('minReward')} /></div>
        <div className="field"><label htmlFor="max">Max tokens</label><input id="max" type="number" min="0" className="input" value={filters.maxReward} onChange={set('maxReward')} /></div>
        <div className="field"><label htmlFor="sort">Sort by</label>
          <select id="sort" className="input" value={filters.sort} onChange={set('sort')}>
            <option value="newest">Newest first</option>
            <option value="rewardHigh">Highest reward</option>
            <option value="rewardLow">Lowest reward</option>
            <option value="deadline">Deadline soonest</option>
          </select>
        </div>
        <button className="btn btn-ghost" onClick={() => setFilters(EMPTY)}>Clear filters</button>
      </div>

      {loading && !data && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && (data.length ? (
        <>
          <p className="muted">{data.length} open task{data.length > 1 ? 's' : ''}</p>
          <div className="grid cols-3">{data.map((t) => <TaskCard key={t.id} task={t} />)}</div>
        </>
      ) : (
        <Empty title="No tasks match your filters">Try a different search or clear the filters.</Empty>
      ))}
    </div>
  );
}
