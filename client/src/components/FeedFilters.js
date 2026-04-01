import React from 'react';

const URGENCY_OPTIONS = ['All', 'Low', 'Medium', 'High', 'Urgent'];

function FeedFilters({
  filters,
  categories,
  departments,
  feedView,
  onFeedViewChange,
  onFilterChange,
  onResetFilters,
}) {
  return (
    <section className="rounded-[30px] bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.08)] border border-white/70 p-6 mb-8 backdrop-blur">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
            Student Feed
          </p>
          <h3 className="text-3xl font-black text-slate-900 mt-2">Search and Filter Notices</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-[18px] bg-white border border-slate-200 p-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
            {['active', 'archive'].map((view) => (
              <button
                key={view}
                type="button"
                className={`rounded-[14px] px-3.5 py-2 text-sm font-semibold transition ${
                  feedView === view
                    ? 'bg-amber-500 text-slate-950 shadow-[0_8px_18px_rgba(245,158,11,0.2)]'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => onFeedViewChange(view)}
              >
                {view === 'active' ? 'Latest Notices' : 'Past Notices'}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
            onClick={onResetFilters}
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Keyword Search</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="search"
            placeholder="Search title or description"
            value={filters.search}
            onChange={onFilterChange}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Category</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="category"
            value={filters.category}
            onChange={onFilterChange}
          >
            {['All', ...categories].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Urgency</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="urgency"
            value={filters.urgency}
            onChange={onFilterChange}
          >
            {URGENCY_OPTIONS.map((urgency) => (
              <option key={urgency} value={urgency}>
                {urgency}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Department</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="department"
            value={filters.department}
            onChange={onFilterChange}
          >
            <option value="All">All</option>
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-700">Notice Date</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            type="date"
            name="noticeDate"
            value={filters.noticeDate}
            onChange={onFilterChange}
          />
        </label>
      </div>
    </section>
  );
}

export default FeedFilters;
