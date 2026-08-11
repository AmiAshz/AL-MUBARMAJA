"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Verification token is missing. Please request a new verification link.');
      return;
    }

    const performVerification = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Verification failed. The link may have expired or is invalid.');
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || 'An error occurred during verification.');
      }
    };

    performVerification();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResendLoading(true);
    setResendError('');
    setResendSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email.');
      }

      setResendSuccess(data.data?.message || 'If required, a verification link has been resent.');
      setEmail('');
    } catch (err: any) {
      setResendError(err.message || 'An error occurred while resending');
    } finally {
      setResendLoading(false);
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

        <div className="bg-surface-50 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
          <AnimatePresence mode="wait">
            {status === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 flex flex-col items-center gap-4"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <h1 className="text-xl font-display uppercase tracking-wider text-foreground">Verifying Account</h1>
                <p className="text-secondary text-sm">Please wait while we activate your workshop account...</p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 flex flex-col items-center gap-5"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
                  <CheckCircle2 size={36} />
                </div>
                <h1 className="text-2xl font-display uppercase tracking-wider text-foreground">Email Verified!</h1>
                <p className="text-secondary text-sm">
                  Welcome to VANTARA. Your workshop staff account is now fully active.
                </p>
                <Link
                  href="/login"
                  className="w-full bg-primary text-black font-semibold rounded-lg py-3 mt-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
                >
                  Go to Sign In &rarr;
                </Link>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-4 flex flex-col items-center gap-5"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <XCircle size={36} />
                </div>
                <h1 className="text-2xl font-display uppercase tracking-wider text-foreground">Verification Failed</h1>
                <p className="text-red-400 text-sm">{errorMsg}</p>

                {/* Resend form */}
                <div className="w-full border-t border-white/10 pt-6 mt-4 text-left">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-3 text-center">
                    Request new verification link
                  </h2>
                  
                  {resendSuccess && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs flex items-center gap-2">
                      <CheckCircle2 size={14} className="shrink-0" />
                      <span>{resendSuccess}</span>
                    </div>
                  )}

                  {resendError && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{resendError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResend} className="space-y-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                        <Mail size={14} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-100 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 transition-all"
                        placeholder="name@workshop.com"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={resendLoading}
                      className="w-full bg-surface-200 hover:bg-surface-300 border border-white/10 text-foreground font-medium rounded-lg py-2 text-xs transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-70"
                    >
                      {resendLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                      Send Verification Link
                    </button>
                  </form>
                </div>

                <Link
                  href="/login"
                  className="mt-6 text-xs text-secondary hover:text-foreground transition-all flex items-center gap-1"
                >
                  <ArrowLeft size={12} /> Back to Sign In
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
