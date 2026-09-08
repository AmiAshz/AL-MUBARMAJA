"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Wrench, ShieldCheck, MapPin, 
  Clock, CheckCircle, Search, Key, Phone, Mail, ChevronRight,
  ClipboardCheck, Cpu, Users, Eye, ArrowRight, PhoneCall, Compass
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- DICTIONARY FOR AUTO WORKSHOP LOCALIZATION ---
const dict = {
  ar: {
    // 1. BRANDING
    title: "المبرمج",
    subBrand: "صيانة وتشخيص وإصلاح المركبات باحترافية",
    tagline: "عناية تتواجد مع كل عملية إصلاح.",

    // 2. NAVIGATION
    home: "الرئيسية",
    servicesNav: "خدماتنا",
    trackNav: "تتبع مركبتك",
    aboutNav: "من نحن",
    contactNav: "تواصل معنا",
    employeeLogin: "تسجيل دخول الموظفين",
    langToggle: "English",

    // 3. HOME PAGE
    heroHeading: "العناية بمركبتك تبدأ بالتشخيص الصحيح",
    heroSubheading: "صيانة موثوقة، وتشخيص دقيق، وإصلاح احترافي — مع الاهتمام بكل تفاصيل مركبتك.",
    servicesBtn: "خدماتنا",
    trackBtn: "تتبع مركبتك",

    // ABOUT THE WORKSHOP
    aboutWorkshopTitle: "مركبتك مسؤوليتنا",
    aboutWorkshopDesc: "في المبرمج، ندرك أن مركبتك جزء مهم من حياتك اليومية. نحرص في ورشتنا على الفحص الدقيق، والتشخيص الصحيح، والصيانة بجودة عالية، وتنفيذ أعمال الإصلاح باحترافية. كما نحرص على إبقائك على اطلاع بمراحل العمل على مركبتك طوال فترة الإصلاح.",

    // 4. OUR SERVICES
    servicesTitle: "خدماتنا",
    servicesSubtitle: "خدمات احترافية للمحافظة على سلامة مركبتك واعتماديتها وجاهزيتها للطريق.",

    // 5. WHY CHOOSE US
    whyTitle: "لماذا تختار المبرمج؟",

    // 6. HOW IT WORKS
    howItWorksTitle: "كيف تتم عملية إصلاح المركبة؟",

    // 7. TRACK YOUR VEHICLE
    trackSecTitle: "تتبع مركبتك",
    trackSecDesc: "تابع حالة إصلاح مركبتك مباشرة من خلال موقعنا. أدخل رمز التتبع الذي تم تزويدك به ورقم الجوال المسجل لدى الورشة.",
    trackingCodeLabel: "رمز التتبع",
    trackingCodePlaceholder: "أدخل رمز التتبع الخاص بك",
    mobileNumberLabel: "رقم الجوال المسجل",
    mobileNumberPlaceholder: "أدخل رقم الجوال المسجل لدى الورشة",
    trackVehicleAction: "تتبع المركبة",
    privacyNoticeTitle: "تنبيه الخصوصية",
    privacyNotice: "حفاظاً على خصوصيتك، لا يتم عرض معلومات المركبة إلا عند تطابق رمز التتبع مع رقم الجوال المسجل في سجلات الورشة.",

    // 9. ABOUT US
    aboutUsTitle: "من نحن",
    aboutUsDesc1: "المبرمج هي ورشة متخصصة في صيانة المركبات وفحصها وتشخيصها وإصلاحها.",
    approachTitle: "منهجنا بسيط:",
    approachMotto: "نفحص بعناية. نشخّص بدقة. نصلح باحترافية.",
    aboutUsDesc2: "نؤمن بأن الخدمة الجيدة للمركبة تبدأ بفهم المشكلة الحقيقية. لذلك نركز على التشخيص الصحيح قبل الإصلاح، وجودة تنفيذ العمل أثناء عملية الإصلاح، والتواصل الواضح مع العملاء.",
    ourGoalTitle: "هدفنا",
    ourGoalDesc: "تقديم خدمة موثوقة للمركبات مع منح العملاء رؤية واضحة عن رحلة إصلاح مركباتهم.",

    // 10. CONTACT US
    contactTitle: "تواصل مع المبرمج",
    contactSubtitle: "هل لديك استفسار حول خدماتنا أو مركبتك؟ تواصل مع فريق الورشة.",
    workshopLabel: "الورشة",
    workshopVal: "المبرمج",
    locationLabel: "الموقع",
    locationVal: "المحالة، أبها، المملكة العربية السعودية",
    phoneLabel: "رقم الهاتف",
    phoneVal: "+966 55 885 2934",
    workingHoursLabel: "ساعات العمل",
    workingDaysVal: "السبت – الخميس",
    workingTimeVal: "8:30 صباحاً – 6:30 مساءً",
    fridayLabel: "الجمعة",
    fridayVal: "مغلق",
    callWorkshopBtn: "اتصل بالورشة",
    getDirectionsBtn: "الاتجاهات",

    // 31. FOOTER
    quickLinksTitle: "روابط سريعة",
    copyright: "©️ 2026 المبرمج. جميع الحقوق محفوظة."
  },
  en: {
    // 1. BRANDING
    title: "AL Mubarmaja",
    subBrand: "Professional Vehicle Maintenance, Diagnosis & Repair",
    tagline: "Care Behind Every Repair.",

    // 2. NAVIGATION
    home: "Home",
    servicesNav: "Our Services",
    trackNav: "Track Your Vehicle",
    aboutNav: "About Us",
    contactNav: "Contact Us",
    employeeLogin: "Employee Login",
    langToggle: "العربية",

    // 3. HOME PAGE
    heroHeading: "Professional Vehicle Care Starts With the Right Diagnosis",
    heroSubheading: "Reliable vehicle maintenance, accurate diagnosis, and professional repair — with attention to every detail of your vehicle.",
    servicesBtn: "Our Services",
    trackBtn: "Track Your Vehicle",

    // ABOUT THE WORKSHOP
    aboutWorkshopTitle: "Your Vehicle. Our Responsibility.",
    aboutWorkshopDesc: "At AL Mubarmaja, we understand that your vehicle is an important part of your daily life. Our workshop focuses on proper inspection, accurate diagnosis, quality maintenance, and dependable repair work. We keep you informed about the progress of your vehicle throughout the repair process.",

    // 4. OUR SERVICES
    servicesTitle: "Our Services",
    servicesSubtitle: "Professional services designed to keep your vehicle safe, reliable, and ready for the road.",

    // 5. WHY CHOOSE US
    whyTitle: "Why Choose AL Mubarmaja?",

    // 6. HOW IT WORKS
    howItWorksTitle: "How Vehicle Repair Works",

    // 7. TRACK YOUR VEHICLE
    trackSecTitle: "Track Your Vehicle",
    trackSecDesc: "Follow your vehicle's repair progress directly from our website. Enter the tracking code provided to you and the mobile number registered with your vehicle.",
    trackingCodeLabel: "Tracking Code",
    trackingCodePlaceholder: "Enter your tracking code.",
    mobileNumberLabel: "Registered Mobile Number",
    mobileNumberPlaceholder: "Enter the mobile number registered with the workshop.",
    trackVehicleAction: "Track Vehicle",
    privacyNoticeTitle: "Privacy Notice",
    privacyNotice: "For your privacy, vehicle information is only displayed when the tracking code and registered mobile number match our records.",

    // 9. ABOUT US
    aboutUsTitle: "About AL Mubarmaja",
    aboutUsDesc1: "AL Mubarmaja is a professional vehicle workshop focused on vehicle maintenance, inspection, diagnosis, and repair.",
    approachTitle: "Our approach is simple:",
    approachMotto: "Inspect carefully. Diagnose accurately. Repair professionally.",
    aboutUsDesc2: "We believe that good vehicle service begins with understanding the actual problem. That is why we focus on proper diagnosis before repair, careful workmanship during the repair process, and clear communication with our customers.",
    ourGoalTitle: "Our Goal",
    ourGoalDesc: "To provide reliable vehicle service while giving customers a clear understanding of their vehicle's repair journey.",

    // 10. CONTACT US
    contactTitle: "Contact AL Mubarmaja",
    contactSubtitle: "Have a question about our services or your vehicle? Get in touch with our workshop team.",
    workshopLabel: "Workshop",
    workshopVal: "AL Mubarmaja",
    locationLabel: "Location",
    locationVal: "Almahalah, Abha, Saudi Arabia",
    phoneLabel: "Phone",
    phoneVal: "+966 55 885 2934",
    workingHoursLabel: "Working Hours",
    workingDaysVal: "Saturday – Thursday",
    workingTimeVal: "8:30 AM – 6:30 PM",
    fridayLabel: "Friday",
    fridayVal: "Closed",
    callWorkshopBtn: "Call Workshop",
    getDirectionsBtn: "Get Directions",

    // 31. FOOTER
    quickLinksTitle: "Quick Links",
    copyright: "©️ 2026 AL Mubarmaja. All rights reserved."
  }
};

