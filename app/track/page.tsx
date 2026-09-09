"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ArrowRight, Loader2, AlertCircle, CheckCircle2, Circle, Clock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const dict = {
  ar: {
    // 1. BRANDING
    title: "المبرمج",
    tagline: "عناية تتواجد مع كل عملية إصلاح.",
    home: "الرئيسية",
    langToggle: "English",

    // 7. TRACK YOUR VEHICLE
    trackTitle: "تتبع مركبتك",
    trackDesc: "تابع حالة إصلاح ومراحل صيانة مركبتك مباشرة وفورياً من خلال موقعنا.",
    trackInstruction: "أدخل رمز التتبع الخاص بمركبتك لمتابعة تفاصيل الإصلاح.",
    codeLabel: "رمز التتبع",
    codePlaceholder: "أدخل رمز التتبع الخاص بك (مثال: VT-ABC123)",
    trackAction: "تتبع المركبة",
    privacyNoticeTitle: "خدمة التتبع المباشر",
    privacyNotice: "يمكنك متابعة حالة الصيانة ومراحل العمل المكتملة وآخر التحديثات وتكاليف الإصلاح المعتمدة فورياً باستخدام رمز التتبع.",

    // 8. VEHICLE TRACKING RESULT
    vehicleStatusTitle: "حالة المركبة",
    vehicleLabel: "المركبة",
    regNumberLabel: "رقم اللوحة",
    trackingCodeLabel: "رمز التتبع",
    currentStatusLabel: "الحالة الحالية",
    repairProgressTitle: "مراحل الإصلاح",
    latestUpdateTitle: "آخر تحديث",
    noUpdateYet: "لا توجد تحديثات إضافية مسجلة حالياً.",
    trackAnother: "تتبع مركبة أخرى",

    // 19. REPAIR STATUS
    statusAwaitingDiagnosis: "بانتظار التشخيص",
    statusInProgress: "قيد التنفيذ",
    statusAwaitingParts: "بانتظار قطع الغيار",
    statusReadyForPickup: "جاهزة للاستلام",
    statusCompleted: "مكتمل",

    // Repair Progress Stages
    stageVehicleReceived: "تم استلام المركبة",
    stageVehicleReceivedDesc: "تم استلام المركبة في الورشة.",
    stageDiagnosis: "التشخيص والفحص",
    stageDiagnosisCompletedDesc: "تم الانتهاء من فحص وتشخيص المركبة.",
    stageRepair: "الإصلاح والصيانة",
    stageRepairInProgressDesc: "أعمال الإصلاح والصيانة جارية.",
    stageFinalCheck: "الفحص النهائي والجودة",
    stagePending: "لم يبدأ بعد.",
    stageCompleted: "تم الانتهاء بنجاح.",
    stageReadyForCollection: "جاهزة للاستلام",

    // 30. POP-UP / SYSTEM MESSAGES
    vehicleNotFound: "لم يتم العثور على مركبة بهذا الرمز. يرجى التحقق من صحة رمز التتبع والمحاولة مجدداً.",
    enterTrackingCode: "يرجى إدخال رمز التتبع."
  },
  en: {
    // 1. BRANDING
    title: "AL Mubarmaja",
    tagline: "Care Behind Every Repair.",
    home: "Home",
    langToggle: "العربية",

    // 7. TRACK YOUR VEHICLE
    trackTitle: "Track Your Vehicle",
    trackDesc: "Follow your vehicle's repair progress and status directly in real-time.",
    trackInstruction: "Enter your vehicle's tracking code to view live repair progress.",
    codeLabel: "Tracking Code",
    codePlaceholder: "Enter your tracking code (e.g. VT-ABC123)",
    trackAction: "Track Vehicle",
    privacyNoticeTitle: "Live Tracking Portal",
    privacyNotice: "You can track vehicle repair status, completed workflow stages, latest technician updates, and approved estimates in real-time.",

    // 8. VEHICLE TRACKING RESULT
    vehicleStatusTitle: "Vehicle Status",
    vehicleLabel: "Vehicle",
    regNumberLabel: "Registration Number",
    trackingCodeLabel: "Tracking Code",
    currentStatusLabel: "Current Status",
    repairProgressTitle: "Repair Progress",
    latestUpdateTitle: "Latest Update",
    noUpdateYet: "No updates recorded yet.",
    trackAnother: "Track Another Vehicle",

    // 19. REPAIR STATUS
    statusAwaitingDiagnosis: "Awaiting Diagnosis",
    statusInProgress: "In Progress",
    statusAwaitingParts: "Awaiting Parts",
    statusReadyForPickup: "Ready for Pickup",
    statusCompleted: "Completed",

    // Repair Progress Stages
    stageVehicleReceived: "Vehicle Received",
    stageVehicleReceivedDesc: "Vehicle received at the workshop.",
    stageDiagnosis: "Diagnosis & Inspection",
    stageDiagnosisCompletedDesc: "Diagnosis and inspection completed.",
    stageRepair: "Repair & Service",
    stageRepairInProgressDesc: "Repair and service in progress.",
    stageFinalCheck: "Final Quality Check",
    stagePending: "Pending.",
    stageCompleted: "Completed successfully.",
    stageReadyForCollection: "Ready for Collection",

    // 30. POP-UP / SYSTEM MESSAGES
    vehicleNotFound: "No vehicle found with this tracking code. Please verify the code and try again.",
    enterTrackingCode: "Please enter your tracking code."
  }
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  const t = dict[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

  // Auto-submit if code param is present on load
  useEffect(() => {
    const codeParam = searchParams.get('code') || '';

    if (codeParam) {
      setTrackingCode(codeParam);
      const formEvent = { preventDefault: () => {} } as React.FormEvent;
      handleTrack(formEvent, codeParam);
    }
  }, [searchParams]);

  const handleTrack = async (e: React.FormEvent, overrideCode?: string) => {
    e.preventDefault();
    setError('');
    setTrackingData(null);

    const activeCode = (overrideCode ?? trackingCode).trim();

    if (!activeCode) {
      setError(t.enterTrackingCode);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/public/vehicle-tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode: activeCode })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || t.vehicleNotFound);
      }

      setTrackingData(data.data);
    } catch (err: any) {
      setError(err?.message || t.vehicleNotFound);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusLabel = (status: string) => {
    switch (status) {
      case 'AWAITING_DIAGNOSIS': return t.statusAwaitingDiagnosis;
      case 'IN_PROGRESS': return t.statusInProgress;
      case 'AWAITING_PARTS': return t.statusAwaitingParts;
      case 'READY_FOR_PICKUP': return t.statusReadyForPickup;
      case 'COMPLETED': return t.statusCompleted;
      default: return status;
    }
  };

  // 5 Stages of Repair Progress as defined in Section 8
  const getProgressStages = (status: string) => {
    const isReceived = true; // Always true if registered
    const isDiagnosisDone = ['IN_PROGRESS', 'AWAITING_PARTS', 'READY_FOR_PICKUP', 'COMPLETED'].includes(status);
    const isRepairInProgress = ['IN_PROGRESS', 'AWAITING_PARTS', 'READY_FOR_PICKUP', 'COMPLETED'].includes(status);
    const isFinalCheckDone = ['READY_FOR_PICKUP', 'COMPLETED'].includes(status);
    const isReadyForCollection = ['READY_FOR_PICKUP', 'COMPLETED'].includes(status);

    return [
      {
        title: t.stageVehicleReceived,
        desc: t.stageVehicleReceivedDesc,
        completed: isReceived
      },
      {
        title: t.stageDiagnosis,
        desc: isDiagnosisDone ? t.stageDiagnosisCompletedDesc : t.stagePending,
        completed: isDiagnosisDone
      },
      {
        title: t.stageRepair,
        desc: isRepairInProgress ? t.stageRepairInProgressDesc : t.stagePending,
        completed: isRepairInProgress
      },
      {
        title: t.stageFinalCheck,
        desc: isFinalCheckDone ? t.stageCompleted : t.stagePending,
        completed: isFinalCheckDone
      },
      {
        title: t.stageReadyForCollection,
        desc: isReadyForCollection ? t.stageCompleted : t.stagePending,
        completed: isReadyForCollection
      }
    ];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 relative overflow-x-hidden pt-24 pb-16">
      {/* Background Graphic Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none flex justify-center items-center opacity-10">
        <div className="w-[800px] h-[800px] rounded-full border border-primary/20 absolute blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Header bar */}
      <div className="absolute top-6 max-w-3xl w-full flex items-center justify-between px-6 z-20">
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

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Brand Header */}
        <Link href="/" className="flex flex-col items-center gap-2 group mb-8">
          <img src="/logo.png" alt={t.title} className="w-[140px] md:w-[190px] h-auto max-h-[55px] md:max-h-[65px] object-contain group-hover:opacity-80 transition-opacity" />
          <span className="text-xs text-secondary tracking-widest uppercase mt-1 opacity-80">{t.tagline}</span>
        </Link>

        <AnimatePresence mode="wait">
          {!trackingData ? (
            /* 7. TRACK YOUR VEHICLE FORM */
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="w-full bg-white border border-border rounded-2xl p-8 md:p-10 shadow-xl"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase tracking-wider mb-2 text-foreground">{t.trackTitle}</h1>
                <p className="text-secondary text-sm leading-relaxed max-w-lg mx-auto">{t.trackDesc}</p>
                <p className="text-secondary text-xs mt-2">{t.trackInstruction}</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleTrack} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-secondary block mb-1">
                    {t.codeLabel}
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${lang === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-secondary`}>
                      <Key size={18} />
                    </div>
                    <input 
                      type="text" 
                      value={trackingCode}
                      onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                      className={`w-full bg-surface-50 border border-border rounded-lg ${lang === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3.5 font-mono tracking-widest text-sm focus:outline-none focus:border-primary transition-all uppercase text-foreground`}
                      placeholder={t.codePlaceholder}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-white font-bold rounded-lg py-4 mt-6 hover:bg-brand-hover transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider text-sm shadow-md"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <span className="flex items-center gap-2">
                      {t.trackAction}
                      <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-border flex items-start gap-3 bg-surface-50 p-4 rounded-xl">
                <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-secondary">
                  <span className="font-bold text-foreground">{t.privacyNoticeTitle}: </span>
                  {t.privacyNotice}
                </div>
              </div>
            </motion.div>
          ) : (
            /* 8. VEHICLE TRACKING RESULT */
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6"
            >
              {/* Vehicle Header Card */}
              <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
                  <h2 className="text-xl font-bold uppercase tracking-wider text-foreground">
                    {t.vehicleStatusTitle}
                  </h2>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                    {getCurrentStatusLabel(trackingData.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-surface-50 border border-border rounded-lg">
                    <span className="text-secondary block mb-1">{t.vehicleLabel}</span>
                    <span className="text-sm font-bold text-foreground">
                      {trackingData.vehicle.make} {trackingData.vehicle.model} — {trackingData.vehicle.year}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-50 border border-border rounded-lg">
                    <span className="text-secondary block mb-1">{t.regNumberLabel}</span>
                    <span className="text-sm font-bold text-foreground phone-number">
                      {trackingData.vehicle.plateNumber}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-50 border border-border rounded-lg">
                    <span className="text-secondary block mb-1">{t.trackingCodeLabel}</span>
                    <span className="text-sm font-bold text-primary">
                      {trackingData.vehicle.trackingCode}
                    </span>
                  </div>

                  <div className="p-3 bg-surface-50 border border-border rounded-lg">
                    <span className="text-secondary block mb-1">{t.currentStatusLabel}</span>
                    <span className="text-sm font-bold text-foreground">
                      {getCurrentStatusLabel(trackingData.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Repair Progress Timeline (Section 8) */}
              <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-6">
                  {t.repairProgressTitle}
                </h3>
                
                <div className="relative space-y-6">
                  {getProgressStages(trackingData.status).map((stage, idx, arr) => (
                    <div key={idx} className="flex items-start gap-4 relative">
                      {idx < arr.length - 1 && (
                        <div className={`absolute ${lang === 'ar' ? 'right-3' : 'left-3'} top-7 bottom-[-16px] w-0.5 ${stage.completed ? 'bg-primary' : 'bg-border'}`} />
                      )}
                      
                      <div className="relative z-10 bg-white flex items-center justify-center pt-0.5">
                        {stage.completed ? (
                          <CheckCircle2 size={24} className="text-primary bg-white rounded-full" />
                        ) : (
                          <Circle size={24} className="text-secondary/40 bg-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${stage.completed ? 'text-foreground' : 'text-secondary'}`}>
                          {stage.title}
                        </h4>
                        <p className="text-xs text-secondary mt-0.5 leading-relaxed">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Update (Section 8) */}
              <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <h3 className="text-base font-bold uppercase tracking-wider text-foreground mb-4">
                  {t.latestUpdateTitle}
                </h3>

                {((trackingData.customerUpdates && trackingData.customerUpdates.length > 0) || (trackingData.vehicle?.progressLogs && trackingData.vehicle.progressLogs.length > 0)) ? (
                  <div className="p-4 bg-surface-50 border border-border rounded-xl flex items-start gap-3">
                    <Clock size={18} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {trackingData.customerUpdates?.[0]?.message || trackingData.vehicle.progressLogs[0].message}
                      </p>
                      <span className="text-[10px] text-secondary font-mono mt-1 block">
                        {new Date(trackingData.customerUpdates?.[0]?.createdAt || trackingData.vehicle.progressLogs[0].createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-secondary italic">{t.noUpdateYet}</p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setTrackingData(null)}
                  className="px-6 py-3 bg-white border border-border rounded-lg text-xs font-bold uppercase tracking-wider text-foreground hover:bg-surface-50 transition-colors shadow-sm flex items-center gap-2"
                >
                  <ArrowRight size={14} className={lang === 'ar' ? '' : 'rotate-180'} />
                  {t.trackAnother}
                </button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-mono animate-pulse uppercase tracking-widest text-xs">Loading...</div>
      </div>
    }>
      <TrackContent />
    </Suspense>
  );
}
