/* eslint-disable no-unreachable */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import AdminNoticeForm from './components/AdminNoticeForm';
import CategorySubscriptions from './components/CategorySubscriptions';
import DashboardTabs from './components/DashboardTabs';
import FeedFilters from './components/FeedFilters';
import NoticeCard from './components/NoticeCard';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const SUBSCRIPTION_STORAGE_KEY = 'smart-notice-subscribed-categories';

const defaultFilters = {
  search: '',
  category: 'All',
  urgency: 'All',
  department: 'All',
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
});

function App() {
  // 3. Create a state to store our notices (starts as an empty list)
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [mode, setMode] = useState('student');
  const [feedView, setFeedView] = useState('active');
  const [filters, setFilters] = useState(defaultFilters);
  const [submitMessage, setSubmitMessage] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission
  );
  const [subscribedCategories, setSubscribedCategories] = useState(() => {
    const storedValue = window.localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : [];
  });
  const latestNoticeIdsRef = useRef([]);
  const initializedNotificationsRef = useRef(false);

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
    window.localStorage.setItem(
      SUBSCRIPTION_STORAGE_KEY,
      JSON.stringify(subscribedCategories)
    );
  }, [subscribedCategories]);

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
          subscribedCategories.length > 0 &&
          newNotices.length > 0
        ) {
          newNotices
            .filter((notice) => subscribedCategories.includes(notice.category))
            .forEach((notice) => {
              new Notification(`New ${notice.category} notice`, {
                body: notice.title,
              });
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
  }, [notificationPermission, subscribedCategories]);

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

  const regularNotices = useMemo(
    () => notices.filter((notice) => !notice.isPinned),
    [notices]
  );

  const departments = useMemo(
    () =>
      [...new Set(notices.map((notice) => notice.department).filter(Boolean))].sort(),
    [notices]
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
      const response = await axios.post(`${API_BASE_URL}/api/notices`, payload);
      if (feedView === 'active') {
        setNotices((currentNotices) => sortNotices([response.data, ...currentNotices]));
      }
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
      const response = await axios.put(
        `${API_BASE_URL}/api/notices/${editingNotice._id}`,
        payload
      );
      setNotices((currentNotices) =>
        sortNotices(
          currentNotices.map((notice) =>
            notice._id === editingNotice._id ? response.data : notice
          )
        )
      );
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

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      setSubmitMessage('Browser notifications enabled for subscribed categories.');
    } else {
      setSubmitMessage('Notification permission was not granted.');
    }
  };

  const adminCards = notices.map((notice) => (
    <NoticeCard
      key={notice._id}
      notice={notice}
      showArchiveBadge={feedView === 'archive'}
      actions={[
        {
          label: 'Edit',
          variant: 'primary',
          onClick: () => setEditingNotice(notice),
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
      ]}
    />
  ));

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-blue-900 p-4 shadow-md text-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-200">
              Smart College Notice Board
            </p>
            <h1 className="text-2xl font-bold">SmartNotice</h1>
          </div>
          <p className="text-sm text-blue-100">React + Express + MongoDB Atlas</p>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        <header className="mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900">Campus Notices</h2>
          <p className="text-gray-600 mt-2">
            Search, manage, pin, archive, and subscribe to notices from one dashboard.
          </p>
        </header>

        <DashboardTabs
          mode={mode}
          setMode={setMode}
          feedView={feedView}
          setFeedView={setFeedView}
        />

        {mode === 'student' && feedView === 'active' && (
          <CategorySubscriptions
            subscribedCategories={subscribedCategories}
            notificationPermission={notificationPermission}
            onToggleCategory={handleToggleCategory}
            onEnableNotifications={handleEnableNotifications}
          />
        )}

        <FeedFilters
          filters={filters}
          departments={departments}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {mode === 'admin' && (
          <section className="mb-10">
            <AdminNoticeForm
              onSubmitNotice={editingNotice ? handleUpdateNotice : handleCreateNotice}
              isSubmitting={isSubmitting}
              initialValues={editingNotice || undefined}
              submitLabel={editingNotice ? 'Update Notice' : 'Create Notice'}
              title={editingNotice ? 'Edit Notice' : 'Create a Notice'}
              descriptionText={
                editingNotice
                  ? 'Update the selected notice and save your changes.'
                  : 'Add new notices with pinning, urgency, archive-ready expiry dates, and attachment links.'
              }
            />

            {editingNotice && (
              <button
                type="button"
                className="mt-4 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setEditingNotice(null)}
              >
                Cancel Editing
              </button>
            )}
          </section>
        )}

        {submitMessage && (
          <p className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {submitMessage}
          </p>
        )}

        {loading ? (
          <div className="text-center text-xl text-gray-500">Loading notices...</div>
        ) : (
          <>
            {mode === 'student' && feedView === 'active' && pinnedNotices.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Pinned Notices</h3>
                  <span className="text-sm text-blue-700 font-semibold">
                    Top 3 priority updates
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotices.map((notice) => (
                    <NoticeCard key={notice._id} notice={notice} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {feedView === 'archive' ? 'Archived Notices' : 'Latest Notices'}
                </h3>
                <span className="text-sm text-gray-500">{notices.length} notices</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mode === 'admin'
                  ? adminCards
                  : (feedView === 'archive' ? notices : regularNotices).map((notice) => (
                      <NoticeCard
                        key={notice._id}
                        notice={notice}
                        showArchiveBadge={feedView === 'archive'}
                      />
                    ))}
              </div>
            </section>
          </>
        )}

        {!loading && notices.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            No notices matched the current filters.
          </p>
        )}
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-800 p-4 shadow-md text-white">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎓 SmartNotice</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Campus Notices</h2>

        <AdminNoticeForm onCreateNotice={handleCreateNotice} isSubmitting={isSubmitting} />

        {submitMessage && (
          <p className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {submitMessage}
          </p>
        )}
        
        {loading ? (
          <div className="text-center text-xl text-gray-500">Loading notices...</div>
        ) : (
          <>
            {pinnedNotices.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Pinned Notices</h3>
                  <span className="text-sm text-blue-700 font-semibold">Top 3 priority updates</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pinnedNotices.map((notice) => (
                    <NoticeCard key={notice._id} notice={notice} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Latest Notices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularNotices.map((notice) => (
                  <NoticeCard key={notice._id} notice={notice} />
                ))}
              </div>
            </section>
          </>
        )}

        {!loading && notices.length === 0 && (
          <p className="text-center text-gray-500">No notices found yet.</p>
        )}
      </main>
    </div>
  );
}

export default App;