// --- 4. OUR SERVICES (EXACT 7 SERVICES) ---
const servicesList = [
  {
    icon: Wrench,
    nameAr: "صيانة المركبات",
    nameEn: "Vehicle Maintenance",
    descAr: "أعمال الصيانة الدورية والوقائية للمساعدة في الحفاظ على أداء المركبة واعتماديتها.",
    descEn: "Routine and preventive maintenance to help maintain your vehicle's performance and reliability."
  },
  {
    icon: Search,
    nameAr: "تشخيص المركبات",
    nameEn: "Vehicle Diagnosis",
    descAr: "فحص وتشخيص دقيق لتحديد أسباب المشاكل قبل البدء في أعمال الإصلاح.",
    descEn: "Accurate inspection and diagnosis to identify the cause of vehicle problems before repair work begins."
  },
  {
    icon: ShieldCheck,
    nameAr: "إصلاح المركبات",
    nameEn: "Vehicle Repair",
    descAr: "تنفيذ أعمال الإصلاح باحترافية وفقاً للحالة التي تم تشخيصها.",
    descEn: "Professional repair services based on the diagnosed condition of the vehicle."
  },
  {
    icon: ClipboardCheck,
    nameAr: "فحص المركبات",
    nameEn: "Vehicle Inspection",
    descAr: "فحص شامل للمركبة للكشف عن المشاكل الميكانيكية والفنية.",
    descEn: "Detailed inspection of the vehicle to identify mechanical and technical issues."
  },
  {
    icon: Cpu,
    nameAr: "التشخيص الفني",
    nameEn: "Technical Diagnostics",
    descAr: "اختبارات وتشخيص فني منهجي للوصول إلى الأعطال بدقة.",
    descEn: "Systematic testing and technical diagnosis to identify faults accurately."
  },
  {
    icon: Users,
    nameAr: "فنيون متخصصون",
    nameEn: "Specialized Technicians",
    descAr: "فنيون ذوو خبرة في فحص المركبات وتشخيصها وصيانتها وإصلاحها.",
    descEn: "Experienced technicians handling inspection, diagnosis, maintenance, and repair work."
  },
  {
    icon: Eye,
    nameAr: "متابعة كاملة للإصلاح",
    nameEn: "Complete Repair Follow-up",
    descAr: "متابعة واضحة لمركبتك منذ استلامها وحتى التشخيص والإصلاح والانتهاء من العمل.",
    descEn: "Clear tracking of your vehicle from intake through diagnosis, repair, and completion."
  }
];

