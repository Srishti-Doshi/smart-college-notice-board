import React from 'react';

function NoticeDetailsModal({ notice, onClose }) {
  if (!notice) {
    return null;
  }

  const noticeDate = notice.createdAt || notice.date;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.35)] md:p-8">
        <button
          type="button"
          className="absolute right-4 top-4 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          onClick={onClose}
        >
          Close
        </button>

        <div className="pr-14">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
              {notice.department}
            </span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
              {notice.category}
            </span>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700">
              {notice.urgency} priority
            </span>
          </div>

          <h3 className="text-3xl font-black text-slate-900 leading-tight">{notice.title}</h3>

          <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-500">
            <p>
              Posted on:{' '}
              <span className="font-semibold text-slate-700">
                {noticeDate
                  ? new Date(noticeDate).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'Not available'}
              </span>
            </p>
            <p>
              Created by:{' '}
              <span className="font-semibold text-slate-700">
                {notice.createdBy || 'Admin'}
              </span>
            </p>
          </div>

          <div className="mt-6 rounded-[24px] bg-slate-50 px-5 py-5 text-[17px] leading-8 text-slate-700">
            {notice.description || notice.content}
          </div>

          {notice.attachmentUrl && (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Attachment
              </p>
              <a
                className="mt-2 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800"
                href={notice.attachmentUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open {notice.attachmentName || 'attached document'}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NoticeDetailsModal;
