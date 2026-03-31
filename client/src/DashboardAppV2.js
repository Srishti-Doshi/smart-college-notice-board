import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import AdminNoticeForm from './components/AdminNoticeForm';
import CategorySubscriptionsV2 from './components/CategorySubscriptionsV2';
import DashboardTabs from './components/DashboardTabs';
import FeedFilters from './components/FeedFilters';
import NoticeCard from './components/NoticeCard';
import NoticeDetailsModal from './components/NoticeDetailsModal';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');
const SUBSCRIPTION_STORAGE_KEY = 'smart-notice-subscribed-categories';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

axios.defaults.withCredentials = true;

const defaultFilters = {
  search: '',
  category: 'All',
  urgency: 'All',
  department: 'All',
  noticeDate: '',
};

const sortNotices = (notices) =>
  [...notices].sort((firstNotice, secondNotice) => {
    if (firstNotice.isPinned !== secondNotice.isPinned) {
      return Number(secondNotice.isPinned) - Number(firstNotice.isPinned);
    }

    if (firstNotice.isPinned && secondNotice.isPinned) {
      return (firstNotice.pinnedRank || 99) - (secondNotice.pinnedRank || 99);
    }

    return new Date(secondNotice.createdAt) - new Date(firstNotice.createdAt);
  });

const buildParams = (filters) => ({
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.category !== 'All' ? { category: filters.category } : {}),
  ...(filters.urgency !== 'All' ? { urgency: filters.urgency } : {}),
  ...(filters.department !== 'All' ? { department: filters.department } : {}),
  ...(filters.noticeDate
    ? { date: filters.noticeDate, tzOffset: String(new Date().getTimezoneOffset()) }
    : {}),
});

const statCards = (notices, pinnedNotices, subscribedCategories) => [
  {
    key: 'visible',
    label: 'Visible Notices',
    value: notices.length,
    accent: 'from-blue-600 to-blue-800',
    helper: 'Open full feed',
  },
  {
    key: 'pinned',
    label: 'Pinned Right Now',
    value: pinnedNotices.length,
    accent: 'from-amber-500 to-orange-600',
    helper: 'Jump to priority deck',
  },
  {
    key: 'subscriptions',
    label: 'Subscribed Topics',
    value: subscribedCategories.length,
    accent: 'from-emerald-500 to-teal-700',
    helper: 'Manage alerts',
  },
];

