import React from 'react';

function PanelHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-3xl font-black text-slate-900">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export default PanelHeader;
