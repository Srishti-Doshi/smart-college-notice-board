import React, { useState } from 'react';

function LoginCard({ onLogin, isSubmitting, errorMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin({
      email: email.trim(),
      password,
    });
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] px-6 py-16">
      <div className="mx-auto max-w-md rounded-[30px] border border-slate-200 bg-white p-8 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-700">
          Smart College Notice Board
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Sign In</h1>
        <p className="mt-2 text-sm text-slate-500">
          Login as Admin, HOD, or Student to continue.
        </p>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@college.edu"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </label>

          {errorMessage && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </p>
          )}

          <button
            className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginCard;
