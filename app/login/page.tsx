"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, UserPlus, LogIn, CheckCircle2, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowResend(false);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message && data.message.toLowerCase().includes('verify your email')) {
          setShowResend(true);
        }
        throw new Error(data.message || 'Login failed. Check your credentials.');
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error('No token received from server. Check backend response.');
      }

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Hard navigation so Next.js middleware re-reads the cookie
      window.location.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(`Account created for ${data.data?.user?.name || name}. A verification link has been sent to your email.`);
      setMode('login');
      setName('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');
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
      setSuccess(data.data?.message || 'If required, a verification link has been resent.');
      setShowResend(false);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resending');
    } finally {
      setResendLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to request password reset link.');
      }
      setSuccess(data.data?.message || 'If an account exists, a password reset link has been sent.');
      setEmail('');
    } catch (err: any) {
      setError(err.message || 'An error occurred during password reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-20">
        <div className="w-[600px] h-[600px] rounded-full border border-primary/20 absolute blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center gap-2 group justify-center mb-8">
          <div className="w-8 h-8 rounded bg-surface-100 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
            <span className="font-display text-primary text-xl leading-none mt-1">V</span>
          </div>
          <span className="font-display text-2xl tracking-widest uppercase">Vantara</span>
        </Link>

        <div className="bg-surface-50 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Tab Toggle */}
          {mode !== 'forgot-password' && (
            <div className="flex bg-background border border-white/10 rounded-lg p-1 mb-8">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); setShowResend(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-primary text-black' : 'text-secondary hover:text-foreground'}`}
              >
                <LogIn size={14} /> Sign In
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); setShowResend(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-primary text-black' : 'text-secondary hover:text-foreground'}`}
              >
                <UserPlus size={14} /> Create Account
              </button>
            </div>
          )}

          {/* Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex flex-col gap-3 text-red-400"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span className="text-sm">{error}</span>
                </div>
                {showResend && (
                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={handleResendVerification}
                    className="text-xs font-semibold uppercase tracking-wider bg-primary text-black py-2 px-3 rounded hover:bg-primary/90 transition-all disabled:opacity-75 flex items-center justify-center gap-2 self-start"
                  >
                    {resendLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    Resend Verification Email
                  </button>
                )}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3 text-green-400"
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span className="text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-display uppercase tracking-wider mb-1">Workshop Access</h1>
                  <p className="text-secondary text-xs">Secure staff login portal</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="name@workshop.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium uppercase tracking-wider text-secondary">Password</label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); setShowResend(false); }}
                      className="text-xs text-primary hover:text-primary/80 transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-semibold rounded-lg py-3 mt-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={16} /> Sign In</>}
                </button>
              </motion.form>
            )}

            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-display uppercase tracking-wider mb-1">Create Account</h1>
                  <p className="text-secondary text-xs">Register a new workshop staff member</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="name@workshop.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="Min. 6 characters"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-surface-100 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="MANAGER">Manager</option>
                    <option value="SERVICE_ADVISOR">Service Advisor</option>
                    <option value="TECHNICIAN">Technician</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-surface-200 border border-white/20 text-white font-semibold rounded-lg py-3 mt-2 hover:bg-surface-300 hover:border-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={16} /> Create Account</>}
                </button>
              </motion.form>
            )}

            {mode === 'forgot-password' && (
              <motion.form
                key="forgot-password"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleForgotPassword}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-display uppercase tracking-wider mb-1">Reset Password</h1>
                  <p className="text-secondary text-xs">Request a single-use secure reset link</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-secondary">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-100 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                      placeholder="name@workshop.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-black font-semibold rounded-lg py-3 mt-4 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><Mail size={16} /> Send Reset Link</>}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); setShowResend(false); }}
                    className="text-xs text-secondary hover:text-foreground transition-colors bg-transparent border-none cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-secondary mt-6">
          Not a workshop customer?{' '}
          <Link href="/track" className="text-primary hover:text-primary/80 transition-colors">
            Track your vehicle here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