// --- 5. WHY CHOOSE US (EXACT 6 VALUES) ---
const whyChooseUsList = [
  {
    titleAr: "تشخيص دقيق",
    titleEn: "Accurate Diagnosis",
    descAr: "نركز على تحديد السبب الحقيقي للمشكلة قبل البدء في الإصلاح.",
    descEn: "We focus on identifying the actual cause of the problem before repair work begins."
  },
  {
    titleAr: "عمل احترافي",
    titleEn: "Professional Work",
    descAr: "نتعامل مع كل مركبة بعناية واهتمام بالتفاصيل.",
    descEn: "Every vehicle is handled with care and attention to detail."
  },
  {
    titleAr: "متابعة واضحة للإصلاح",
    titleEn: "Clear Progress Tracking",
    descAr: "يمكن للعميل متابعة حالة مركبته باستخدام رمز تتبع خاص ورقم الجوال المسجل.",
    descEn: "Customers can follow the progress of their vehicle using a private tracking code and registered phone number."
  },
  {
    titleAr: "فنيون ذوو خبرة",
    titleEn: "Experienced Technicians",
    descAr: "يعمل الفنيون لدينا في مجالات فحص المركبات وتشخيصها وصيانتها وإصلاحها.",
    descEn: "Our technicians work across vehicle inspection, diagnosis, maintenance, and repair."
  },
  {
    titleAr: "إجراءات واضحة",
    titleEn: "Transparent Process",
    descAr: "يمكنك معرفة حالة مركبتك ومراحل العمل عليها.",
    descEn: "Stay informed about the status and progress of your vehicle."
  },
  {
    titleAr: "اهتمام بالعميل",
    titleEn: "Customer Focus",
    descAr: "نسعى لتقديم خدمة موثوقة وتجربة إصلاح واضحة للعميل.",
    descEn: "We aim to provide dependable service and a clear repair experience."
  }
];

