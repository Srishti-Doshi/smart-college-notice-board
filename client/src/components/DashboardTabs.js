import React from 'react';

function DashboardTabs({ mode, setMode, feedView, setFeedView, canAccessAdmin }) {
  return (
    <section
      className={`flex flex-col lg:flex-row lg:items-center gap-4 mb-6 ${
        canAccessAdmin ? 'lg:justify-start' : 'hidden'
      }`}
    >
      {canAccessAdmin && (
        <div className="inline-flex rounded-[22px] bg-white/90 border border-slate-200 p-1.5 shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
          {['student', 'admin'].map((tabMode) => (
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
              {tabMode === 'student' ? 'Browse' : 'Manage'}
            </button>
          ))}
        </div>
      )}

    </section>
  );
}

export default DashboardTabs;
