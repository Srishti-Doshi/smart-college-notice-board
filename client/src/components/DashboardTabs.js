import React from 'react';

function DashboardTabs({ mode, setMode, feedView, setFeedView, canAccessAdmin }) {
  return (
    <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
      <div className="inline-flex rounded-[22px] bg-white/90 border border-slate-200 p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
        {['student', ...(canAccessAdmin ? ['admin'] : [])].map((tabMode) => (
          <button
            key={tabMode}
            type="button"
            className={`rounded-[18px] px-4 py-2.5 text-sm font-semibold transition ${
              mode === tabMode
                ? 'bg-slate-950 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setMode(tabMode)}
          >
            {tabMode === 'student' ? 'Student View' : 'Admin View'}
          </button>
        ))}
      </div>

      <div className="inline-flex rounded-[22px] bg-white/90 border border-slate-200 p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
        {['active', 'archive'].map((view) => (
          <button
            key={view}
            type="button"
            className={`rounded-[18px] px-4 py-2.5 text-sm font-semibold transition ${
              feedView === view
                ? 'bg-amber-500 text-slate-950 shadow-[0_10px_24px_rgba(245,158,11,0.22)]'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            onClick={() => setFeedView(view)}
          >
            {view === 'active' ? 'Active Notices' : 'Archive'}
          </button>
        ))}
      </div>
    </section>
  );
}

export default DashboardTabs;
