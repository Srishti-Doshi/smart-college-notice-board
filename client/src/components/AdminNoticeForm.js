import React, { useMemo, useState } from 'react';

const CATEGORY_OPTIONS = ['Academic', 'Placement', 'Events', 'General'];
const URGENCY_OPTIONS = ['Low', 'Medium', 'High', 'Urgent'];

const defaultFormState = {
  title: '',
  description: '',
  category: 'Academic',
  department: 'All',
  urgency: 'Medium',
  attachmentUrl: '',
  attachmentFile: null,
  expiresAt: '',
  isPinned: false,
  pinnedRank: '1',
  createdBy: 'Academic Office',
};

function AdminNoticeForm({
  onSubmitNotice,
  isSubmitting,
  initialValues = defaultFormState,
  submitLabel = 'Create Notice',
  title = 'Create a Notice',
  descriptionText = 'Start with the essential fields. We will add attachments and more advanced features in the next steps.',
  isModal = false,
}) {
  const computedInitialState = useMemo(
    () => ({
      ...defaultFormState,
      ...initialValues,
      attachmentUrl: initialValues.attachmentUrl || '',
      attachmentFile: null,
      expiresAt: initialValues.expiresAt ? initialValues.expiresAt.slice(0, 16) : '',
      pinnedRank: String(initialValues.pinnedRank || defaultFormState.pinnedRank),
    }),
    [initialValues]
  );

  const [formData, setFormData] = useState(computedInitialState);
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    setFormData(computedInitialState);
    setFormError('');
  }, [computedInitialState]);

  const handleChange = (event) => {
    const { name, value, type, checked, files } = event.target;

    if (type === 'file') {
      setFormData((currentFormData) => ({
        ...currentFormData,
        [name]: files?.[0] || null,
      }));
      return;
    }

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      department: formData.department.trim() || 'All',
      urgency: formData.urgency,
      attachmentUrl: formData.attachmentUrl.trim() || undefined,
      attachmentFile: formData.attachmentFile || undefined,
      expiresAt: formData.expiresAt || undefined,
      isPinned: formData.isPinned,
      pinnedRank: formData.isPinned ? Number(formData.pinnedRank) : undefined,
      createdBy: formData.createdBy.trim() || 'Admin',
    };

    const result = await onSubmitNotice(payload);

    if (!result.success) {
      setFormError(result.message);
      return;
    }

    if (submitLabel === 'Create Notice') {
      setFormData(defaultFormState);
    }
  };

  return (
    <section
      className={`rounded-[30px] shadow-[0_18px_45px_rgba(15,23,42,0.08)] p-6 text-slate-900 ${
        isModal
          ? 'bg-white/72 border border-white/70 backdrop-blur-2xl'
          : 'bg-white/88 border border-white/70 backdrop-blur'
      }`}
    >
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-blue-800">
          Admin Panel
        </p>
        <h3 className="text-3xl font-extrabold text-slate-950 mt-2">{title}</h3>
        <p className={`text-sm mt-2 ${isModal ? 'font-medium text-slate-800' : 'text-slate-500'}`}>
          {descriptionText}
        </p>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-5" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-900">Title</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="title"
            placeholder="Example: End-Semester Examination Timetable for UG Programs"
            value={formData.title}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-900">Description</span>
          <textarea
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 min-h-[140px] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="description"
            placeholder="Example: The Controller of Examinations has released the final schedule. Students should verify subject codes, hall allotments, and reporting time before Friday."
            value={formData.description}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Category</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Urgency</span>
          <select
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="urgency"
            value={formData.urgency}
            onChange={handleChange}
          >
            {URGENCY_OPTIONS.map((urgency) => (
              <option key={urgency} value={urgency}>
                {urgency}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Department</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="department"
            placeholder="Example: All / CSE / ECE / MBA"
            value={formData.department}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Expires At</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Attachment URL</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="attachmentUrl"
            placeholder="Example: https://college.edu/circulars/end-sem-timetable.pdf"
            value={formData.attachmentUrl}
            onChange={handleChange}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Upload Document</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
            type="file"
            name="attachmentFile"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleChange}
          />
          <span className={`text-xs ${isModal ? 'text-slate-600' : 'text-slate-500'}`}>
            Upload PDF, DOC, DOCX, PNG, or JPG up to 5 MB.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-slate-900">Created By</span>
          <input
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            name="createdBy"
            placeholder="Example: Examination Cell / Placement Office"
            value={formData.createdBy}
            onChange={handleChange}
          />
        </label>

        <div className="flex flex-col gap-3">
          <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-900">
            <input
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
            />
            Pin this notice to the top section
          </label>

          {formData.isPinned && (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-900">Pinned Rank</span>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                name="pinnedRank"
                value={formData.pinnedRank}
                onChange={handleChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </label>
          )}
        </div>

        <div className="md:col-span-2">
          {formError && (
            <p className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {formError}
            </p>
          )}

          <button
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Notice...' : submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AdminNoticeForm;