// --- 6. HOW IT WORKS (EXACT 6 STEPS) ---
const howItWorksSteps = [
  {
    num: "01",
    titleAr: "استلام المركبة",
    titleEn: "Vehicle Received",
    descAr: "يتم تسجيل المركبة وحفظ بياناتها.",
    descEn: "Your vehicle is registered and its details are recorded."
  },
  {
    num: "02",
    titleAr: "الفحص والتشخيص",
    titleEn: "Inspection & Diagnosis",
    descAr: "يقوم الفنيون بفحص المركبة وتحديد المشاكل المبلغ عنها أو المكتشفة.",
    descEn: "Our technicians inspect the vehicle and identify the reported or detected problems."
  },
  {
    num: "03",
    titleAr: "بدء الإصلاح",
    titleEn: "Repair Begins",
    descAr: "يتم تنفيذ أعمال الإصلاح المطلوبة بناءً على نتيجة التشخيص.",
    descEn: "The required repair work is carried out based on the diagnosis."
  },
  {
    num: "04",
    titleAr: "تحديثات العمل",
    titleEn: "Progress Updates",
    descAr: "يتم تسجيل حالة الإصلاح وتقدم العمل طوال فترة الإصلاح.",
    descEn: "The repair status and work progress are recorded throughout the process."
  },
  {
    num: "05",
    titleAr: "الفحص النهائي",
    titleEn: "Final Check",
    descAr: "يتم فحص المركبة بعد الانتهاء من أعمال الإصلاح.",
    descEn: "The vehicle is checked after the repair work is completed."
  },
  {
    num: "06",
    titleAr: "جاهزية الاستلام",
    titleEn: "Ready for Collection",
    descAr: "يتم إشعارك عند جاهزية مركبتك للاستلام.",
    descEn: "You receive a notification when your vehicle is ready for collection."
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom = 0) => ({
    opacity: 1, 
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  })
};

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick tracking state
  const [quickCode, setQuickCode] = useState('');
  const [quickPhone, setQuickPhone] = useState('');

  const t = dict[lang];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickCode.trim() && quickPhone.trim()) {
      router.push(`/track?code=${encodeURIComponent(quickCode.trim())}&phone=${encodeURIComponent(quickPhone.trim())}`);
    } else if (quickCode.trim()) {
      router.push(`/track?code=${encodeURIComponent(quickCode.trim())}`);
    } else {
      router.push('/track');
    }
  };

  const googleMapsUrl = "https://maps.google.com/?q=18.2410405,42.5722994";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-primary font-mono text-xs uppercase tracking-widest">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <main className="w-full bg-background min-h-screen text-foreground selection:bg-primary/30 overflow-x-hidden">
      
      {/* 2. NAVIGATION */}
      <header className="fixed top-0 w-full z-50 bg-white border-b border-border h-[85px] flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt={t.title} className="h-[45px] md:h-[56px] w-auto object-contain group-hover:opacity-80 transition-opacity" />
              <div className="hidden lg:flex flex-col">
                <span className="font-display font-bold text-base text-foreground leading-tight">{t.title}</span>
                <span className="text-[10px] text-secondary font-medium">{t.subBrand}</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-7">
            <Link href="#hero" className="text-xs font-semibold uppercase tracking-wider text-[#475467] hover:text-[#3D5A0E] transition-colors">{t.home}</Link>
            <Link href="#services" className="text-xs font-semibold uppercase tracking-wider text-[#475467] hover:text-[#3D5A0E] transition-colors">{t.servicesNav}</Link>
            <Link href="#track" className="text-xs font-semibold uppercase tracking-wider text-[#475467] hover:text-[#3D5A0E] transition-colors">{t.trackNav}</Link>
            <Link href="#about" className="text-xs font-semibold uppercase tracking-wider text-[#475467] hover:text-[#3D5A0E] transition-colors">{t.aboutNav}</Link>
            <Link href="#contact" className="text-xs font-semibold uppercase tracking-wider text-[#475467] hover:text-[#3D5A0E] transition-colors">{t.contactNav}</Link>
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 border border-[#D0D5DD] bg-white rounded text-xs font-mono text-[#344054] hover:bg-surface-200 transition-colors"
            >
              {t.langToggle}
            </button>
            <Link href="/login" className="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:bg-brand-hover transition-colors shadow-sm">
              {t.employeeLogin}
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="flex md:hidden items-center gap-3">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 py-1 border border-[#D0D5DD] bg-white rounded text-xs font-mono text-[#344054] hover:bg-surface-200 transition-colors"
            >
              {t.langToggle}
            </button>
            <button className="text-foreground hover:text-primary p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-border overflow-hidden absolute top-[85px] w-full shadow-lg"
            >
              <div className="px-6 py-6 flex flex-col gap-4">
                <Link href="#hero" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-secondary hover:text-primary">{t.home}</Link>
                <Link href="#services" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-secondary hover:text-primary">{t.servicesNav}</Link>
                <Link href="#track" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-secondary hover:text-primary">{t.trackNav}</Link>
                <Link href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-secondary hover:text-primary">{t.aboutNav}</Link>
                <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-secondary hover:text-primary">{t.contactNav}</Link>
                <div className="h-px bg-border my-1" />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2.5 bg-primary text-white font-bold text-center text-xs rounded hover:bg-brand-hover transition-colors shadow-sm">
                  {t.employeeLogin}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 3. HOME PAGE - HERO */}
      <section id="hero" className="relative min-h-[85vh] flex items-center justify-center pt-36 pb-20 overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center">
          <div className="w-[800px] h-[800px] rounded-full border border-[#4C7111]/8 absolute" />
          <div className="w-[500px] h-[500px] rounded-full border border-[#4C7111]/[0.025] absolute blur-[1px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10 w-full flex flex-col items-center text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-6 flex items-center gap-3 bg-surface-100 border border-border px-4 py-1.5 rounded-full shadow-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-secondary uppercase">{t.subBrand}</span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} initial="hidden" animate="visible" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-[1.25] text-foreground max-w-4xl">
            {t.heroHeading}
          </motion.h1>

          <motion.h2 custom={1.5} variants={fadeUp} initial="hidden" animate="visible" className="text-base sm:text-lg md:text-xl text-[#3D5A0E] font-medium tracking-wide mb-6 max-w-3xl leading-relaxed">
            {t.heroSubheading}
          </motion.h2>

          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="flex items-center gap-2 mb-10 text-xs md:text-sm font-semibold text-secondary italic">
            <span>"{t.tagline}"</span>
          </motion.div>

          <motion.div custom={2.5} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="#services" className="px-8 py-3.5 bg-primary text-white font-bold rounded-lg hover:bg-brand-hover transition-all w-full sm:w-auto shadow-md text-center text-xs uppercase tracking-wider">
              {t.servicesBtn}
            </Link>
            <Link href="#track" className="px-8 py-3.5 bg-white border border-primary text-foreground font-semibold rounded-lg hover:bg-surface-50 transition-colors w-full sm:w-auto text-center text-xs uppercase tracking-wider shadow-sm">
              {t.trackBtn}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ABOUT THE WORKSHOP (Section 3) */}
      <section className="py-20 bg-surface-50 border-t border-border">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t.aboutWorkshopTitle}
          </motion.h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-6" />
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="text-sm md:text-base text-secondary leading-relaxed max-w-3xl mx-auto">
            {t.aboutWorkshopDesc}
          </motion.p>
        </div>
      </section>

      {/* 4. OUR SERVICES */}
      <section id="services" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-2xl md:text-3xl font-bold uppercase mb-3 text-foreground">
            {t.servicesTitle}
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1} className="text-xs md:text-sm text-secondary max-w-xl mx-auto">
            {t.servicesSubtitle}
          </motion.p>
          <div className="w-16 h-1 bg-primary mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <motion.div 
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className="p-8 border border-border bg-white rounded-2xl hover:border-primary/50 transition-all group flex flex-col justify-between shadow-[0_4px_18px_rgba(30,37,43,0.05)] hover:shadow-md"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-surface-50 text-primary border border-border group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base md:text-lg font-bold mb-3 text-foreground">
                    {lang === 'ar' ? svc.nameAr : svc.nameEn}
                  </h3>
                  <p className="text-xs md:text-sm text-secondary leading-relaxed">
                    {lang === 'ar' ? svc.descAr : svc.descEn}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <section id="why-choose-us" className="py-24 bg-surface-50 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t.whyTitle}</h2>
            <div className="w-16 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUsList.map((item, idx) => (
              <div key={idx} className="p-6 bg-white border border-border rounded-xl shadow-sm hover:border-primary/40 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <h3 className="text-sm md:text-base font-bold text-foreground">
                    {lang === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                </div>
                <p className="text-xs md:text-sm text-secondary leading-relaxed">
                  {lang === 'ar' ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t.howItWorksTitle}</h2>
          <div className="w-16 h-1 bg-primary mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {howItWorksSteps.map((step, idx) => (
            <div key={idx} className="relative p-6 bg-white border border-border rounded-2xl shadow-sm flex flex-col group hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-mono font-bold text-primary">{step.num}</span>
                <span className="w-8 h-8 rounded-full bg-surface-50 border border-border flex items-center justify-center text-secondary text-xs font-mono">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">
                {lang === 'ar' ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-xs md:text-sm text-secondary leading-relaxed">
                {lang === 'ar' ? step.descAr : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. TRACK YOUR VEHICLE (CTA TO DEDICATED PAGE) */}
      <section id="track" className="py-24 bg-surface-50 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white border border-border rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
              <Key size={30} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t.trackSecTitle}</h2>
            <p className="text-sm md:text-base text-secondary max-w-2xl mx-auto leading-relaxed mb-8">{t.trackSecDesc}</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-8">
              <Link 
                href="/track"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-md"
              >
                <span>{t.trackVehicleAction}</span>
                <ArrowRight size={18} className={lang === 'ar' ? 'rotate-180' : ''} />
              </Link>
            </div>

            <div className="pt-6 border-t border-border flex items-center justify-center gap-3 bg-surface-50 p-4 rounded-xl max-w-xl mx-auto">
              <ShieldCheck size={20} className="text-primary shrink-0" />
              <div className="text-xs leading-relaxed text-secondary text-start">
                <span className="font-bold text-foreground">{t.privacyNoticeTitle}: </span>
                {t.privacyNotice}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. ABOUT US */}
      <section id="about" className="py-24 max-w-7xl mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t.aboutUsTitle}</h2>
            <div className="w-16 h-1 bg-primary mx-auto" />
          </div>

          <div className="bg-white border border-border rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
            <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
              {t.aboutUsDesc1}
            </p>

            <div className="p-6 bg-surface-50 border-r-4 md:border-r-4 border-primary rounded-xl space-y-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{t.approachTitle}</h3>
              <p className="text-base md:text-xl font-bold text-foreground italic">
                {t.approachMotto}
              </p>
            </div>

            <p className="text-sm md:text-base text-secondary leading-relaxed">
              {t.aboutUsDesc2}
            </p>

            <div className="pt-6 border-t border-border">
              <h3 className="text-base font-bold text-foreground mb-2">{t.ourGoalTitle}</h3>
              <p className="text-sm md:text-base text-secondary leading-relaxed">
                {t.ourGoalDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CONTACT US */}
      <section id="contact" className="py-24 bg-surface-50 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{t.contactTitle}</h2>
            <p className="text-xs md:text-sm text-secondary max-w-xl mx-auto leading-relaxed">{t.contactSubtitle}</p>
            <div className="w-16 h-1 bg-primary mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Contact Details Card */}
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm space-y-6">
              <div className="flex items-start gap-4 p-4 bg-surface-50 border border-border rounded-xl">
                <MapPin className="text-primary shrink-0 mt-1" size={22} />
                <div>
                  <div className="text-xs font-semibold text-secondary">{t.locationLabel}</div>
                  <div className="text-sm font-bold text-foreground mt-0.5">{t.locationVal}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-50 border border-border rounded-xl">
                <Phone className="text-primary shrink-0 mt-1" size={22} />
                <div>
                  <div className="text-xs font-semibold text-secondary">{t.phoneLabel}</div>
                  <div className="text-sm font-bold text-foreground mt-0.5 phone-number">{t.phoneVal}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-surface-50 border border-border rounded-xl">
                <Clock className="text-primary shrink-0 mt-1" size={22} />
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-secondary">{t.workingHoursLabel}</div>
                  <div className="text-sm font-bold text-foreground">
                    {t.workingDaysVal}: <span className="font-normal text-secondary">{t.workingTimeVal}</span>
                  </div>
                  <div className="text-xs font-bold text-accent-rust">
                    {t.fridayLabel}: <span className="font-normal">{t.fridayVal}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <a 
                  href="tel:+966558852934"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors shadow-md text-center"
                >
                  <PhoneCall size={16} />
                  {t.callWorkshopBtn}
                </a>
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-primary text-foreground font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-surface-50 transition-colors shadow-sm text-center"
                >
                  <Compass size={16} />
                  {t.getDirectionsBtn}
                </a>
              </div>
            </div>

            {/* Map Placeholder Card */}
            <div className="relative w-full h-[400px] border border-border bg-white rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-8 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(75,120,8,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              <div className="relative z-10 flex flex-col items-center">
                <MapPin className="text-primary animate-bounce mb-4" size={48} />
                <h4 className="text-xl font-bold text-foreground mb-2">{t.workshopVal}</h4>
                <p className="text-xs text-secondary max-w-xs mb-6 leading-relaxed">
                  {t.locationVal}
                </p>
                <a 
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors shadow-md"
                >
                  <Compass size={14} />
                  {t.getDirectionsBtn}
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 31. FOOTER */}
      <footer className="bg-white border-t border-border py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            
            {/* Col 1: Brand */}
            <div className="space-y-3">
              <span className="font-display text-2xl font-bold text-foreground block">{t.title}</span>
              <p className="text-xs text-secondary leading-relaxed">{t.subBrand}</p>
              <p className="text-xs text-primary font-medium italic">{t.tagline}</p>
            </div>

            {/* Col 2: Quick links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">{t.quickLinksTitle}</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#hero" className="text-secondary hover:text-primary transition-colors">{t.home}</Link></li>
                <li><Link href="#services" className="text-secondary hover:text-primary transition-colors">{t.servicesNav}</Link></li>
                <li><Link href="/track" className="text-secondary hover:text-primary transition-colors">{t.trackNav}</Link></li>
                <li><Link href="#about" className="text-secondary hover:text-primary transition-colors">{t.aboutNav}</Link></li>
                <li><Link href="#contact" className="text-secondary hover:text-primary transition-colors">{t.contactNav}</Link></li>
              </ul>
            </div>

            {/* Col 3: Contact & Hours */}
            <div className="space-y-3 text-xs">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">{t.contactNav}</h4>
              <p className="text-secondary">{t.locationVal}</p>
              <p className="text-foreground font-mono font-bold phone-number">{t.phoneVal}</p>
              <div className="pt-2 border-t border-border space-y-1 text-secondary">
                <div>{t.workingDaysVal}: <span className="font-semibold text-foreground">{t.workingTimeVal}</span></div>
                <div>{t.fridayLabel}: <span className="font-semibold text-accent-rust">{t.fridayVal}</span></div>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <div>{t.copyright}</div>
            <div>
              <Link href="/login" className="hover:text-primary transition-colors">{t.employeeLogin}</Link>
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
