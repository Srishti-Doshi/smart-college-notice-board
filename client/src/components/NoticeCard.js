import React from 'react';

const NoticeCard = ({ notice, actions, showArchiveBadge = false, onOpenNotice }) => {
  const noticeDescription = notice.description || notice.content;
  const noticeDate = notice.createdAt || notice.date;
  const shouldShowReadMore = noticeDescription && noticeDescription.length > 140;

  return (
    <div className={`rounded-[28px] border p-6 transition-all duration-300 group bg-white/88 backdrop-blur shadow-[0_18px_45px_rgba(15,23,42,0.08)] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)] ${
      notice.isPinned ? 'border-blue-300 ring-1 ring-blue-100' : 'border-white/70'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {notice.department}
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
            {notice.category}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {noticeDate ? new Date(noticeDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}
        </span>
      </div>
      <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors mb-2">
        {notice.title}
      </h3>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-600 mb-3">
        {notice.urgency || 'Medium'} priority
      </p>

      {showArchiveBadge && (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">
          Archived Notice
        </p>
      )}

      <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
        {noticeDescription}
      </p>

      {shouldShowReadMore && onOpenNotice && (
        <button
          type="button"
          className="mt-4 inline-flex text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-blue-700"
          onClick={() => onOpenNotice(notice)}
        >
          Read full notice
        </button>
      )}

      {notice.attachmentUrl && (
        <a
          className="inline-flex mt-5 text-sm font-semibold text-blue-700 hover:text-blue-800"
          href={notice.attachmentUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open attachment
        </a>
      )}

      {actions && actions.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                action.variant === 'danger'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : action.variant === 'secondary'
                    ? 'bg-gray-100 text-gray-700 border border-gray-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticeCard;
