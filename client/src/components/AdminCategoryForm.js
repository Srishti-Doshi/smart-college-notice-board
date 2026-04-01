import React, { useState } from 'react';

function AdminCategoryForm({ onCreateCategory, isSubmitting }) {
  const [categoryName, setCategoryName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setErrorMessage('Category name is required.');
      return;
    }

    const result = await onCreateCategory(trimmedName);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setCategoryName('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        Category Admin
      </p>
      <h3 className="mt-2 text-lg font-bold text-slate-900">Create Category</h3>
      <p className="mt-1 text-sm text-slate-600">
        Add a new category once, then it becomes available in filters, alerts, and notice forms.
      </p>

      <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <input
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          placeholder="Example: Scholarships"
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

export default AdminCategoryForm;
