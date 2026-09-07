"use client";

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </React.Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(token ? '' : 'Password reset token is missing. Please request a new link.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password. The link may have expired.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial gold glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-25">
        <div className="w-[600px] h-[600px] rounded-full border border-primary/20 absolute blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded bg-surface-100 border border-white/10 flex items-center justify-center">
            <span className="font-display text-primary text-xl leading-none mt-1">V</span>
          </div>
          <span className="font-display text-2xl tracking-widest uppercase text-foreground">Vantara</span>
        </div>

        <div className="bg-surface-50 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 text-center flex flex-col items-center gap-5"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                  <CheckCircle2 size={36} />
                </div>
                <h1 className="text-2xl font-display uppercase tracking-wider text-foreground">Password Reset</h1>
                <p className="text-secondary text-sm text-center">
                  Your VANTARA password has been updated successfully. You can now sign in with your new password.
                </p>
                <Link
                  href="/login"
                  className="w-full bg-primary text-black font-semibold rounded-lg py-3 mt-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                >
                  Go to Sign In &rarr;
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-display uppercase tracking-wider mb-1">Set New Password</h1>
                  <p className="text-secondary text-xs">Enter your new credentials below</p>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-secondary">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={!token || loading}
                        className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-secondary">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                        <Lock size={16} />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={!token || loading}
                        className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!token || loading}
                    className="w-full bg-primary text-black font-semibold rounded-lg py-3 mt-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Update Password'}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <Link
                    href="/login"
                    className="text-xs text-secondary hover:text-foreground transition-all inline-flex items-center gap-1"
                  >
                    <ArrowLeft size={12} /> Back to Sign In
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
