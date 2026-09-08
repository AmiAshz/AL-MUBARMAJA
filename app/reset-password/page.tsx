"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const dict = {
  ar: {
    // 1. BRANDING
    title: "المبرمج",
    home: "الرئيسية",
    langToggle: "English",

    // 14. FORGOT PASSWORD & RESET
    forgotPasswordTitle: "هل نسيت كلمة المرور؟",
    resetPassTitle: "إعادة تعيين كلمة المرور",
    newPasswordLabel: "كلمة المرور الجديدة",
    newPasswordPlaceholder: "أنشئ كلمة مرور جديدة.",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور.",
    updatePasswordBtn: "تحديث كلمة المرور",
    backToLoginBtn: "العودة إلى تسجيل الدخول",
    loginBtn: "تسجيل الدخول",
    resetSuccess: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.",
    tokenMissing: "رمز إعادة التعيين مفقود. يرجى طلب رابط جديد.",
    passwordsMismatch: "كلمتا المرور غير متطابقتين.",
    passLengthError: "يجب ألا تقل كلمة المرور عن 6 أحرف."
  },
  en: {
    // 1. BRANDING
    title: "AL Mubarmaja",
    home: "Home",
    langToggle: "العربية",

    // 14. FORGOT PASSWORD & RESET
    forgotPasswordTitle: "Forgot Password?",
    resetPassTitle: "Reset Password",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "Create new password.",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm password.",
    updatePasswordBtn: "Update Password",
    backToLoginBtn: "Back to Login",
    loginBtn: "Login",
    resetSuccess: "Password reset successfully. You can now log in with your new password.",
    tokenMissing: "Password reset token is missing. Please request a new link.",
    passwordsMismatch: "Passwords do not match.",
    passLengthError: "Password must be at least 6 characters."
  }
};

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </React.Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const t = dict[lang];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

  useEffect(() => {
    if (!token) {
      setError(t.tokenMissing);
    } else {
      setError('');
    }
  }, [token, t.tokenMissing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.passLengthError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden py-16">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-20">
        <div className="w-[600px] h-[600px] rounded-full border border-primary/20 absolute blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Language Header */}
      <div className="absolute top-6 max-w-md w-full flex items-center justify-between px-6 z-20">
        <Link href="/" className="text-xs font-semibold text-secondary hover:text-foreground transition-colors flex items-center gap-1">
          <span>{lang === 'ar' ? '→' : '←'}</span> {t.home}
        </Link>
        <button 
          onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
          className="px-3 py-1.5 border border-border bg-white rounded text-xs font-mono text-secondary hover:text-foreground transition-colors"
        >
          {t.langToggle}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex flex-col items-center justify-center mb-8">
          <img src="/logo.png" alt={t.title} className="w-[140px] md:w-[190px] h-auto max-h-[55px] md:max-h-[65px] object-contain" />
        </Link>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold uppercase tracking-wider mb-1 text-foreground">{t.resetPassTitle}</h1>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex flex-col items-center text-center gap-3 text-green-700 text-sm"
              >
                <CheckCircle2 size={32} className="text-green-600" />
                <span>{t.resetSuccess}</span>
                <Link
                  href="/login"
                  className="w-full py-3 bg-primary text-white font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-brand-hover transition-colors shadow-md mt-2 block"
                >
                  {t.loginBtn}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && token && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                  {t.newPasswordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                    placeholder={t.newPasswordPlaceholder}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                    placeholder={t.confirmPasswordPlaceholder}
                    minLength={6}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold rounded-lg py-3.5 mt-4 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-xs shadow-md"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : t.updatePasswordBtn}
              </button>

              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="text-xs text-secondary hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>{lang === 'ar' ? '→' : '←'}</span> {t.backToLoginBtn}
                </Link>
              </div>
            </form>
          )}

          {!token && (
            <div className="text-center pt-2">
              <Link
                href="/login"
                className="text-xs text-primary font-bold hover:underline"
              >
                {t.backToLoginBtn}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
