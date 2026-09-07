"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, UserPlus, LogIn, CheckCircle2, User, Phone } from 'lucide-react';
import Link from 'next/link';

const dict = {
  ar: {
    // 1. BRANDING
    title: "المبرمج",
    tagline: "عناية تتواجد مع كل عملية إصلاح.",
    home: "الرئيسية",
    langToggle: "English",

    // 11. EMPLOYEE LOGIN
    employeeLoginTitle: "دخول الموظفين",
    secureAccessTitle: "دخول آمن إلى نظام الورشة",
    loginDesc: "سجّل الدخول لإدارة المركبات والإصلاحات والتكاليف وتقدم العمل وإشعارات العملاء.",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "أدخل بريدك الإلكتروني.",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور.",
    forgotPasswordLink: "هل نسيت كلمة المرور؟",
    loginBtn: "تسجيل الدخول",
    dontHaveAccount: "ليس لديك حساب؟",
    createAccountLink: "إنشاء حساب",

    // 12. EMPLOYEE REGISTRATION
    createEmployeeTitle: "إنشاء حساب موظف",
    createEmployeeDesc: "أنشئ حساباً للوصول إلى نظام إدارة الورشة.",
    fullNameLabel: "الاسم الكامل",
    fullNamePlaceholder: "أدخل الاسم الكامل.",
    regEmailPlaceholder: "أدخل البريد الإلكتروني.",
    mobileNumberLabel: "رقم الجوال",
    mobileNumberPlaceholder: "أدخل رقم الجوال.",
    createPasswordLabel: "كلمة المرور",
    createPasswordPlaceholder: "أنشئ كلمة مرور.",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور.",
    createAccountBtn: "إنشاء الحساب",
    alreadyHaveAccount: "لديك حساب بالفعل؟",

    // 14. FORGOT PASSWORD
    forgotPasswordTitle: "هل نسيت كلمة المرور؟",
    forgotPasswordDesc: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
    sendResetLinkBtn: "إرسال رابط إعادة التعيين",
    backToLoginBtn: "العودة إلى تسجيل الدخول",

    // 13 & 30. POP-UP & SYSTEM MESSAGES
    verificationSentSuccess: "لقد أرسلنا رابط التحقق إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد لتفعيل حسابك.",
    resendVerificationPrompt: "لم تصلك الرسالة؟",
    resendVerificationBtn: "إعادة إرسال رسالة التحقق",
    passwordResetSent: "تم إرسال رسالة إعادة تعيين كلمة المرور.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    requiredFieldsError: "يرجى إدخال جميع الحقول المطلوبة."
  },
  en: {
    // 1. BRANDING
    title: "AL Mubarmaja",
    tagline: "Care Behind Every Repair.",
    home: "Home",
    langToggle: "العربية",

    // 11. EMPLOYEE LOGIN
    employeeLoginTitle: "Employee Login",
    secureAccessTitle: "Secure Workshop Access",
    loginDesc: "Sign in to manage vehicles, repairs, costs, work progress, and customer notifications.",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address.",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password.",
    forgotPasswordLink: "Forgot Password?",
    loginBtn: "Login",
    dontHaveAccount: "Don't have an account?",
    createAccountLink: "Create Account",

    // 12. EMPLOYEE REGISTRATION
    createEmployeeTitle: "Create Employee Account",
    createEmployeeDesc: "Create an account to access the workshop management system.",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter full name.",
    regEmailPlaceholder: "Enter email address.",
    mobileNumberLabel: "Mobile Number",
    mobileNumberPlaceholder: "Enter mobile number.",
    createPasswordLabel: "Password",
    createPasswordPlaceholder: "Create password.",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm password.",
    createAccountBtn: "Create Account",
    alreadyHaveAccount: "Already have an account?",

    // 14. FORGOT PASSWORD
    forgotPasswordTitle: "Forgot Password?",
    forgotPasswordDesc: "Enter your email address and we will send you a link to reset your password.",
    sendResetLinkBtn: "Send Reset Link",
    backToLoginBtn: "Back to Login",

    // 13 & 30. POP-UP & SYSTEM MESSAGES
    verificationSentSuccess: "We've sent a verification link to your email address. Please check your inbox and click the verification button to activate your account.",
    resendVerificationPrompt: "Didn't receive the email?",
    resendVerificationBtn: "Resend Verification Email",
    passwordResetSent: "Password reset email sent.",
    passwordsDoNotMatch: "Passwords do not match.",
    requiredFieldsError: "Please enter all required fields."
  }
};