function DashboardAppV2() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isNoticeFormOpen, setIsNoticeFormOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [mode, setMode] = useState('student');
  const [feedView, setFeedView] = useState('active');
  const [filters, setFilters] = useState(defaultFilters);
  const [submitMessage, setSubmitMessage] = useState('');
  const [highlightPinned, setHighlightPinned] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastAlertAt, setLastAlertAt] = useState(null);
  const [alertsThisWeek, setAlertsThisWeek] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const [subscribedCategories, setSubscribedCategories] = useState(() => {
    const storedValue = window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  });

  const latestNoticeIdsRef = useRef([]);
  const initializedNotificationsRef = useRef(false);
  const subscriptionsRef = useRef(null);
  const pinnedSectionRef = useRef(null);
  const feedSectionRef = useRef(null);
  const pinnedHighlightTimerRef = useRef(null);
  const canManageNotices = currentUser?.role === 'admin' || currentUser?.role === 'hod';

  const recentAlertsCount = useMemo(
    () => alertsThisWeek.filter((timestamp) => Date.now() - timestamp < ONE_WEEK_MS).length,
    [alertsThisWeek]
  );

  const notificationStatus = useMemo(() => {
    if (notificationPermission === 'unsupported') {
      return 'unsupported';
    }
    if (notificationPermission === 'denied') {
      return 'blocked';
    }
    if (
      notificationPermission === 'granted' &&
      notificationsEnabled &&
      subscribedCategories.length > 0
    ) {
      return 'live';
    }
    if (notificationPermission === 'unsupported') {
      return 'unsupported';
    }
    return 'paused';
  }, [notificationPermission, notificationsEnabled, subscribedCategories.length]);

  useEffect(() => {
    const loadSessionUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`);
        setCurrentUser(response.data.user);
      } catch (_error) {
        setCurrentUser(null);
      }
    };

    loadSessionUser();
  }, []);

  useEffect(
    () => () => {
      if (pinnedHighlightTimerRef.current) {
        window.clearTimeout(pinnedHighlightTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!submitMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmitMessage('');
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [submitMessage]);

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = feedView === 'archive' ? '/api/notices/archive' : '/api/notices';
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        params: buildParams(filters),
      });
      setNotices(sortNotices(response.data));
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  }, [feedView, filters]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  useEffect(() => {
    if (!canManageNotices && mode === 'admin') {
      setMode('student');
    }
  }, [canManageNotices, mode]);

  useEffect(() => {
    if (mode !== 'admin') {
      setIsNoticeFormOpen(false);
      setEditingNotice(null);
    }
  }, [mode]);

  useEffect(() => {
    window.localStorage.setItem(
      SUBSCRIPTION_STORAGE_KEY,
      JSON.stringify(subscribedCategories)
    );
  }, [subscribedCategories]);

  useEffect(() => {
    if (subscribedCategories.length === 0 && notificationsEnabled) {
      setNotificationsEnabled(false);
    }
  }, [notificationsEnabled, subscribedCategories]);

  useEffect(() => {
    setAlertsThisWeek((currentAlerts) =>
      currentAlerts.filter((timestamp) => Date.now() - timestamp < ONE_WEEK_MS)
    );
  }, [notices.length]);

  const recordAlertSent = () => {
    setLastAlertAt(new Date().toISOString());
    setAlertsThisWeek((currentAlerts) => [Date.now(), ...currentAlerts]);
  };

  useEffect(() => {
    const pollActiveNotices = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notices`);
        const activeNotices = sortNotices(response.data);
        const activeIds = activeNotices.map((notice) => notice._id);

        if (!initializedNotificationsRef.current) {
          latestNoticeIdsRef.current = activeIds;
          initializedNotificationsRef.current = true;
          return;
        }

        const newNotices = activeNotices.filter(
          (notice) => !latestNoticeIdsRef.current.includes(notice._id)
        );

        if (
          notificationPermission === 'granted' &&
          notificationsEnabled &&
          subscribedCategories.length > 0 &&
          newNotices.length > 0
        ) {
          const relevantNotices = newNotices.filter((notice) =>
            subscribedCategories.includes(notice.category)
          );

          relevantNotices.forEach((notice) => {
            new Notification(`New ${notice.category} notice`, {
              body: `${notice.title} (${notice.urgency || 'Medium'})`,
            });
            recordAlertSent();
          });
        }

        latestNoticeIdsRef.current = activeIds;
      } catch (error) {
        console.error('Polling notices failed:', error);
      }
    };

    pollActiveNotices();
    const intervalId = window.setInterval(pollActiveNotices, 30000);

    return () => window.clearInterval(intervalId);
  }, [notificationPermission, notificationsEnabled, subscribedCategories]);

  const pinnedNotices = useMemo(
    () =>
      notices
        .filter((notice) => notice.isPinned)
        .sort(
          (firstNotice, secondNotice) =>
            (firstNotice.pinnedRank || 99) - (secondNotice.pinnedRank || 99)
        )
        .slice(0, 3),
    [notices]
  );

  const regularNotices = useMemo(() => notices.filter((notice) => !notice.isPinned), [notices]);

  const departments = useMemo(
    () => [...new Set(notices.map((notice) => notice.department).filter(Boolean))].sort(),
    [notices]
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, value]) => value && value !== 'All')
        .map(([key, value]) => ({ key, value })),
    [filters]
  );

  const dashboardStats = useMemo(
    () => statCards(notices, pinnedNotices, subscribedCategories),
    [notices, pinnedNotices, subscribedCategories]
  );

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  const handleCreateNotice = async (payload) => {
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const formFieldName = key === 'attachmentFile' ? 'attachment' : key;
          formData.append(formFieldName, value);
        }
      });

      const response = await axios.post(`${API_BASE_URL}/api/notices`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (feedView === 'active') {
        setNotices((currentNotices) => sortNotices([response.data, ...currentNotices]));
      }
      setIsNoticeFormOpen(false);
      setEditingNotice(null);
      setSubmitMessage('Notice created successfully. Check the feed below.');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Could not create notice. Please try again.',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNotice = async (payload) => {
    if (!editingNotice) {
      return { success: false, message: 'No notice selected for editing.' };
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const formFieldName = key === 'attachmentFile' ? 'attachment' : key;
          formData.append(formFieldName, value);
        }
      });

      const response = await axios.put(
        `${API_BASE_URL}/api/notices/${editingNotice._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setNotices((currentNotices) =>
        sortNotices(
          currentNotices.map((notice) =>
            notice._id === editingNotice._id ? response.data : notice
          )
        )
      );
      setIsNoticeFormOpen(false);
      setEditingNotice(null);
      setSubmitMessage('Notice updated successfully.');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Could not update notice.',
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    const confirmed = window.confirm('Delete this notice permanently?');
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/notices/${noticeId}`);
      setNotices((currentNotices) =>
        currentNotices.filter((notice) => notice._id !== noticeId)
      );
      setSubmitMessage('Notice deleted successfully.');
    } catch (error) {
      setSubmitMessage(error.response?.data?.error || 'Could not delete notice.');
    }
  };

  const handleArchiveNotice = async (notice) => {
    try {
      await axios.put(`${API_BASE_URL}/api/notices/${notice._id}`, {
        isArchived: !notice.isArchived,
      });
      setNotices((currentNotices) =>
        currentNotices.filter((currentNotice) => currentNotice._id !== notice._id)
      );
      setSubmitMessage(
        notice.isArchived ? 'Notice moved back to active feed.' : 'Notice archived successfully.'
      );
    } catch (error) {
      setSubmitMessage(error.response?.data?.error || 'Could not update archive status.');
    }
  };

  const handleToggleCategory = (category) => {
    setSubscribedCategories((currentCategories) =>
      currentCategories.includes(category)
        ? currentCategories.filter((currentCategory) => currentCategory !== category)
        : [...currentCategories, category]
    );
  };

  const handleEnableNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setSubmitMessage('This browser does not support notifications.');
      return;
    }

    if (subscribedCategories.length === 0) {
      setSubmitMessage('Select at least one category before enabling notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setNotificationsEnabled(true);
      setSubmitMessage('Notifications enabled.');
    } else {
      setSubmitMessage('Notification permission was not granted.');
    }
  };

  const handleDisableNotifications = () => {
    setNotificationsEnabled(false);
    setSubmitMessage('Notifications disabled.');
  };

  const handleOpenCreateNotice = () => {
    setEditingNotice(null);
    setIsNoticeFormOpen(true);
  };

  const handleOpenEditNotice = (notice) => {
    setEditingNotice(notice);
    setIsNoticeFormOpen(true);
  };

  const scrollToRef = (sectionRef) => {
    window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  };

  const handleStatCardClick = (cardKey) => {
    if (cardKey === 'visible') {
      setMode('student');
      setFeedView('active');
      setFilters(defaultFilters);
      scrollToRef(feedSectionRef);
      return;
    }

    if (cardKey === 'pinned') {
      setMode('student');
      setFeedView('active');

      if (pinnedNotices.length === 0) {
        setSubmitMessage('No pinned notices right now. Showing latest notices instead.');
        scrollToRef(feedSectionRef);
        return;
      }

      scrollToRef(pinnedSectionRef);
      setHighlightPinned(true);
      if (pinnedHighlightTimerRef.current) {
        window.clearTimeout(pinnedHighlightTimerRef.current);
      }
      pinnedHighlightTimerRef.current = window.setTimeout(() => {
        setHighlightPinned(false);
      }, 2200);
      return;
    }

    setMode('student');
    setFeedView('active');
    scrollToRef(subscriptionsRef);
  };

  const handleLogin = async ({ email, password }) => {
    setAuthSubmitting(true);
    setAuthError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      setCurrentUser(response.data.user);
      setShowLogin(false);
      setAuthError('');
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Could not login. Please try again.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`);
    } catch (_error) {
      // Ignore logout network edge cases.
    } finally {
      setCurrentUser(null);
      setMode('student');
      setEditingNotice(null);
      setSelectedNotice(null);
      setSubmitMessage('');
      setAuthError('');
      setShowLogin(false);
    }
  };

  const emptyMessage =
    feedView === 'archive'
      ? 'No past notices match the current filters.'
      : 'No latest notices match the current filters.';
  const isErrorToast =
    submitMessage.toLowerCase().includes('could not') ||
    submitMessage.toLowerCase().includes('not granted') ||
    submitMessage.toLowerCase().includes('failed');

  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--canvas)] text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,_rgba(10,84,158,0.24),_transparent_62%)]" />
      <div className="pointer-events-none absolute right-[-5rem] top-24 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />

      <nav className="relative border-b border-white/40 bg-slate-950 text-white shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
        <div className="max-w-6xl mx-auto px-6 py-5 md:px-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.35em] text-blue-200/90">
              Smart College Notice Board
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">SmartNotice</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              A focused campus announcement hub with urgent priorities, searchable history, and
              category-based alerting.
            </p>
          </div>
          <div className="glass-panel rounded-3xl px-4 py-3 text-sm text-slate-100">
            {currentUser ? (
              <>
                <p className="font-semibold text-white">
                  {currentUser.name} ({currentUser.role.toUpperCase()})
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <p className="text-slate-300">{currentUser.email}</p>
                  <button
                    type="button"
                    className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                className="rounded-lg border border-white/25 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                onClick={() => {
                  setShowLogin(true);
                  setAuthError('');
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="relative max-w-6xl mx-auto px-6 py-8 md:px-8">
        <section className="grid gap-4 md:grid-cols-3 mb-8">
          {dashboardStats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => handleStatCardClick(stat.key)}
              className={`rounded-[28px] bg-gradient-to-br ${stat.accent} p-[1px] shadow-[0_18px_45px_rgba(15,23,42,0.16)]`}
            >
              <div className="h-full rounded-[27px] bg-slate-950/18 px-5 py-5 backdrop-blur-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
                  {stat.label}
                </p>
                <p className="mt-3 text-4xl font-black tracking-tight text-white">{stat.value}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  {stat.helper}
                </p>
              </div>
            </button>
          ))}
        </section>

        <DashboardTabs
          mode={mode}
          setMode={setMode}
          feedView={feedView}
          setFeedView={setFeedView}
          canAccessAdmin={canManageNotices}
        />

        {mode === 'student' && feedView === 'active' && (
          <div ref={subscriptionsRef}>
            <CategorySubscriptionsV2
              subscribedCategories={subscribedCategories}
              notificationStatus={notificationStatus}
              watchingCount={subscribedCategories.length}
              notificationsEnabled={notificationsEnabled}
              onToggleCategory={handleToggleCategory}
              onEnableNotifications={handleEnableNotifications}
              onDisableNotifications={handleDisableNotifications}
              lastAlertAt={lastAlertAt}
              alertsThisWeekCount={recentAlertsCount}
            />
          </div>
        )}

        <FeedFilters
          filters={filters}
          departments={departments}
          feedView={feedView}
          onFeedViewChange={setFeedView}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {activeFilters.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {activeFilters.map((filter) => (
              <span
                key={filter.key}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm"
              >
                {filter.key}: {filter.value}
              </span>
            ))}
          </div>
        )}

        {canManageNotices && mode === 'admin' && (
          <section className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Admin Actions
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Create new campus updates or edit existing notices from the feed.
              </p>
            </div>
            <button
              type="button"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={handleOpenCreateNotice}
            >
              Create Notice
            </button>
          </section>
        )}

        {loading ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="rounded-[28px] border border-slate-200 bg-white/85 p-6 shadow-sm"
              >
                <div className="h-4 w-24 rounded-full bg-slate-200 animate-pulse" />
                <div className="mt-6 h-7 w-3/4 rounded-full bg-slate-200 animate-pulse" />
                <div className="mt-4 space-y-3">
                  <div className="h-3 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-3 rounded-full bg-slate-200 animate-pulse" />
                  <div className="h-3 w-4/5 rounded-full bg-slate-200 animate-pulse" />
                </div>
              </div>
            ))}
          </section>
        ) : (
          <>
            {mode === 'student' && feedView === 'active' && pinnedNotices.length > 0 && (
              <section
                ref={pinnedSectionRef}
                className={`mb-10 rounded-[30px] transition ${
                  highlightPinned ? 'bg-amber-50/70 p-4 ring-2 ring-amber-300' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
                      Priority Deck
                    </p>
                    <h3 className="mt-2 text-3xl font-black text-slate-900">Pinned Notices</h3>
                  </div>
                  <p className="text-sm text-slate-500">
                    The top three admin-prioritized updates stay visible here.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotices.map((notice) => (
                    <NoticeCard key={notice._id} notice={notice} onOpenNotice={setSelectedNotice} />
                  ))}
                </div>
              </section>
            )}

            <section ref={feedSectionRef}>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
                    {feedView === 'archive' ? 'Past Updates' : 'Latest Updates'}
                  </p>
                  <h3 className="mt-2 text-3xl font-black text-slate-900">
                    {feedView === 'archive' ? 'Past Notices' : 'Latest Notices'}
                  </h3>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                  {notices.length} notices visible
                </div>
              </div>

              {notices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(mode === 'admin' && canManageNotices
                    ? notices
                    : feedView === 'archive'
                      ? notices
                      : regularNotices
                  ).map((notice) => (
                    <NoticeCard
                      key={notice._id}
                      notice={notice}
                      showArchiveBadge={feedView === 'archive'}
                      onOpenNotice={setSelectedNotice}
                      actions={
                        mode === 'admin' && canManageNotices
                          ? [
                              {
                                label: 'Edit',
                                variant: 'primary',
                                onClick: () => handleOpenEditNotice(notice),
                              },
                              {
                                label: feedView === 'archive' ? 'Restore' : 'Archive',
                                variant: 'secondary',
                                onClick: () => handleArchiveNotice(notice),
                              },
                              {
                                label: 'Delete',
                                variant: 'danger',
                                onClick: () => handleDeleteNotice(notice._id),
                              },
                            ]
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Empty State
                  </p>
                  <h4 className="mt-3 text-2xl font-black text-slate-900">{emptyMessage}</h4>
                  <p className="mt-3 max-w-xl mx-auto text-sm text-slate-500">
                    Try resetting the filters, switching feeds, or creating a new notice from the
                    admin panel.
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <NoticeDetailsModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />

      {submitMessage && (
        <div className="fixed right-6 top-6 z-50">
          <div
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg backdrop-blur ${
              isErrorToast
                ? 'border-red-200 bg-red-50/95 text-red-700'
                : 'border-emerald-200 bg-emerald-50/95 text-emerald-700'
            }`}
          >
            {submitMessage}
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-6">
          <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
              Smart College Notice Board
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Sign In</h2>
            <p className="mt-2 text-sm text-slate-500">Login as Admin or HOD to manage notices.</p>

            <form
              className="mt-7 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                handleLogin({
                  email: String(formData.get('email') || ''),
                  password: String(formData.get('password') || ''),
                });
              }}
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="email"
                  name="email"
                  placeholder="admin@college.edu"
                  required
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                />
              </label>

              {authError && (
                <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {authError}
                </p>
              )}

              <div className="flex items-center gap-3">
                <button
                  className="flex-1 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                  type="submit"
                  disabled={authSubmitting}
                >
                  {authSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  onClick={() => {
                    setShowLogin(false);
                    setAuthError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {canManageNotices && mode === 'admin' && isNoticeFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 md:p-6">
          <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[30px]">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => {
                  setIsNoticeFormOpen(false);
                  setEditingNotice(null);
                }}
              >
                Close
              </button>
            </div>
            <AdminNoticeForm
              onSubmitNotice={editingNotice ? handleUpdateNotice : handleCreateNotice}
              isSubmitting={isSubmitting}
              isModal
              initialValues={editingNotice || undefined}
              submitLabel={editingNotice ? 'Update Notice' : 'Create Notice'}
              title={editingNotice ? 'Edit Notice' : 'Create a Notice'}
              descriptionText={
                editingNotice
                  ? 'Adjust the selected notice and save changes without losing its pinned or archive state.'
                  : 'Add a new campus update with stronger context, optional attachment links, and a clear expiry plan.'
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAppV2;
