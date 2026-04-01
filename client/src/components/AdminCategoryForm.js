import React, { useState } from 'react';

function AdminCategoryForm({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isSubmitting,
  mode = 'create',
  isModal = false,
}) {
  const [categoryName, setCategoryName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingCategory, setEditingCategory] = useState('');
  const [editingName, setEditingName] = useState('');

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

  const handleStartEdit = (category) => {
    setErrorMessage('');
    setEditingCategory(category);
    setEditingName(category);
  };

  const handleSaveEdit = async (category) => {
    setErrorMessage('');

    const result = await onUpdateCategory(category, editingName.trim());

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    setEditingCategory('');
    setEditingName('');
  };

  const handleDelete = async (category) => {
    setErrorMessage('');
    const confirmed = window.confirm(`Delete category "${category}"?`);

    if (!confirmed) {
      return;
    }

    const result = await onDeleteCategory(category);

    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  return (
    <section
      className={`rounded-[24px] p-5 shadow-sm ${
        isModal
          ? 'border border-white/70 bg-white/82 backdrop-blur-2xl'
          : 'border border-slate-200 bg-white/92'
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
        Category Admin
      </p>
      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900">
        {mode === 'create' ? 'Add Category' : 'Edit Categories'}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
        {mode === 'create'
          ? 'Create a new category for notices, filters, and subscriptions.'
          : 'Rename or delete categories from one place.'}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {categories.length} categories
        </span>
      </div>

      {mode === 'create' && (
        <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
          <input
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            placeholder="Example: Scholarships"
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:min-w-[150px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      )}

      {errorMessage && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {mode === 'edit' && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <div className="mt-3 space-y-2.5">
          {categories.length === 0 ? (
            <p className="text-sm text-slate-500">No categories available yet.</p>
          ) : (
            categories.map((category) => (
              <div
                key={category}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/85 px-4 py-3 md:flex-row md:items-center"
              >
                {editingCategory === category ? (
                  <>
                    <input
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                    <div className="flex gap-2 self-end md:self-auto">
                      <button
                        type="button"
                        className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                        onClick={() => handleSaveEdit(category)}
                        disabled={isSubmitting}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={() => {
                          setEditingCategory('');
                          setEditingName('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{category}</p>
                    </div>
                    <div className="flex gap-2 self-end md:self-auto">
                      <button
                        type="button"
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        onClick={() => handleStartEdit(category)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        onClick={() => handleDelete(category)}
                        disabled={isSubmitting}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
        </div>
      )}
    </section>
  );
}

export default AdminCategoryForm;
