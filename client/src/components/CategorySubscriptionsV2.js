import React, { useMemo, useState } from 'react';

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

const actionLabelByStatus = {
  live: 'Pause Alerts',
  paused: 'Turn On Alerts',
  blocked: 'Turn On Alerts',
  unsupported: 'Unavailable',
};

function CategorySubscriptionsV2({
  categories,
  subscribedCategories,
  notificationStatus,
  watchingCount,
  notificationsEnabled,
  onToggleCategory,
  onEnableNotifications,
  onDisableNotifications,
  lastAlertAt,
  lastAlertNotice,
  alertsThisWeekCount,
  onCategoryChipClick,
  onOpenLastAlert,
  onSendTestAlert,
}) {
  const [showHelp, setShowHelp] = useState(false);
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
        ? 'Permission blocked'
        : 'Unsupported';

  const statusHelperText =
    notificationStatus === 'live'
      ? 'Alerts are active for the categories you selected.'
      : notificationStatus === 'blocked'
        ? 'This device or browser has notifications turned off for this site. On phones, open the site in your browser settings and allow notifications.'
        : notificationStatus === 'unsupported'
          ? 'This browser does not support web notifications on this device.'
          : subscribedCategories.length > 0
            ? 'Select categories below and enable notifications when you are ready.'
            : 'Choose at least one category to enable notifications.';

  const primaryActionLabel = actionLabelByStatus[notificationStatus];
  const primaryActionDisabled =
    notificationStatus === 'unsupported' ||
    (notificationStatus !== 'live' && subscribedCategories.length === 0);

  const liveSummaryText = useMemo(() => {
    if (subscribedCategories.length === 0) {
      return 'Choose at least one category to start getting alerts.';
    }

    if (notificationStatus === 'live') {
      return `Alerts are active for ${subscribedCategories.join(', ')}.`;
    }

    if (notificationStatus === 'blocked') {
      return 'Notifications are blocked on this device. Open browser settings to allow them.';
    }

    return `You are subscribed to ${subscribedCategories.join(', ')}.`;
  }, [notificationStatus, subscribedCategories]);

  const lastAlertText = lastAlertNotice?.title
    ? `Last alert: ${lastAlertNotice.title}, ${formatLastAlert(lastAlertAt).replace('Last alert ', '')}`
    : formatLastAlert(lastAlertAt);

  const weeklyAlertText =
    alertsThisWeekCount === 1
      ? 'You received 1 alert this week.'
      : `You received ${alertsThisWeekCount} alerts this week.`;

  const handlePrimaryAction = () => {
    if (notificationStatus === 'live') {
      onDisableNotifications();
      return;
    }

    onEnableNotifications();
  };

  return (
    <section className="rounded-[30px] bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.2)] p-5 md:p-6 mb-8 overflow-hidden relative">
      <div className="absolute inset-y-0 right-0 w-48 bg-[radial-gradient(circle,_rgba(245,158,11,0.25),_transparent_66%)]" />
      <div className="relative grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="relative min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
            Push Alerts
          </p>
          <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">Notification Preferences</h3>
          <p className="mt-2 max-w-xl text-sm text-slate-300">
            Choose exactly which important updates should interrupt you.
          </p>

          <div className="mt-5 md:mt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              Choose Categories
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Pick the notice types you want to hear about first.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((category) => {
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
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
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
                onClick={handlePrimaryAction}
                disabled={primaryActionDisabled}
              >
                {primaryActionLabel}
              </button>
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold text-white">
            You&apos;ll get alerts for {watchingCount} {watchingCount === 1 ? 'category' : 'categories'}
          </p>
          <p className="mt-1 text-xs text-slate-300">{liveSummaryText}</p>
          <p className="mt-1 text-xs text-slate-300">{statusHelperText}</p>

          {subscribedCategories.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {subscribedCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="rounded-full border border-amber-300/35 bg-amber-300/12 px-3 py-1 text-xs font-semibold text-amber-100 transition hover:bg-amber-300/20"
                  onClick={() => onCategoryChipClick(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-300">
              No categories selected yet. Pick one below to start receiving relevant alerts.
            </p>
          )}

          <button
            type="button"
            className="mt-3 text-left text-xs font-semibold text-blue-200 underline underline-offset-4"
            onClick={() => setShowHelp((currentValue) => !currentValue)}
          >
            Why am I not getting alerts?
          </button>

          {showHelp && (
            <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-xs text-slate-300">
              Notifications can stay silent if browser permission is blocked, no categories are selected, or alerts are currently paused.
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Notification Health
            </p>
            <button
              type="button"
              className="mt-2 text-left text-sm font-semibold text-white underline-offset-4 hover:underline disabled:no-underline disabled:opacity-70"
              onClick={onOpenLastAlert}
              disabled={!lastAlertNotice?.category}
            >
              {lastAlertText}
            </button>
            <p className="mt-1 text-xs text-slate-300">{weeklyAlertText}</p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 border border-white/15 transition hover:bg-white/12 disabled:opacity-50"
              onClick={onSendTestAlert}
              disabled={notificationStatus === 'unsupported'}
            >
              Send Test Alert
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategorySubscriptionsV2;