export default function LoginPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const t = dict[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

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
        body: JSON.stringify({ email: email.trim(), password })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.message && data.message.toLowerCase().includes('verify your email')) {
          setShowResend(true);
        }
        throw new Error(data.message || t.requiredFieldsError);
      }

      const token = data.data?.token;
      const user = data.data?.user;

      if (!token) {
        throw new Error('Authentication token not received.');
      }

      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      window.location.replace('/dashboard');
    } catch (err: any) {
      setError(err.message || t.requiredFieldsError);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), password, role: 'ADMIN' })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t.requiredFieldsError);
      }

      setSuccess(t.verificationSentSuccess);
      setMode('login');
      setName('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || t.requiredFieldsError);
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
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend verification email.');
      }
      setSuccess(t.verificationSentSuccess);
      setShowResend(false);
    } catch (err: any) {
      setError(err.message || t.requiredFieldsError);
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
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to request password reset link.');
      }
      setSuccess(t.passwordResetSent);
      setEmail('');
    } catch (err: any) {
      setError(err.message || t.requiredFieldsError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden py-16">
      {/* Background Graphic Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-20">
        <div className="w-[600px] h-[600px] rounded-full border border-primary/20 absolute blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      {/* Top Header Row */}
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
        <Link href="/" className="flex flex-col items-center justify-center mb-8 group">
          <img src="/logo.png" alt={t.title} className="w-[140px] md:w-[190px] h-auto max-h-[55px] md:max-h-[65px] object-contain group-hover:opacity-80 transition-opacity" />
          <span className="text-xs text-secondary tracking-widest uppercase mt-1 opacity-80">{t.tagline}</span>
        </Link>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-xl">
          {/* Sign In / Sign Up Tabs */}
          {mode !== 'forgot-password' && (
            <div className="flex bg-surface-50 border border-border rounded-lg p-1 mb-8">
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); setShowResend(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${mode === 'login' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-foreground'}`}
              >
                <LogIn size={14} /> {t.employeeLoginTitle}
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); setShowResend(false); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${mode === 'register' ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-foreground'}`}
              >
                <UserPlus size={14} /> {t.createAccountLink}
              </button>
            </div>
          )}

          {/* Validation & Error Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-3 text-red-700 text-sm"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                {showResend && (
                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={handleResendVerification}
                    className="text-xs font-bold uppercase tracking-wider bg-primary text-white py-2 px-3 rounded hover:bg-brand-hover transition-all disabled:opacity-75 flex items-center justify-center gap-2 self-start"
                  >
                    {resendLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                    {t.resendVerificationBtn}
                  </button>
                )}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-700 text-sm"
              >
                <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* 11. EMPLOYEE LOGIN FORM */}
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase tracking-wider mb-1 text-foreground">{t.employeeLoginTitle}</h1>
                  <p className="text-primary text-xs font-semibold">{t.secureAccessTitle}</p>
                  <p className="text-secondary text-xs mt-1 leading-relaxed">{t.loginDesc}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                      placeholder={t.emailPlaceholder}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                      {t.passwordLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => { setMode('forgot-password'); setError(''); setSuccess(''); setShowResend(false); }}
                      className="text-xs text-primary hover:underline transition-colors bg-transparent border-none cursor-pointer p-0"
                    >
                      {t.forgotPasswordLink}
                    </button>
                  </div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <Lock size={16} />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                      placeholder={t.passwordPlaceholder}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold rounded-lg py-3.5 mt-2 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-xs shadow-md"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={16} /> {t.loginBtn}</>}
                </button>

                <div className="text-center pt-2 text-xs text-secondary">
                  <span>{t.dontHaveAccount} </span>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    className="text-primary font-bold hover:underline"
                  >
                    {t.createAccountLink}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 12. EMPLOYEE REGISTRATION FORM */}
            {mode === 'register' && (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase tracking-wider mb-1 text-foreground">{t.createEmployeeTitle}</h1>
                  <p className="text-secondary text-xs leading-relaxed">{t.createEmployeeDesc}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                    {t.fullNameLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                      placeholder={t.fullNamePlaceholder}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                      placeholder={t.regEmailPlaceholder}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                    {t.mobileNumberLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground phone-number`}
                      placeholder={t.mobileNumberPlaceholder}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                    {t.createPasswordLabel}
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
                      placeholder={t.createPasswordPlaceholder}
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
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <><UserPlus size={16} /> {t.createAccountBtn}</>}
                </button>

                <div className="text-center pt-2 text-xs text-secondary">
                  <span>{t.alreadyHaveAccount} </span>
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-primary font-bold hover:underline"
                  >
                    {t.loginBtn}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 14. FORGOT PASSWORD FORM */}
            {mode === 'forgot-password' && (
              <motion.form
                key="forgot-password"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                onSubmit={handleForgotPassword}
                className="space-y-5"
              >
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold uppercase tracking-wider mb-1 text-foreground">{t.forgotPasswordTitle}</h1>
                  <p className="text-secondary text-xs leading-relaxed">{t.forgotPasswordDesc}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-sm focus:outline-none focus:border-primary transition-all text-foreground`}
                      placeholder={t.emailPlaceholder}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold rounded-lg py-3.5 mt-2 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-xs shadow-md"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <>{t.sendResetLinkBtn}</>}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    className="text-xs text-secondary hover:text-foreground transition-colors flex items-center justify-center gap-1 mx-auto"
                  >
                    <span>{lang === 'ar' ? '→' : '←'}</span> {t.backToLoginBtn}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
