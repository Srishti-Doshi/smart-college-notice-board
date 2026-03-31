import React from 'react';

const CATEGORY_OPTIONS = ['Academic', 'Placement', 'Events', 'General'];

const formatLastAlert = (lastAlertAt) => {
  if (!lastAlertAt) {
    return 'No alerts sent yet';
  }

  return `Last alert ${new Date(lastAlertAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })}`;
};

function CategorySubscriptionsV2({
  subscribedCategories,
  notificationStatus,
  watchingCount,
  notificationsEnabled,
  onToggleCategory,
  onEnableNotifications,
  onDisableNotifications,
  lastAlertAt,
  alertsThisWeekCount,
}) {
  const statusStyles =
    notificationStatus === 'live'
      ? 'bg-emerald-400/20 text-emerald-200 border-emerald-300/50'
      : notificationStatus === 'blocked'
        ? 'bg-red-400/20 text-red-200 border-red-300/50'
        : 'bg-slate-400/20 text-slate-200 border-slate-300/50';

  const statusText =
    notificationStatus === 'live'
      ? 'Live'
      : notificationStatus === 'paused'
        ? 'Disabled'
      : notificationStatus === 'blocked'
        ? 'Blocked'
        : 'Unsupported';

  const canEnable = subscribedCategories.length > 0;

  return (
    <section className="rounded-[30px] bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.2)] p-6 mb-8 overflow-hidden relative">
      <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle,_rgba(245,158,11,0.25),_transparent_66%)]" />
      <div className="relative grid gap-4 lg:grid-cols-[1.5fr_1fr] mb-5">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
            Push Alerts
          </p>
          <h3 className="text-3xl font-black text-white mt-2">Notification Preferences</h3>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Choose exactly which important updates should interrupt you.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${statusStyles}`}
            >
              {statusText}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white border border-white/15 transition hover:bg-white/16 disabled:opacity-50"
                onClick={onEnableNotifications}
                disabled={!canEnable}
              >
                {notificationsEnabled ? 'Enabled' : 'Enable'}
              </button>
              <button
                type="button"
                className="rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 border border-white/15 transition hover:bg-white/12 disabled:opacity-50"
                onClick={onDisableNotifications}
                disabled={!notificationsEnabled}
              >
                Disable
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold text-white">
            Watching {watchingCount} categories
          </p>
          <p className="mt-1 text-xs text-slate-300">
            {subscribedCategories.length > 0
              ? 'Select categories below to control what you receive.'
              : 'Choose at least one category to enable notifications.'}
          </p>
          <p className="mt-1 text-xs text-slate-300">{formatLastAlert(lastAlertAt)}</p>
          <p className="mt-1 text-xs text-slate-300">{alertsThisWeekCount} alerts this week</p>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-3">
        {CATEGORY_OPTIONS.map((category) => {
          const isActive = subscribedCategories.includes(category);

          return (
            <button
              key={category}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/10'
              }`}
              onClick={() => onToggleCategory(category)}
            >
              {isActive ? `Subscribed: ${category}` : `Subscribe: ${category}`}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CategorySubscriptionsV2;
