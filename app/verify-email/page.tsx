"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const dict = {
  ar: {
    // 1. BRANDING
    title: "المبرمج",
    home: "الرئيسية",
    langToggle: "English",

    // 13. EMAIL VERIFICATION
    verifyEmailTitle: "تأكيد البريد الإلكتروني",
    verifyingDesc: "جاري التحقق من بريدك الإلكتروني...",
    verifySuccessDesc: "تم تأكيد بريدك الإلكتروني بنجاح.",
    verifyEmailBtn: "تأكيد البريد الإلكتروني",
    didntReceive: "لم تصلك الرسالة؟",
    resendVerificationBtn: "إعادة إرسال رسالة التحقق",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني.",
    loginBtn: "تسجيل الدخول",
    verifyFailed: "تعذر التحقق من البريد الإلكتروني. الرابط غير صالح أو منتهي الصلاحية.",
    tokenMissing: "رمز التحقق مفقود. يرجى طلب رابط تحقق جديد."
  },
  en: {
    // 1. BRANDING
    title: "AL Mubarmaja",
    home: "Home",
    langToggle: "العربية",

    // 13. EMAIL VERIFICATION
    verifyEmailTitle: "Verify Your Email",
    verifyingDesc: "Verifying your email address...",
    verifySuccessDesc: "Your email has been verified.",
    verifyEmailBtn: "Verify Email",
    didntReceive: "Didn't receive the email?",
    resendVerificationBtn: "Resend Verification Email",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address.",
    loginBtn: "Login",
    verifyFailed: "Verification failed. Link is invalid or expired.",
    tokenMissing: "Verification token is missing. Please request a new link."
  }
};

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const t = dict[lang];

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg(t.tokenMissing);
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
          throw new Error(data.message || t.verifyFailed);
        }

        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || t.verifyFailed);
      }
    };

    performVerification();
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setResendLoading(true);
    setResendError('');
    setResendSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email.');
      }

      setResendSuccess(lang === 'ar' ? 'تم إرسال رابط التحقق بنجاح.' : 'Verification link sent successfully.');
      setEmail('');
    } catch (err: any) {
      setResendError(err.message || 'Error sending link.');
    } finally {
      setResendLoading(false);
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

        <div className="bg-white border border-border rounded-2xl p-8 shadow-xl text-center">
          {status === 'verifying' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h2 className="text-lg font-bold text-foreground">{t.verifyEmailTitle}</h2>
              <p className="text-secondary text-xs">{t.verifyingDesc}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t.verifyEmailTitle}</h2>
              <p className="text-secondary text-sm leading-relaxed">{t.verifySuccessDesc}</p>
              
              <Link 
                href="/login" 
                className="w-full py-3.5 bg-primary text-white font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-brand-hover transition-colors shadow-md mt-4 block"
              >
                {t.loginBtn}
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
                <XCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-foreground">{t.verifyEmailTitle}</h2>
              <p className="text-red-700 text-xs bg-red-50 border border-red-200 p-3 rounded-lg w-full">{errorMsg}</p>

              {/* Resend verification email block */}
              <div className="w-full pt-4 border-t border-border mt-4 text-start space-y-3">
                <p className="text-xs font-semibold text-foreground text-center">{t.didntReceive}</p>
                
                {resendSuccess && (
                  <p className="text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">{resendSuccess}</p>
                )}
                {resendError && (
                  <p className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{resendError}</p>
                )}

                <form onSubmit={handleResend} className="space-y-3">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    required
                    className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                  <button 
                    type="submit" 
                    disabled={resendLoading}
                    className="w-full py-3 bg-primary text-white font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-75"
                  >
                    {resendLoading ? '...' : t.resendVerificationBtn}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-xs text-primary font-bold hover:underline">
                    {t.loginBtn}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
