"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, X, Trash2, Printer, 
  CheckCircle, Camera, LogOut, User, AlertCircle,
  LayoutDashboard, Car, ClipboardList, Wallet, History,
  BarChart3, Settings, ShieldCheck, Mail, Phone, MapPin, Check, PlusCircle, Loader2,
  FileText, Download, MessageSquare, Send
} from 'lucide-react';
import { useVehicles } from '@/lib/useVehicles';
import { Vehicle, VehicleStatus, VehiclePhoto, PhotoCategory } from '@/lib/types';
import { processImageFile } from '@/lib/imageUtils';
import Link from 'next/link';
import { openWhatsAppWeb } from '@/lib/whatsapp';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- STYLES & STATUS COLORS ---
const STATUS_COLORS: Record<VehicleStatus, string> = {
  'AWAITING_DIAGNOSIS': 'bg-[#F4F8EF] text-[#4C7111] border-[#C5DBAA]/40',
  'IN_PROGRESS':        'bg-[#E8F0FF] text-[#2455A4] border-[#2455A4]/20',
  'AWAITING_PARTS':     'bg-[#FFF0D9] text-[#A65F00] border-[#A65F00]/20',
  'READY_FOR_PICKUP':   'bg-[#E7F5E9] text-[#2E7D32] border-[#2E7D32]/20',
  'COMPLETED':          'bg-[#E2F1E4] text-[#256329] border-[#256329]/20',
};

const BORDER_COLORS: Record<VehicleStatus, string> = {
  'AWAITING_DIAGNOSIS': 'border-l-primary',
  'IN_PROGRESS':        'border-l-blue-600',
  'AWAITING_PARTS':     'border-l-amber-600',
  'READY_FOR_PICKUP':   'border-l-emerald-600',
  'COMPLETED':          'border-l-green-700',
};

type FilterCategory = 'AWAITING_DIAGNOSIS' | 'IN_PROGRESS' | 'AWAITING_PARTS' | 'READY_FOR_PICKUP' | 'COMPLETED';

const FILTER_MAP: Record<FilterCategory, VehicleStatus[]> = {
  'AWAITING_DIAGNOSIS': ['AWAITING_DIAGNOSIS'],
  'IN_PROGRESS': ['IN_PROGRESS'],
  'AWAITING_PARTS': ['AWAITING_PARTS'],
  'READY_FOR_PICKUP': ['READY_FOR_PICKUP'],
  'COMPLETED': ['COMPLETED']
};

const ACTIVE_STATUSES = [
  'AWAITING_DIAGNOSIS', 'IN_PROGRESS', 'AWAITING_PARTS', 'READY_FOR_PICKUP'
];

// --- 19. REPAIR STATUS LABELS ---
const STATUS_LABELS: Record<'ar' | 'en', Record<string, string>> = {
  ar: {
    All: 'الكل',
    AWAITING_DIAGNOSIS: 'بانتظار التشخيص',
    IN_PROGRESS: 'قيد التنفيذ',
    AWAITING_PARTS: 'بانتظار قطع الغيار',
    READY_FOR_PICKUP: 'جاهزة للاستلام',
    COMPLETED: 'مكتمل',
  },
  en: {
    All: 'All',
    AWAITING_DIAGNOSIS: 'Awaiting Diagnosis',
    IN_PROGRESS: 'In Progress',
    AWAITING_PARTS: 'Awaiting Parts',
    READY_FOR_PICKUP: 'Ready for Pickup',
    COMPLETED: 'Completed',
  },
};

// --- DICTIONARY ALIGNED TO CONTENT SPECIFICATION ---
const dict = {
  ar: {
    // 1. BRANDING
    title: "المبرمج",
    subBrand: "صيانة وتشخيص وإصلاح المركبات باحترافية",
    tagline: "عناية تتواجد مع كل عملية إصلاح.",
    langToggle: "English",

    // 2. NAVIGATION
    home: "الرئيسية",
    ourServicesNav: "خدماتنا",
    trackVehicleNav: "تتبع مركبتك",
    aboutUsNav: "من نحن",
    contactUsNav: "تواصل معنا",
    employeeLoginNav: "تسجيل دخول الموظفين",
    logout: "تسجيل الخروج",

    // 15. DASHBOARD
    dashboard: "لوحة التحكم",
    dashboardDesc: "إدارة عمليات الورشة من مكان واحد.",
    overview: "نظرة عامة",
    totalVehicles: "إجمالي المركبات",
    totalVehiclesDesc: "جميع المركبات المسجلة حالياً.",
    activeJobs: "الأعمال النشطة",
    activeJobsDesc: "المركبات التي تتم معالجتها حالياً.",
    awaitingDiagnosis: "بانتظار التشخيص",
    awaitingDiagnosisDesc: "المركبات التي تنتظر التشخيص.",
    awaitingParts: "بانتظار قطع الغيار",
    awaitingPartsDesc: "المركبات التي تنتظر قطع الغيار المطلوبة.",
    readyForPickup: "جاهزة للاستلام",
    readyForPickupDesc: "المركبات الجاهزة لاستلام العميل.",
    completed: "مكتمل",
    completedDesc: "المركبات التي اكتملت أعمال إصلاحها.",
    outstandingCosts: "التكاليف المستحقة",
    outstandingCostsDesc: "تكاليف الإصلاح غير المدفوعة أو غير المكتملة حالياً.",

    // 16. VEHICLES
    vehicles: "المركبات",
    vehiclesDesc: "عرض وإدارة جميع المركبات المسجلة حالياً في الورشة.",
    searchPlaceholder: "البحث باستخدام رقم اللوحة أو اسم المالك أو الشركة المصنعة أو الطراز أو رقم الهيكل أو رمز التتبع.",
    newVehicleIntake: "تسجيل مركبة جديدة",
    all: "الكل",
    noRecords: "لا توجد سجلات مطابقة للبحث.",
    adjustFilters: "يرجى تعديل الفلاتر أو كلمات البحث.",

    // 17. NEW VEHICLE INTAKE
    vehicleDetailsSection: "بيانات المركبة",
    make: "الشركة المصنعة",
    model: "الطراز",
    year: "السنة",
    plateNumber: "رقم اللوحة",
    vin: "رقم الهيكل",
    customerDetailsSection: "بيانات العميل",
    customerName: "اسم العميل",
    mobileNumber: "رقم الجوال",
    emailAddress: "البريد الإلكتروني",
    vehicleArrivalSection: "بيانات الاستلام",
    dateReceived: "تاريخ الاستلام",
    reportedComplaints: "الشكاوى المبلغ عنها",
    complaintsInstruction: "أضف المشكلات التي ذكرها العميل.",
    addComplaintBtn: "+ إضافة شكوى",
    costNoticeTitle: "التكلفة",
    costNoticeDesc: "قد لا تكون تكلفة الإصلاح معروفة عند استلام المركبة لأول مرة.",
    partsCostLabel: "تكلفة قطع الغيار",
    partsCostNotDetermined: "لم يتم تحديدها",
    laborCostLabel: "تكلفة العمالة",
    laborCostNotDetermined: "لم يتم تحديدها",
    estimatedTotalLabel: "إجمالي التكلفة التقديرية",
    estimatedTotalPending: "بانتظار التشخيص",
    costUpdateAfterDiag: "يمكن إضافة التكاليف أو تحديثها بعد التشخيص.",
    initialStatusLabel: "الحالة الأولية",
    registerVehicleBtn: "تسجيل المركبة",

    // 18. VEHICLE DETAILS
    vehicleDetailsTitle: "تفاصيل المركبة",
    trackingCodeTitle: "رمز التتبع",
    currentStatusTitle: "الحالة الحالية",
    costsTitle: "التكاليف",
    totalCostLabel: "إجمالي التكلفة",
    workProgressTitle: "تقدم العمل",
    workProgressLogTitle: "سجل تقدم العمل",
    addProgressNoteBtn: "إضافة ملاحظة تقدم العمل",
    customerCommunicationTitle: "التواصل مع العميل",
    sendTrackingWhatsApp: "إرسال تفاصيل التتبع عبر واتساب",
    sendStatusWhatsApp: "إرسال تحديث الحالة عبر واتساب",
    sendPickupWhatsApp: "إرسال إشعار جاهزية الاستلام عبر واتساب",
    sendCompletionWhatsApp: "إرسال رسالة إتمام الإصلاح عبر واتساب",
    emailTitle: "البريد الإلكتروني",
    sendTrackingEmail: "إرسال تفاصيل التتبع",
    sendStatusEmail: "إرسال تحديث الحالة",
    sendPickupEmail: "إرسال إشعار الاستلام",
    sendCompletionEmail: "إرسال إشعار إتمام الإصلاح",
    actionsTitle: "الإجراءات",
    editVehicle: "تعديل بيانات المركبة",
    deleteVehicle: "حذف المركبة",

    // 20. WORK PROGRESS LOG
    progressLogDesc: "يتم تسجيل كل إجراء مهم على المركبة مع تاريخه ووقته.",
    logVehicleReceived: "تم استلام المركبة في الورشة.",
    logDiagnosisStarted: "بدأ تشخيص المركبة.",
    logDiagnosisCompleted: "تم الانتهاء من تشخيص المركبة.",
    logRepairStarted: "بدأت أعمال الإصلاح.",
    logPartsRequested: "تم طلب قطع الغيار المطلوبة.",
    logPartsReceived: "تم استلام قطع الغيار المطلوبة.",
    logRepairCompleted: "تم الانتهاء من أعمال الإصلاح.",
    logVehicleReady: "المركبة جاهزة لاستلام العميل.",

    // 21. COSTS
    repairCostsTitle: "تكاليف الإصلاح",
    partsHeading: "قطع الغيار",
    partsInstruction: "أضف قطع الغيار وتكاليفها.",
    laborHeading: "العمالة",
    laborInstruction: "سجّل تكاليف العمالة.",
    additionalCostsHeading: "تكاليف إضافية",
    additionalCostsInstruction: "سجّل التكاليف الإضافية المعتمدة.",
    totalCostDesc: "يتم حسابه تلقائياً من التكاليف المسجلة.",
    costNotDetermined: "لم يتم تحديد تكلفة الإصلاح بعد.",
    financialSummary: "الملخص المالي",
    paidAmount: "المدفوع",
    remainingAmount: "المتبقي",
    addPayment: "إضافة دفعة مالية",
    paymentAmount: "مبلغ الدفعة",
    paymentMethod: "طريقة الدفع",
    paymentReference: "رقم المرجع / الإيصال",
    recordPaymentBtn: "تسجيل الدفع",
    cash: "نقداً",
    card: "بطاقة / مدى",
    bankTransfer: "تحويل بنكي",
    saveCostsBtn: "حفظ التكاليف",

    // 22. REPORTS
    reports: "التقارير",
    reportsDesc: "عرض نشاط الورشة وسجلات الإصلاح.",
    repVehicleIntake: "تقرير المركبات المستلمة",
    repActiveRepairs: "الإصلاحات النشطة",
    repCompletedRepairs: "الإصلاحات المكتملة",
    repAwaitingParts: "المركبات بانتظار قطع الغيار",
    repReadyForPickup: "المركبات الجاهزة للاستلام",
    repRepairCosts: "تكاليف الإصلاح",
    repCustomerComms: "سجل التواصل مع العملاء",
    repWorkProgress: "سجل تقدم العمل",
    exportReportBtn: "اصدار التقرير",
    printReportBtn: "طباعة التقرير",

    // 23. SETTINGS
    settings: "إعدادات الورشة",
    workshopInfoTitle: "معلومات الورشة",
    workshopNameLabel: "اسم الورشة",
    workshopNameVal: "المبرمج",
    workshopPhoneLabel: "رقم الهاتف",
    workshopPhoneVal: "+966 55 885 2934",
    workshopLocationLabel: "الموقع",
    workshopLocationVal: "المحالة، أبها، المملكة العربية السعودية",
    languageSettingsTitle: "اللغة",
    defaultLanguageLabel: "اللغة الافتراضية",
    defaultLanguageVal: "العربية",
    availableLanguagesLabel: "اللغات المتاحة",
    availableLanguagesVal: "العربية، English",
    notificationsSettingsTitle: "الإشعارات",
    whatsAppNotifLabel: "واتساب",
    whatsAppNotifVal: "إرسال يدوي",
    emailNotifLabel: "البريد الإلكتروني",
    emailNotifVal: "إرسال يدوي",
    saveSettingsBtn: "حفظ الإعدادات",

    // 30. POP-UP / SYSTEM MESSAGES
    msgVehicleRegistered: "تم تسجيل المركبة بنجاح.",
    msgVehicleUpdated: "تم تحديث بيانات المركبة بنجاح.",
    msgVehicleDeleted: "تم حذف المركبة بنجاح.",
    msgStatusUpdated: "تم تحديث الحالة بنجاح.",
    msgProgressNoteAdded: "تمت إضافة ملاحظة تقدم العمل بنجاح.",
    msgWhatsAppPrepared: "تم تجهيز رسالة واتساب بنجاح.",
    msgEmailSent: "تم إرسال البريد الإلكتروني بنجاح.",
    msgEmailFailed: "تعذر إرسال البريد الإلكتروني.",
    msgVehicleNotFound: "لم يتم العثور على المركبة.",
    msgTrackingOrPhoneIncorrect: "رمز التتبع أو رقم الجوال غير صحيح.",
    msgEnterTrackingCode: "يرجى إدخال رمز التتبع.",
    msgEnterMobileNumber: "يرجى إدخال رقم الجوال.",
    msgEnterAllRequiredFields: "يرجى إدخال جميع الحقول المطلوبة.",
    msgDeleteConfirm: "هل أنت متأكد من رغبتك في حذف هذه المركبة؟",
    msgEmailVerified: "تم تأكيد بريدك الإلكتروني.",
    msgPasswordResetSent: "تم إرسال رسالة إعادة تعيين كلمة المرور.",

    // Modals & Controls
    cancel: "إلغاء",
    confirm: "تأكيد",
    save: "حفظ",
    selectVehicle: "-- اختر مركبة --",
    currency: "ر.س",
    whatsAppConfirmTitle: "تأكيد الإرسال اليدوي",
    whatsAppConfirmMsg: "هل أرسلت الرسالة بالفعل إلى العميل عبر واتساب؟",
    confirmMarkSent: "نعم، تم الإرسال",
    whatsAppOpenedStatus: "تم فتح واتساب. راجع الرسالة واضغط إرسال من داخل واتساب.",
    openAgain: "فتح واتساب مجدداً",
    sent: "تم الإرسال",
    notSent: "لم يتم الإرسال",
    sentOn: "تم الإرسال بتاريخ",
    by: "بواسطة",
    staff: "الموظف",
    na: "غير متوفر",
    printJobSheet: "أمر إصلاح المركبة"
  },
  en: {
    // 1. BRANDING
    title: "AL Mubarmaja",
    subBrand: "Professional Vehicle Maintenance, Diagnosis & Repair",
    tagline: "Care Behind Every Repair.",
    langToggle: "العربية",

    // 2. NAVIGATION
    home: "Home",
    ourServicesNav: "Our Services",
    trackVehicleNav: "Track Your Vehicle",
    aboutUsNav: "About Us",
    contactUsNav: "Contact Us",
    employeeLoginNav: "Employee Login",
    logout: "Logout",

    // 15. DASHBOARD
    dashboard: "Dashboard",
    dashboardDesc: "Manage your workshop operations from one place.",
    overview: "Overview",
    totalVehicles: "Total Vehicles",
    totalVehiclesDesc: "All vehicles currently registered.",
    activeJobs: "Active Jobs",
    activeJobsDesc: "Vehicles currently being processed.",
    awaitingDiagnosis: "Awaiting Diagnosis",
    awaitingDiagnosisDesc: "Vehicles waiting for diagnosis.",
    awaitingParts: "Awaiting Parts",
    awaitingPartsDesc: "Vehicles waiting for required parts.",
    readyForPickup: "Ready for Pickup",
    readyForPickupDesc: "Vehicles ready for customer collection.",
    completed: "Completed",
    completedDesc: "Completed vehicle repairs.",
    outstandingCosts: "Outstanding Costs",
    outstandingCostsDesc: "Current unpaid or unfinished repair costs.",

    // 16. VEHICLES
    vehicles: "Vehicles",
    vehiclesDesc: "View and manage all vehicles currently registered at the workshop.",
    searchPlaceholder: "Search by registration number, owner name, make, model, VIN, or tracking code.",
    newVehicleIntake: "New Vehicle Intake",
    all: "All",
    noRecords: "No records matching your search.",
    adjustFilters: "Please adjust filters or search terms.",

    // 17. NEW VEHICLE INTAKE
    vehicleDetailsSection: "Vehicle Details",
    make: "Make",
    model: "Model",
    year: "Year",
    plateNumber: "Registration Number",
    vin: "VIN / Chassis Number",
    customerDetailsSection: "Customer Details",
    customerName: "Customer Name",
    mobileNumber: "Mobile Number",
    emailAddress: "Email Address",
    vehicleArrivalSection: "Vehicle Arrival",
    dateReceived: "Date Received",
    reportedComplaints: "Reported Complaints",
    complaintsInstruction: "Add the issues reported by the customer.",
    addComplaintBtn: "+ Add Complaint",
    costNoticeTitle: "Cost",
    costNoticeDesc: "The repair cost may not be known when the vehicle is first received.",
    partsCostLabel: "Parts Cost",
    partsCostNotDetermined: "Not determined",
    laborCostLabel: "Labor Cost",
    laborCostNotDetermined: "Not determined",
    estimatedTotalLabel: "Estimated Total",
    estimatedTotalPending: "Pending diagnosis",
    costUpdateAfterDiag: "Costs can be added or updated after diagnosis.",
    initialStatusLabel: "Initial Status",
    registerVehicleBtn: "Register Vehicle",

    // 18. VEHICLE DETAILS
    vehicleDetailsTitle: "Vehicle Details",
    trackingCodeTitle: "Tracking Code",
    currentStatusTitle: "Current Status",
    costsTitle: "Costs",
    totalCostLabel: "Total Cost",
    workProgressTitle: "Work Progress",
    workProgressLogTitle: "Work Progress Log",
    addProgressNoteBtn: "Add Progress Note",
    customerCommunicationTitle: "Customer Communication",
    sendTrackingWhatsApp: "Send Tracking Details via WhatsApp",
    sendStatusWhatsApp: "Send Status Update via WhatsApp",
    sendPickupWhatsApp: "Send Ready for Pickup via WhatsApp",
    sendCompletionWhatsApp: "Send Completion Message via WhatsApp",
    emailTitle: "Email",
    sendTrackingEmail: "Send Tracking Details",
    sendStatusEmail: "Send Status Update",
    sendPickupEmail: "Send Pickup Notification",
    sendCompletionEmail: "Send Completion Notification",
    actionsTitle: "Actions",
    editVehicle: "Edit Vehicle",
    deleteVehicle: "Delete Vehicle",

    // 20. WORK PROGRESS LOG
    progressLogDesc: "Every important action on the vehicle is recorded with its date and time.",
    logVehicleReceived: "Vehicle received at the workshop.",
    logDiagnosisStarted: "Vehicle diagnosis started.",
    logDiagnosisCompleted: "Vehicle diagnosis completed.",
    logRepairStarted: "Repair work started.",
    logPartsRequested: "Required parts requested.",
    logPartsReceived: "Required parts received.",
    logRepairCompleted: "Repair work completed.",
    logVehicleReady: "Vehicle is ready for customer collection.",

    // 21. COSTS
    repairCostsTitle: "Repair Costs",
    partsHeading: "Parts",
    partsInstruction: "Add parts and their costs.",
    laborHeading: "Labor",
    laborInstruction: "Record labor charges.",
    additionalCostsHeading: "Additional Costs",
    additionalCostsInstruction: "Record approved additional charges.",
    totalCostDesc: "Automatically calculated from the recorded costs.",
    costNotDetermined: "The repair cost has not yet been determined.",
    financialSummary: "Financial Summary",
    paidAmount: "Paid",
    remainingAmount: "Remaining",
    addPayment: "Add Payment",
    paymentAmount: "Payment Amount",
    paymentMethod: "Payment Method",
    paymentReference: "Reference / Receipt No",
    recordPaymentBtn: "Record Payment",
    cash: "Cash",
    card: "Card",
    bankTransfer: "Bank Transfer",
    saveCostsBtn: "Save Costs",

    // 22. REPORTS
    reports: "Reports",
    reportsDesc: "View workshop activity and repair records.",
    repVehicleIntake: "Vehicle Intake Report",
    repActiveRepairs: "Active Repairs",
    repCompletedRepairs: "Completed Repairs",
    repAwaitingParts: "Awaiting Parts",
    repReadyForPickup: "Ready for Pickup",
    repRepairCosts: "Repair Costs",
    repCustomerComms: "Customer Communication History",
    repWorkProgress: "Work Progress History",
    exportReportBtn: "Export Report",
    printReportBtn: "Print Report",

    // 23. SETTINGS
    settings: "Workshop Settings",
    workshopInfoTitle: "Workshop Information",
    workshopNameLabel: "Workshop Name",
    workshopNameVal: "AL Mubarmaja",
    workshopPhoneLabel: "Phone",
    workshopPhoneVal: "+966 55 885 2934",
    workshopLocationLabel: "Location",
    workshopLocationVal: "Almahalah, Abha, Saudi Arabia",
    languageSettingsTitle: "Language",
    defaultLanguageLabel: "Default Language",
    defaultLanguageVal: "Arabic",
    availableLanguagesLabel: "Available Languages",
    availableLanguagesVal: "Arabic, English",
    notificationsSettingsTitle: "Notifications",
    whatsAppNotifLabel: "WhatsApp",
    whatsAppNotifVal: "Manual sending",
    emailNotifLabel: "Email",
    emailNotifVal: "Manual sending",
    saveSettingsBtn: "Save Settings",

    // 30. POP-UP / SYSTEM MESSAGES
    msgVehicleRegistered: "Vehicle registered successfully.",
    msgVehicleUpdated: "Vehicle updated successfully.",
    msgVehicleDeleted: "Vehicle deleted successfully.",
    msgStatusUpdated: "Status updated successfully.",
    msgProgressNoteAdded: "Progress note added successfully.",
    msgWhatsAppPrepared: "WhatsApp message prepared successfully.",
    msgEmailSent: "Email sent successfully.",
    msgEmailFailed: "Email could not be sent.",
    msgVehicleNotFound: "Vehicle not found.",
    msgTrackingOrPhoneIncorrect: "The tracking code or mobile number is incorrect.",
    msgEnterTrackingCode: "Please enter your tracking code.",
    msgEnterMobileNumber: "Please enter your mobile number.",
    msgEnterAllRequiredFields: "Please enter all required fields.",
    msgDeleteConfirm: "Are you sure you want to delete this vehicle?",
    msgEmailVerified: "Your email has been verified.",
    msgPasswordResetSent: "Password reset email sent.",

    // Modals & Controls
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    selectVehicle: "-- Select Vehicle --",
    currency: "SAR",
    whatsAppConfirmTitle: "Confirm Manual Send",
    whatsAppConfirmMsg: "Have you manually sent this message to the customer inside WhatsApp?",
    confirmMarkSent: "Yes, Mark as Sent",
    whatsAppOpenedStatus: "WhatsApp is open. Review the message and press Send inside WhatsApp.",
    openAgain: "Open WhatsApp Again",
    sent: "Sent",
    notSent: "Not Sent",
    sentOn: "Sent on",
    by: "by",
    staff: "Staff",
    na: "N/A",
    printJobSheet: "Vehicle Repair Order"
  }
};

// --- WHATSAPP MESSAGE FORMATTERS (SECTIONS 24, 25, 26, 27) ---
function buildWhatsAppMessage(type: 'TRACKING_DETAILS' | 'STATUS_UPDATE' | 'READY_FOR_PICKUP' | 'REPAIR_COMPLETED', vehicle: any, lang: 'ar' | 'en', extraNote?: string): string {
  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track` : 'http://localhost:3000/track';
  const trackingLink = `${trackingUrl}?code=${vehicle.trackingCode}&phone=${encodeURIComponent(vehicle.ownerPhone || '')}`;

  if (lang === 'ar') {
    switch (type) {
      // 24. WHATSAPP — VEHICLE REGISTERED
      case 'TRACKING_DETAILS':
        return `مرحباً ${vehicle.ownerName || 'العميل'}،\n\n` +
          `تم تسجيل مركبتك لدى ورشة المبرمج.\n\n` +
          `المركبة: ${vehicle.make} ${vehicle.model}\n` +
          `رقم اللوحة: ${vehicle.plateNumber}\n\n` +
          `رمز التتبع الخاص بك:\n\n` +
          `${vehicle.trackingCode}\n\n` +
          `يمكنك متابعة حالة إصلاح مركبتك من خلال الرابط:\n\n` +
          `${trackingLink}\n\n` +
          `يرجى الاحتفاظ برمز التتبع لاستخدامه في المتابعة لاحقاً.\n\n` +
          `شكراً لك،\n` +
          `المبرمج`;

      // 25. WHATSAPP — STATUS UPDATE
      case 'STATUS_UPDATE':
        return `مرحباً ${vehicle.ownerName || 'العميل'}،\n\n` +
          `إليك تحديثاً بشأن مركبتك.\n\n` +
          `المركبة: ${vehicle.make} ${vehicle.model}\n` +
          `رقم اللوحة: ${vehicle.plateNumber}\n` +
          `رمز التتبع: ${vehicle.trackingCode}\n\n` +
          `الحالة الحالية: ${STATUS_LABELS.ar[vehicle.status] || vehicle.status}\n\n` +
          `آخر تحديث:\n` +
          `${extraNote || 'تم تحديث حالة العمل على المركبة.'}\n\n` +
          `يمكنك متابعة حالة مركبتك من خلال الرابط:\n\n` +
          `${trackingLink}\n\n` +
          `شكراً لك،\n` +
          `المبرمج`;

      // 26. WHATSAPP — READY FOR PICKUP
      case 'READY_FOR_PICKUP':
        return `مرحباً ${vehicle.ownerName || 'العميل'}،\n\n` +
          `مركبتك الآن جاهزة للاستلام.\n\n` +
          `المركبة: ${vehicle.make} ${vehicle.model}\n` +
          `رقم اللوحة: ${vehicle.plateNumber}\n` +
          `رمز التتبع: ${vehicle.trackingCode}\n\n` +
          `يرجى التواصل مع ورشة المبرمج لمعرفة تفاصيل الاستلام.\n\n` +
          `شكراً لك،\n` +
          `المبرمج`;

      // 27. WHATSAPP — REPAIR COMPLETED
      case 'REPAIR_COMPLETED':
        return `مرحباً ${vehicle.ownerName || 'العميل'}،\n\n` +
          `تم الانتهاء من أعمال إصلاح مركبتك.\n\n` +
          `المركبة: ${vehicle.make} ${vehicle.model}\n` +
          `رقم اللوحة: ${vehicle.plateNumber}\n` +
          `رمز التتبع: ${vehicle.trackingCode}\n\n` +
          `مركبتك جاهزة للاستلام.\n\n` +
          `شكراً لاختيارك ورشة المبرمج.`;
    }
  } else {
    switch (type) {
      // 24. WHATSAPP — VEHICLE REGISTERED
      case 'TRACKING_DETAILS':
        return `Hello ${vehicle.ownerName || 'Customer'},\n\n` +
          `Your vehicle has been registered at AL Mubarmaja.\n\n` +
          `Vehicle: ${vehicle.make} ${vehicle.model}\n` +
          `Registration: ${vehicle.plateNumber}\n\n` +
          `Your tracking code is:\n\n` +
          `${vehicle.trackingCode}\n\n` +
          `You can check your vehicle's repair progress here:\n\n` +
          `${trackingLink}\n\n` +
          `Please keep your tracking code for future updates.\n\n` +
          `Thank you,\n` +
          `AL Mubarmaja`;

      // 25. WHATSAPP — STATUS UPDATE
      case 'STATUS_UPDATE':
        return `Hello ${vehicle.ownerName || 'Customer'},\n\n` +
          `Here is an update regarding your vehicle.\n\n` +
          `Vehicle: ${vehicle.make} ${vehicle.model}\n` +
          `Registration: ${vehicle.plateNumber}\n` +
          `Tracking Code: ${vehicle.trackingCode}\n\n` +
          `Current Status: ${STATUS_LABELS.en[vehicle.status] || vehicle.status}\n\n` +
          `Latest Update:\n` +
          `${extraNote || 'Work progress recorded.'}\n\n` +
          `You can continue to follow your vehicle here:\n\n` +
          `${trackingLink}\n\n` +
          `Thank you,\n` +
          `AL Mubarmaja`;

      // 26. WHATSAPP — READY FOR PICKUP
      case 'READY_FOR_PICKUP':
        return `Hello ${vehicle.ownerName || 'Customer'},\n\n` +
          `Your vehicle is now ready for pickup.\n\n` +
          `Vehicle: ${vehicle.make} ${vehicle.model}\n` +
          `Registration: ${vehicle.plateNumber}\n` +
          `Tracking Code: ${vehicle.trackingCode}\n\n` +
          `Please contact AL Mubarmaja for pickup details.\n\n` +
          `Thank you,\n` +
          `AL Mubarmaja`;

      // 27. WHATSAPP — REPAIR COMPLETED
      case 'REPAIR_COMPLETED':
        return `Hello ${vehicle.ownerName || 'Customer'},\n\n` +
          `The repair work on your vehicle has been completed.\n\n` +
          `Vehicle: ${vehicle.make} ${vehicle.model}\n` +
          `Registration: ${vehicle.plateNumber}\n` +
          `Tracking Code: ${vehicle.trackingCode}\n\n` +
          `Your vehicle is ready for collection.\n\n` +
          `Thank you for choosing AL Mubarmaja.`;
    }
  }
}

export default function DashboardPage() {
  const { 
    vehicles, isLoaded, addVehicle, updateVehicle, updateVehicleStatus, 
    deleteVehicle, addProgressNote, addPhoto, addAdditionalRepair, 
    createEstimate, updateFinalCost, addPayment, resendTrackingMessage, 
    regenerateTrackingCode, resendCompletionMessage, markWhatsappAsSent 
  } = useVehicles();
  
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'intake' | 'costs' | 'logs' | 'reports' | 'settings'>('dashboard');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterCategory | 'All'>('All');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formVehicle, setFormVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const t = dict[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
  }, [lang]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(current => current?.message === message ? null : current);
    }, 4500);
  };

  const currentUser = React.useMemo(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/login');
  };

  // 15. DASHBOARD STATS
  const stats = useMemo(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => ACTIVE_STATUSES.includes(v.status)).length;
    const awaitingDiag = vehicles.filter(v => v.status === 'AWAITING_DIAGNOSIS').length;
    const awaitingParts = vehicles.filter(v => v.status === 'AWAITING_PARTS').length;
    const readyForPickup = vehicles.filter(v => v.status === 'READY_FOR_PICKUP').length;
    const completed = vehicles.filter(v => v.status === 'COMPLETED').length;
    
    let outstandingCosts = 0;

    vehicles.forEach(v => {
      const payments = v.payments || [];
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      if (v.finalTotalCost !== null && v.finalTotalCost !== undefined) {
        outstandingCosts += Math.max(0, v.finalTotalCost - totalPaid);
      } else if (v.estimates && v.estimates.length > 0) {
        outstandingCosts += Math.max(0, v.estimates[0].total - totalPaid);
      }
    });

    return { total, active, awaitingDiag, awaitingParts, readyForPickup, completed, outstandingCosts };
  }, [vehicles]);

  // 16. VEHICLES SEARCH & FILTERS
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchesSearch = 
        (v.plateNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.ownerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.make?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.model?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.vin?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.trackingCode?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || FILTER_MAP[statusFilter].includes(v.status);
      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchQuery, statusFilter]);

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'vehicles', label: t.vehicles, icon: Car },
    { id: 'intake', label: t.newVehicleIntake, icon: ClipboardList },
    { id: 'costs', label: t.repairCostsTitle, icon: Wallet },
    { id: 'logs', label: t.workProgressLogTitle, icon: History },
    { id: 'reports', label: t.reports, icon: BarChart3 },
    { id: 'settings', label: t.settings, icon: Settings },
  ] as const;

  if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-mono text-xs tracking-widest uppercase">Loading...</div>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="print:hidden border-b border-border bg-white sticky top-0 z-30 h-[85px] flex items-center shadow-sm">
        <div className="px-8 py-2 w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt={t.title} className="h-[45px] md:h-[54px] w-auto object-contain group-hover:opacity-80 transition-opacity" />
              <div className="hidden lg:flex flex-col">
                <span className="font-display font-bold text-base text-foreground leading-tight">{t.title}</span>
                <span className="text-[10px] text-secondary font-medium">{t.subBrand}</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 border border-border bg-white rounded text-xs font-mono text-secondary hover:text-foreground transition-colors"
            >
              {t.langToggle}
            </button>

            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 border border-border bg-surface-50 rounded-lg">
                <User size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">{currentUser.name}</span>
              </div>
            )}

            <button 
              onClick={() => { setFormVehicle(null); setIsFormOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> {t.newVehicleIntake}
            </button>

            <button
              onClick={handleLogout}
              title={t.logout}
              className="flex items-center gap-2 px-3 py-2 border border-border text-secondary hover:text-foreground hover:bg-surface-50 rounded-lg transition-colors text-xs font-semibold"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`w-64 border-border bg-white flex flex-col justify-between shrink-0 ${lang === 'ar' ? 'border-l' : 'border-r'}`}>
          <nav className="p-4 flex flex-col gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                    isSelected ? 'bg-primary/10 text-primary border border-primary/20 font-bold' : 'text-secondary hover:text-primary hover:bg-surface-50 border border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border text-[10px] text-muted text-center font-mono">
            {t.title} © 2026
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-8">
          
          {/* TAB 1: 15. DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.dashboard}</h1>
                <p className="text-secondary text-xs">{t.dashboardDesc}</p>
              </div>

              {/* 15. OVERVIEW STATS NODES */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <OverviewStatCard title={t.totalVehicles} desc={t.totalVehiclesDesc} value={stats.total} />
                <OverviewStatCard title={t.activeJobs} desc={t.activeJobsDesc} value={stats.active} color="text-primary" />
                <OverviewStatCard title={t.awaitingDiagnosis} desc={t.awaitingDiagnosisDesc} value={stats.awaitingDiag} />
                <OverviewStatCard title={t.awaitingParts} desc={t.awaitingPartsDesc} value={stats.awaitingParts} color="text-amber-600" />
                <OverviewStatCard title={t.readyForPickup} desc={t.readyForPickupDesc} value={stats.readyForPickup} color="text-emerald-600" />
                <OverviewStatCard title={t.completed} desc={t.completedDesc} value={stats.completed} color="text-green-700" />
                <OverviewStatCard title={t.outstandingCosts} desc={t.outstandingCostsDesc} value={`${stats.outstandingCosts.toLocaleString()} ${t.currency}`} color="text-primary" />
              </div>

              {/* Quick views */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Jobs list */}
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">{t.activeJobs}</h3>
                    <span className="text-xs text-secondary">{stats.active} {t.vehicles}</span>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {vehicles.filter(v => ACTIVE_STATUSES.includes(v.status)).slice(0, 6).map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => setSelectedVehicle(v)} 
                        className="p-4 bg-surface-50 border border-border hover:border-primary/40 cursor-pointer rounded-xl flex justify-between items-center transition-all"
                      >
                        <div>
                          <div className="text-sm font-bold text-foreground">{v.make} {v.model} ({v.year})</div>
                          <div className="text-xs font-mono text-secondary mt-0.5 phone-number">{v.plateNumber} • {v.trackingCode}</div>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${STATUS_COLORS[v.status]}`}>
                          {STATUS_LABELS[lang][v.status] || v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Work Progress log */}
                <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border pb-3">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">{t.workProgressLogTitle}</h3>
                  </div>
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {vehicles.flatMap(v => (v.progressLogs || []).map(l => ({ ...l, vehicle: v }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8).map((log, idx) => (
                      <div key={idx} className="p-3 bg-surface-50 border border-border rounded-xl text-xs flex gap-3 items-start">
                        <History size={16} className="text-primary shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-foreground font-medium">{log.message}</p>
                          <div className="flex justify-between items-center text-[10px] text-secondary mt-1 font-mono">
                            <span>{log.vehicle?.make} {log.vehicle?.model} ({log.vehicle?.plateNumber})</span>
                            <span>{new Date(log.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 16. VEHICLES */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.vehicles}</h1>
                  <p className="text-secondary text-xs">{t.vehiclesDesc}</p>
                </div>
                <button 
                  onClick={() => { setFormVehicle(null); setIsFormOpen(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors shadow-sm self-start sm:self-auto"
                >
                  <Plus size={16} /> {t.newVehicleIntake}
                </button>
              </div>

              {/* Search & Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-secondary w-4 h-4`} />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder} 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-white border border-border py-3 rounded-xl ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-xs focus:outline-none focus:border-primary transition-colors text-foreground`}
                  />
                </div>

                <div className="flex flex-nowrap overflow-x-auto border border-border bg-white rounded-xl p-1 gap-1">
                  {(['All', 'AWAITING_DIAGNOSIS', 'IN_PROGRESS', 'AWAITING_PARTS', 'READY_FOR_PICKUP', 'COMPLETED'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider whitespace-nowrap rounded-lg transition-colors ${
                        statusFilter === s ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary hover:bg-surface-50'
                      }`}
                    >
                      {STATUS_LABELS[lang][s] ?? t.all}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVehicles.length === 0 ? (
                  <div className="col-span-full py-20 text-center flex flex-col items-center justify-center border border-border bg-white rounded-2xl shadow-sm">
                    <div className="text-secondary font-bold text-sm uppercase mb-1">{t.noRecords}</div>
                    <div className="text-muted text-xs">{t.adjustFilters}</div>
                  </div>
                ) : (
                  filteredVehicles.map(v => (
                    <VehicleCardItem key={v.id} vehicle={v} lang={lang} t={t} onClick={() => setSelectedVehicle(v)} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 17. NEW VEHICLE INTAKE */}
          {activeTab === 'intake' && (
            <div className="max-w-3xl mx-auto bg-white border border-border p-8 md:p-10 rounded-2xl shadow-xl space-y-6">
              <div className="border-b border-border pb-4">
                <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.newVehicleIntake}</h1>
                <p className="text-secondary text-xs">{t.costNoticeDesc}</p>
              </div>

              <VehicleIntakeForm 
                onSave={async (data: any) => {
                  try {
                    const res = await addVehicle(data);
                    if (res) {
                      showToast(t.msgVehicleRegistered, 'success');
                      setActiveTab('vehicles');
                    }
                  } catch (err: any) {
                    showToast(err?.message || t.msgEnterAllRequiredFields, 'error');
                  }
                }}
                showToast={showToast}
                t={t}
                lang={lang}
              />
            </div>
          )}

          {/* TAB 4: 21. COSTS */}
          {activeTab === 'costs' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.repairCostsTitle}</h1>
                <p className="text-secondary text-xs">{t.totalCostDesc}</p>
              </div>
              <CostsManager vehicles={vehicles} updateFinalCost={updateFinalCost} addPayment={addPayment} t={t} lang={lang} showToast={showToast} />
            </div>
          )}

          {/* TAB 5: 20. WORK PROGRESS LOG */}
          {activeTab === 'logs' && (
            <div className="max-w-5xl mx-auto bg-white border border-border p-8 rounded-2xl shadow-xl space-y-6">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.workProgressLogTitle}</h1>
                <p className="text-secondary text-xs">{t.progressLogDesc}</p>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {vehicles.flatMap(v => (v.progressLogs || []).map(l => ({ ...l, vehicle: v }))).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((log, idx) => (
                  <div key={idx} className="p-4 bg-surface-50 border border-border rounded-xl flex items-start gap-4">
                    <History size={18} className="text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{log.message}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-secondary font-mono">
                        <span>{log.vehicle?.make} {log.vehicle?.model} ({log.vehicle?.plateNumber})</span>
                        <span>{new Date(log.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: 22. REPORTS */}
          {activeTab === 'reports' && (
            <div className="max-w-5xl mx-auto bg-white border border-border p-8 rounded-2xl shadow-xl space-y-8">
              <div className="flex justify-between items-center border-b border-border pb-4">
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.reports}</h1>
                  <p className="text-secondary text-xs">{t.reportsDesc}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors flex items-center gap-2">
                    <Printer size={14} /> {t.printReportBtn}
                  </button>
                </div>
              </div>

              {/* 22. REPORTS LIST CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCardWidget title={t.repVehicleIntake} count={vehicles.length} />
                <ReportCardWidget title={t.repActiveRepairs} count={stats.active} highlight />
                <ReportCardWidget title={t.repCompletedRepairs} count={stats.completed} />
                <ReportCardWidget title={t.repAwaitingParts} count={stats.awaitingParts} />
                <ReportCardWidget title={t.repReadyForPickup} count={stats.readyForPickup} />
                <ReportCardWidget title={t.repRepairCosts} count={`${stats.outstandingCosts.toLocaleString()} ${t.currency}`} />
              </div>
            </div>
          )}

          {/* TAB 7: 23. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-3xl mx-auto bg-white border border-border p-8 rounded-2xl shadow-xl space-y-8">
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground mb-1">{t.settings}</h1>
              </div>

              {/* 23. WORKSHOP INFORMATION */}
              <div className="space-y-4 border-b border-border pb-6">
                <h3 className="text-base font-bold text-foreground">{t.workshopInfoTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-surface-50 border border-border rounded-xl">
                    <span className="text-secondary block mb-1">{t.workshopNameLabel}</span>
                    <span className="text-sm font-bold text-foreground">{t.workshopNameVal}</span>
                  </div>
                  <div className="p-4 bg-surface-50 border border-border rounded-xl">
                    <span className="text-secondary block mb-1">{t.workshopPhoneLabel}</span>
                    <span className="text-sm font-bold text-foreground phone-number">{t.workshopPhoneVal}</span>
                  </div>
                  <div className="p-4 bg-surface-50 border border-border rounded-xl col-span-full">
                    <span className="text-secondary block mb-1">{t.workshopLocationLabel}</span>
                    <span className="text-sm font-bold text-foreground">{t.workshopLocationVal}</span>
                  </div>
                </div>
              </div>

              {/* 23. LANGUAGE SETTINGS */}
              <div className="space-y-4 border-b border-border pb-6">
                <h3 className="text-base font-bold text-foreground">{t.languageSettingsTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-surface-50 border border-border rounded-xl">
                    <span className="text-secondary block mb-1">{t.defaultLanguageLabel}</span>
                    <span className="text-sm font-bold text-foreground">{t.defaultLanguageVal}</span>
                  </div>
                  <div className="p-4 bg-surface-50 border border-border rounded-xl">
                    <span className="text-secondary block mb-1">{t.availableLanguagesLabel}</span>
                    <span className="text-sm font-bold text-foreground">{t.availableLanguagesVal}</span>
                  </div>
                </div>
              </div>

              {/* 23. NOTIFICATIONS SETTINGS */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foreground">{t.notificationsSettingsTitle}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-surface-50 border border-border rounded-xl">
                    <span className="text-secondary block mb-1">{t.whatsAppNotifLabel}</span>
                    <span className="text-sm font-bold text-foreground">{t.whatsAppNotifVal}</span>
                  </div>
                  <div className="p-4 bg-surface-50 border border-border rounded-xl">
                    <span className="text-secondary block mb-1">{t.emailNotifLabel}</span>
                    <span className="text-sm font-bold text-foreground">{t.emailNotifVal}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 18. VEHICLE DETAILS MODAL */}
      <AnimatePresence>
        {selectedVehicle && (
          <VehicleDetailModal
            vehicle={vehicles.find(v => v.id === selectedVehicle.id) || selectedVehicle}
            onClose={() => setSelectedVehicle(null)}
            onEdit={() => { setFormVehicle(selectedVehicle); setIsFormOpen(true); setSelectedVehicle(null); }}
            onDelete={() => {
              if (confirm(t.msgDeleteConfirm)) {
                deleteVehicle(selectedVehicle.id);
                setSelectedVehicle(null);
                showToast(t.msgVehicleDeleted, 'success');
              }
            }}
            onUpdate={updateVehicle}
            onUpdateStatus={(id: string, status: string) => updateVehicleStatus(id, status, lang)}
            onAddNote={addProgressNote}
            onAddPhoto={addPhoto}
            onAddRepair={addAdditionalRepair}
            onCreateEstimate={createEstimate}
            onUpdateFinalCost={updateFinalCost}
            markWhatsappAsSent={markWhatsappAsSent}
            showToast={showToast}
            setConfirmModal={setConfirmModal}
            lang={lang}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* 17. NEW VEHICLE INTAKE MODAL */}
      <AnimatePresence>
        {isFormOpen && (
          <VehicleFormModal 
            vehicle={formVehicle}
            onClose={() => setIsFormOpen(false)} 
            onSave={async (data: any) => {
              if (formVehicle) {
                await updateVehicle(formVehicle.id, data);
                showToast(t.msgVehicleUpdated, 'success');
                return true;
              } else {
                const created = await addVehicle(data);
                showToast(t.msgVehicleRegistered, 'success');
                return created;
              }
            }} 
            markWhatsappAsSent={markWhatsappAsSent}
            showToast={showToast}
            setConfirmModal={setConfirmModal}
            lang={lang}
            t={t}
          />
        )}
      </AnimatePresence>

      {/* Floating Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-6 ${lang === 'ar' ? 'left-6' : 'right-6'} z-[100] p-4 shadow-2xl flex items-center gap-3 font-mono text-xs max-w-sm rounded-xl border ${
              toast.type === 'success' 
                ? 'bg-[#EAF6EC] text-[#256329] border-[#B9DDBD]' 
                : toast.type === 'warning' 
                ? 'bg-[#F4F8EF] text-[#3D5A0E] border-[#C5DBAA]' 
                : 'bg-[#FDECEC] text-[#A52222] border-[#E7B5B5]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-[#256329]' : toast.type === 'warning' ? 'bg-[#3D5A0E]' : 'bg-[#A52222]'}`} />
            <span className="flex-1 leading-relaxed font-bold">{toast.message}</span>
            <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100"><X size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal?.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4 text-start rounded-2xl"
            >
              <h3 className="font-bold text-base uppercase tracking-wider text-foreground">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-secondary leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-2.5 bg-surface-50 hover:bg-surface-100 border border-border text-secondary text-xs uppercase font-bold rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button 
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 py-2.5 bg-primary hover:bg-brand-hover text-white font-bold text-xs uppercase rounded-lg transition-colors"
                >
                  {t.confirm}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function OverviewStatCard({ title, desc, value, color = "text-foreground" }: any) {
  return (
    <div className="p-5 bg-white border border-border rounded-2xl shadow-sm flex flex-col justify-between">
      <div>
        <span className="text-[11px] font-bold text-secondary uppercase block mb-1">{title}</span>
        <span className={`text-2xl font-bold ${color} block`}>{value}</span>
      </div>
      <p className="text-[10px] text-muted mt-3 leading-tight">{desc}</p>
    </div>
  );
}

function ReportCardWidget({ title, count, highlight = false }: any) {
  return (
    <div className={`p-6 border rounded-2xl shadow-sm ${highlight ? 'bg-primary/5 border-primary/30' : 'bg-surface-50 border-border'}`}>
      <h4 className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{title}</h4>
      <div className="text-3xl font-bold text-foreground mb-4">{count}</div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-primary font-bold">{dict.ar.repWorkProgress}</span>
        <CheckCircle size={16} className="text-primary" />
      </div>
    </div>
  );
}

function VehicleCardItem({ vehicle, lang, t, onClick }: { vehicle: Vehicle, lang: string, t: any, onClick: () => void }) {
  const complaints = vehicle.complaints || [];

  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`bg-white border border-border ${lang === 'ar' ? 'border-r-4' : 'border-l-4'} ${BORDER_COLORS[vehicle.status]} cursor-pointer hover:border-primary/50 transition-all flex flex-col p-5 rounded-2xl shadow-sm hover:shadow-md justify-between`}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-foreground">{vehicle.make} {vehicle.model}</h3>
            <span className="text-xs font-mono text-secondary phone-number">{vehicle.plateNumber} • {vehicle.year}</span>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${STATUS_COLORS[vehicle.status]}`}>
            {STATUS_LABELS[lang as 'ar' | 'en'][vehicle.status] || vehicle.status}
          </span>
        </div>

        <div className="text-xs text-secondary space-y-1 bg-surface-50 p-3 rounded-xl">
          <div><span className="font-semibold text-foreground">{t.customerName}:</span> {vehicle.ownerName}</div>
          <div><span className="font-semibold text-foreground">{t.trackingCodeTitle}:</span> <span className="font-mono text-primary font-bold">{vehicle.trackingCode}</span></div>
        </div>

        {complaints.length > 0 && (
          <div className="text-xs text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-1">{t.reportedComplaints}</span>
            <p className="truncate text-foreground">• {complaints[0].description}</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border mt-4 flex justify-between items-center text-xs font-mono">
        <span className="text-secondary">{t.totalCostLabel}:</span>
        <span className="font-bold text-primary">
          {vehicle.finalTotalCost !== null && vehicle.finalTotalCost !== undefined ? `${vehicle.finalTotalCost.toLocaleString()} ${t.currency}` : t.partsCostNotDetermined}
        </span>
      </div>
    </motion.div>
  );
}

// 17. NEW VEHICLE INTAKE FORM
function VehicleIntakeForm({ vehicle, onSave, showToast, t, lang }: any) {
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year || '');
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber || '');
  const [vin, setVin] = useState(vehicle?.vin || '');
  const [ownerName, setOwnerName] = useState(vehicle?.ownerName || '');
  const [ownerPhone, setOwnerPhone] = useState(vehicle?.ownerPhone || '');
  const [ownerEmail, setOwnerEmail] = useState(vehicle?.email || vehicle?.ownerEmail || '');
  const [dateReceived, setDateReceived] = useState(vehicle?.dateBroughtIn || new Date().toISOString().split('T')[0]);
  
  const [complaints, setComplaints] = useState<string[]>(
    vehicle?.complaints?.map((c: any) => c.description) || ['']
  );

  const [saving, setSaving] = useState(false);

  const handleAddComplaint = () => setComplaints([...complaints, '']);
  const handleRemoveComplaint = (idx: number) => setComplaints(complaints.filter((_, i) => i !== idx));
  const handleComplaintChange = (idx: number, val: string) => {
    const list = [...complaints];
    list[idx] = val;
    setComplaints(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        make: make.trim(),
        model: model.trim(),
        year: year ? String(year).trim() : new Date().getFullYear().toString(),
        plateNumber: plateNumber.trim(),
        vin: vin.trim() || undefined,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        dateBroughtIn: dateReceived || new Date().toISOString().split('T')[0],
        status: 'AWAITING_DIAGNOSIS',
        complaints: complaints.filter(c => c.trim() !== '')
      };
      await onSave(payload);
    } catch (err: any) {
      showToast(err?.message || t.msgEnterAllRequiredFields, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 17. Vehicle Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.vehicleDetailsSection}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.make}</label>
            <input type="text" required value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.model}</label>
            <input type="text" required value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.year}</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.plateNumber}</label>
            <input type="text" required value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary phone-number" />
          </div>
          <div className="space-y-1 col-span-1 sm:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.vin}</label>
            <input type="text" value={vin} onChange={(e) => setVin(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      {/* 17. Customer Details */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.customerDetailsSection}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.customerName}</label>
            <input type="text" required value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.mobileNumber}</label>
            <input type="tel" required value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary phone-number" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono font-bold uppercase text-secondary">{t.emailAddress}</label>
            <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
          </div>
        </div>
      </div>

      {/* 17. Vehicle Arrival */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.vehicleArrivalSection}</h3>
        <div className="max-w-xs space-y-1">
          <label className="text-xs font-mono font-bold uppercase text-secondary">{t.dateReceived}</label>
          <input type="date" value={dateReceived} onChange={(e) => setDateReceived(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" />
        </div>
      </div>

      {/* 17. Reported Complaints */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.reportedComplaints}</h3>
            <p className="text-xs text-secondary">{t.complaintsInstruction}</p>
          </div>
        </div>

        <div className="space-y-2">
          {complaints.map((c, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input 
                type="text" 
                required
                value={c} 
                onChange={(e) => handleComplaintChange(idx, e.target.value)} 
                className="flex-1 bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary" 
              />
              {complaints.length > 1 && (
                <button type="button" onClick={() => handleRemoveComplaint(idx)} className="p-2.5 text-secondary hover:text-red-500 transition-colors">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddComplaint} className="px-4 py-2 border border-border rounded-lg text-primary text-xs font-bold uppercase hover:bg-surface-50 transition-colors">
            {t.addComplaintBtn}
          </button>
        </div>
      </div>

      {/* 17. Cost Information Callout */}
      <div className="p-4 bg-surface-50 border border-border rounded-xl space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">{t.costNoticeTitle}</h4>
        <p className="text-xs text-secondary leading-relaxed">{t.costNoticeDesc}</p>
        <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
          <div><span className="text-secondary">{t.partsCostLabel}:</span> <span className="font-bold">{t.partsCostNotDetermined}</span></div>
          <div><span className="text-secondary">{t.laborCostLabel}:</span> <span className="font-bold">{t.laborCostNotDetermined}</span></div>
          <div><span className="text-secondary">{t.estimatedTotalLabel}:</span> <span className="font-bold text-primary">{t.estimatedTotalPending}</span></div>
        </div>
        <p className="text-[11px] text-muted">{t.costUpdateAfterDiag}</p>
      </div>

      <div className="pt-4">
        <button type="submit" disabled={saving} className="w-full py-4 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-hover transition-colors shadow-md flex items-center justify-center gap-2">
          {saving ? <Loader2 size={16} className="animate-spin" /> : t.registerVehicleBtn}
        </button>
      </div>
    </form>
  );
}

function VehicleFormModal({ vehicle, onClose, onSave, markWhatsappAsSent, showToast, setConfirmModal, lang, t }: any) {
  const [createdVehicle, setCreatedVehicle] = useState<any>(null);

  const triggerWhatsApp = (created: any) => {
    const msg = buildWhatsAppMessage('TRACKING_DETAILS', created, lang);
    openWhatsAppWeb(created.ownerPhone || '', msg);
    showToast(t.msgWhatsAppPrepared, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-border shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto rounded-2xl relative">
        <button onClick={onClose} className={`absolute top-6 ${lang === 'ar' ? 'left-6' : 'right-6'} text-secondary hover:text-foreground`}>
          <X size={20} />
        </button>

        {!createdVehicle ? (
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-6 border-b border-border pb-4">
              {vehicle ? t.editVehicle : t.newVehicleIntake}
            </h2>
            <VehicleIntakeForm 
              vehicle={vehicle} 
              onSave={async (data: any) => {
                try {
                  const res = await onSave(data);
                  if (res && res.id) {
                    setCreatedVehicle(res);
                  } else {
                    onClose();
                  }
                } catch (err: any) {
                  showToast(err?.message || t.msgEnterAllRequiredFields, 'error');
                }
              }} 
              showToast={showToast} 
              t={t} 
              lang={lang} 
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center text-green-600">
              <CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground uppercase tracking-wider mb-1">{t.msgVehicleRegistered}</h2>
              <p className="text-secondary text-xs font-mono">{t.trackingCodeTitle}: <span className="font-bold text-primary">{createdVehicle.trackingCode}</span></p>
            </div>

            <div className="w-full bg-surface-50 border border-border p-6 rounded-xl text-start space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-secondary">{t.customerName}:</span>
                <span className="font-bold text-foreground">{createdVehicle.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">{t.mobileNumber}:</span>
                <span className="font-bold text-foreground phone-number">{createdVehicle.ownerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">{t.plateNumber}:</span>
                <span className="font-bold text-foreground phone-number">{createdVehicle.plateNumber}</span>
              </div>
            </div>

            <div className="w-full pt-4 border-t border-border flex gap-3">
              <button 
                onClick={() => triggerWhatsApp(createdVehicle)} 
                className="flex-1 py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-hover transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <MessageSquare size={16} />
                {t.sendTrackingWhatsApp}
              </button>
              <button 
                onClick={onClose} 
                className="px-6 py-3 border border-border rounded-xl text-secondary text-xs uppercase font-bold hover:bg-surface-50"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// 18. VEHICLE DETAILS MODAL
function VehicleDetailModal({ 
  vehicle, onClose, onEdit, onDelete, onUpdateStatus, onAddNote, 
  onAddPhoto, createEstimate, onUpdateFinalCost, markWhatsappAsSent, 
  showToast, setConfirmModal, lang, t 
}: any) {
  const [noteText, setNoteText] = useState('');
  const [newStatus, setNewStatus] = useState<VehicleStatus>(vehicle.status);

  // Cost inputs
  const [partsCost, setPartsCost] = useState('');
  const [laborCost, setLaborCost] = useState('');
  const [otherCost, setOtherCost] = useState('');

  const handleStatusChange = async () => {
    setConfirmModal({
      show: true,
      title: t.msgStatusUpdated,
      message: `${STATUS_LABELS[lang as 'ar' | 'en'][newStatus]}`,
      onConfirm: async () => {
        try {
          await onUpdateStatus(vehicle.id, newStatus);
          showToast(t.msgStatusUpdated, 'success');
        } catch {
          showToast('Error updating status', 'error');
        }
      }
    });
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await onAddNote(vehicle.id, noteText);
      setNoteText('');
      showToast(t.msgProgressNoteAdded, 'success');
    } catch {
      showToast('Failed to add note', 'error');
    }
  };

  const handleSendWhatsApp = (type: 'TRACKING_DETAILS' | 'STATUS_UPDATE' | 'READY_FOR_PICKUP' | 'REPAIR_COMPLETED') => {
    const msg = buildWhatsAppMessage(type, vehicle, lang, noteText);
    openWhatsAppWeb(vehicle.ownerPhone || '', msg);
    markWhatsappAsSent(vehicle.id, type);
    showToast(t.msgWhatsAppPrepared, 'success');
  };

  const handleSendEmail = async (endpoint: string) => {
    const recipient = vehicle.ownerEmail || vehicle.email;
    if (!recipient) {
      showToast(t.msgEmailFailed, 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/vehicles/${vehicle.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: recipient, language: lang })
      });
      if (res.ok) {
        showToast(t.msgEmailSent, 'success');
      } else {
        showToast(t.msgEmailFailed, 'error');
      }
    } catch {
      showToast(t.msgEmailFailed, 'error');
    }
  };

  const handleSaveCosts = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateFinalCost(vehicle.id, {
        actualPartsCost: parseFloat(partsCost) || 0,
        actualLaborCost: parseFloat(laborCost) || 0,
        otherCosts: parseFloat(otherCost) || 0
      });
      showToast(t.msgVehicleUpdated, 'success');
    } catch {
      showToast('Failed to update costs', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 space-y-8">
        
        {/* Header & Actions */}
        <div className="flex justify-between items-start border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-foreground">
              {vehicle.make} {vehicle.model} — {vehicle.year}
            </h2>
            <div className="flex items-center gap-3 mt-1 font-mono text-xs text-secondary">
              <span className="phone-number">{vehicle.plateNumber}</span>
              <span>•</span>
              <span className="text-primary font-bold">{vehicle.trackingCode}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="px-4 py-2 border border-border rounded-lg text-xs font-bold uppercase hover:bg-surface-50">
              {t.editVehicle}
            </button>
            <button onClick={onDelete} className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold uppercase hover:bg-red-50">
              {t.deleteVehicle}
            </button>
            <button onClick={onClose} className="p-2 text-secondary hover:text-foreground">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 18. Vehicle & Customer Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-surface-50 border border-border rounded-xl space-y-2 text-xs font-mono">
            <h4 className="font-bold text-foreground uppercase tracking-wider mb-2">{t.vehicleDetailsSection}</h4>
            <div><span className="text-secondary">{t.make}:</span> <span className="font-semibold">{vehicle.make}</span></div>
            <div><span className="text-secondary">{t.model}:</span> <span className="font-semibold">{vehicle.model}</span></div>
            <div><span className="text-secondary">{t.year}:</span> <span className="font-semibold">{vehicle.year}</span></div>
            <div><span className="text-secondary">{t.plateNumber}:</span> <span className="font-semibold phone-number">{vehicle.plateNumber}</span></div>
            <div><span className="text-secondary">{t.vin}:</span> <span className="font-semibold">{vehicle.vin || t.na}</span></div>
          </div>

          <div className="p-5 bg-surface-50 border border-border rounded-xl space-y-2 text-xs font-mono">
            <h4 className="font-bold text-foreground uppercase tracking-wider mb-2">{t.customerDetailsSection}</h4>
            <div><span className="text-secondary">{t.customerName}:</span> <span className="font-semibold">{vehicle.ownerName}</span></div>
            <div><span className="text-secondary">{t.mobileNumber}:</span> <span className="font-semibold phone-number">{vehicle.ownerPhone}</span></div>
            <div><span className="text-secondary">{t.emailAddress}:</span> <span className="font-semibold">{vehicle.ownerEmail || vehicle.email || t.na}</span></div>
          </div>
        </div>

        {/* 18. Complaints */}
        <div className="space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">{t.reportedComplaints}</h4>
          <div className="p-4 bg-surface-50 border border-border rounded-xl space-y-1 text-xs">
            {vehicle.complaints?.map((c: any, i: number) => (
              <div key={i} className="text-foreground">• {c.description}</div>
            ))}
          </div>
        </div>

        {/* 18 & 19. Repair Status updater */}
        <div className="p-6 bg-surface-50 border border-border rounded-xl space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">{t.currentStatusTitle}</h4>
          <div className="flex flex-wrap gap-2 items-center">
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value as VehicleStatus)}
              className="bg-white border border-border rounded-lg px-4 py-2 text-xs text-foreground font-semibold"
            >
              <option value="AWAITING_DIAGNOSIS">{t.statusAwaitingDiagnosis || 'بانتظار التشخيص'}</option>
              <option value="IN_PROGRESS">{t.statusInProgress || 'قيد التنفيذ'}</option>
              <option value="AWAITING_PARTS">{t.statusAwaitingParts || 'بانتظار قطع الغيار'}</option>
              <option value="READY_FOR_PICKUP">{t.statusReadyForPickup || 'جاهزة للاستلام'}</option>
              <option value="COMPLETED">{t.statusCompleted || 'مكتمل'}</option>
            </select>
            <button 
              onClick={handleStatusChange} 
              className="px-4 py-2 bg-primary text-white font-bold text-xs uppercase rounded-lg hover:bg-brand-hover transition-colors"
            >
              {t.save}
            </button>
          </div>
        </div>

        {/* 18 & 21. Costs */}
        <div className="p-6 bg-surface-50 border border-border rounded-xl space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">{t.costsTitle}</h4>
          <div className="grid grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-white border border-border rounded-lg">
              <span className="text-secondary block mb-1">{t.partsCostLabel}</span>
              <span className="font-bold text-foreground">
                {vehicle.finalPartsCost !== null && vehicle.finalPartsCost !== undefined ? `${vehicle.finalPartsCost.toLocaleString()} ${t.currency}` : t.partsCostNotDetermined}
              </span>
            </div>
            <div className="p-3 bg-white border border-border rounded-lg">
              <span className="text-secondary block mb-1">{t.laborCostLabel}</span>
              <span className="font-bold text-foreground">
                {vehicle.finalLaborCost !== null && vehicle.finalLaborCost !== undefined ? `${vehicle.finalLaborCost.toLocaleString()} ${t.currency}` : t.laborCostNotDetermined}
              </span>
            </div>
            <div className="p-3 bg-white border border-border rounded-lg">
              <span className="text-secondary block mb-1">{t.totalCostLabel}</span>
              <span className="font-bold text-primary">
                {vehicle.finalTotalCost !== null && vehicle.finalTotalCost !== undefined ? `${vehicle.finalTotalCost.toLocaleString()} ${t.currency}` : t.costNotDetermined}
              </span>
            </div>
          </div>
        </div>

        {/* 18 & 20. Work Progress Log */}
        <div className="space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">{t.workProgressLogTitle}</h4>
          
          <form onSubmit={handleAddNote} className="flex gap-2">
            <input 
              type="text" 
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="أدخل ملاحظة تقدم العمل..."
              className="flex-1 bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <button type="submit" className="px-5 py-2.5 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors">
              {t.addProgressNoteBtn}
            </button>
          </form>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vehicle.progressLogs?.map((log: any, idx: number) => (
              <div key={idx} className="p-3 bg-surface-50 border border-border rounded-xl text-xs flex justify-between items-center">
                <span>{log.message}</span>
                <span className="text-[10px] text-secondary font-mono">{new Date(log.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 18. Customer Communication (WhatsApp & Email) */}
        <div className="p-6 bg-surface-50 border border-border rounded-xl space-y-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-secondary">{t.customerCommunicationTitle}</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => handleSendWhatsApp('TRACKING_DETAILS')} className="px-4 py-2.5 bg-white border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-100 flex items-center justify-center gap-2">
              <MessageSquare size={14} className="text-primary" /> {t.sendTrackingWhatsApp}
            </button>
            <button onClick={() => handleSendWhatsApp('STATUS_UPDATE')} className="px-4 py-2.5 bg-white border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-100 flex items-center justify-center gap-2">
              <MessageSquare size={14} className="text-primary" /> {t.sendStatusWhatsApp}
            </button>
            <button onClick={() => handleSendWhatsApp('READY_FOR_PICKUP')} className="px-4 py-2.5 bg-white border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-100 flex items-center justify-center gap-2">
              <MessageSquare size={14} className="text-primary" /> {t.sendPickupWhatsApp}
            </button>
            <button onClick={() => handleSendWhatsApp('REPAIR_COMPLETED')} className="px-4 py-2.5 bg-white border border-border rounded-lg text-xs font-bold text-foreground hover:bg-surface-100 flex items-center justify-center gap-2">
              <MessageSquare size={14} className="text-primary" /> {t.sendCompletionWhatsApp}
            </button>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <span className="text-xs font-bold text-secondary">{t.emailTitle}</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => handleSendEmail('send-tracking-email')} className="px-4 py-2 border border-border rounded-lg text-xs text-secondary hover:text-foreground">
                {t.sendTrackingEmail}
              </button>
              <button onClick={() => handleSendEmail('send-status-email')} className="px-4 py-2 border border-border rounded-lg text-xs text-secondary hover:text-foreground">
                {t.sendStatusEmail}
              </button>
              <button onClick={() => handleSendEmail('send-pickup-email')} className="px-4 py-2 border border-border rounded-lg text-xs text-secondary hover:text-foreground">
                {t.sendPickupEmail}
              </button>
              <button onClick={() => handleSendEmail('send-completion-email')} className="px-4 py-2 border border-border rounded-lg text-xs text-secondary hover:text-foreground">
                {t.sendCompletionEmail}
              </button>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

// 21. COSTS MANAGER
function CostsManager({ vehicles, updateFinalCost, addPayment, t, lang, showToast }: any) {
  const [selectedVehId, setSelectedVehId] = useState('');
  const currentVeh = vehicles.find((v: any) => v.id === selectedVehId);

  const [parts, setParts] = useState('');
  const [labor, setLabor] = useState('');
  const [other, setOther] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('CASH');
  const [payRef, setPayRef] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentVeh) {
      setParts(currentVeh.finalPartsCost?.toString() || '');
      setLabor(currentVeh.finalLaborCost?.toString() || '');
      setOther(currentVeh.finalOtherCost?.toString() || '');
    }
  }, [currentVeh]);

  const handleSaveCosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehId) return;
    setSaving(true);
    try {
      await updateFinalCost(selectedVehId, {
        actualPartsCost: parseFloat(parts) || 0,
        actualLaborCost: parseFloat(labor) || 0,
        otherCosts: parseFloat(other) || 0
      });
      showToast(t.msgVehicleUpdated, 'success');
    } catch {
      showToast('Error saving costs', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehId || !payAmount) return;
    setSaving(true);
    try {
      await addPayment(selectedVehId, {
        amount: parseFloat(payAmount) || 0,
        paymentMethod: payMethod,
        reference: payRef
      });
      showToast(t.msgVehicleUpdated, 'success');
      setPayAmount('');
      setPayRef('');
    } catch {
      showToast('Error recording payment', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-secondary uppercase font-mono">{t.vehicles}</label>
          <select 
            value={selectedVehId} 
            onChange={(e) => setSelectedVehId(e.target.value)} 
            className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary font-semibold"
          >
            <option value="">{t.selectVehicle}</option>
            {vehicles.map((v: any) => (
              <option key={v.id} value={v.id}>{v.plateNumber} | {v.make} {v.model}</option>
            ))}
          </select>
        </div>

        {currentVeh && (() => {
          const payments = currentVeh.payments || [];
          const totalPaid = payments.reduce((s: number, p: any) => s + p.amount, 0);
          const remaining = (currentVeh.finalTotalCost || 0) - totalPaid;
          return (
            <div className="space-y-3 pt-4 border-t border-border text-xs font-mono">
              <h4 className="font-bold text-foreground">{t.financialSummary}</h4>
              <div className="flex justify-between"><span className="text-secondary">{t.partsCostLabel}:</span> <span>{(currentVeh.finalPartsCost || 0).toLocaleString()} {t.currency}</span></div>
              <div className="flex justify-between"><span className="text-secondary">{t.laborCostLabel}:</span> <span>{(currentVeh.finalLaborCost || 0).toLocaleString()} {t.currency}</span></div>
              <div className="flex justify-between font-bold text-primary"><span className="text-secondary">{t.totalCostLabel}:</span> <span>{(currentVeh.finalTotalCost || 0).toLocaleString()} {t.currency}</span></div>
              <div className="flex justify-between text-green-700 font-bold"><span className="text-secondary">{t.paidAmount}:</span> <span>{totalPaid.toLocaleString()} {t.currency}</span></div>
              <div className="flex justify-between text-amber-700 font-bold border-t border-border pt-2"><span className="text-secondary">{t.remainingAmount}:</span> <span>{remaining.toLocaleString()} {t.currency}</span></div>
            </div>
          );
        })()}
      </div>

      <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.repairCostsTitle}</h3>
        <form onSubmit={handleSaveCosts} className="space-y-3">
          <div>
            <label className="text-xs font-mono font-bold text-secondary block mb-1">{t.partsHeading}</label>
            <input type="number" value={parts} onChange={(e) => setParts(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2 text-xs text-foreground" />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-secondary block mb-1">{t.laborHeading}</label>
            <input type="number" value={labor} onChange={(e) => setLabor(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2 text-xs text-foreground" />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-secondary block mb-1">{t.additionalCostsHeading}</label>
            <input type="number" value={other} onChange={(e) => setOther(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2 text-xs text-foreground" />
          </div>
          <button type="submit" disabled={!selectedVehId || saving} className="w-full py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-brand-hover transition-colors shadow-sm disabled:opacity-50">
            {t.saveCostsBtn}
          </button>
        </form>
      </div>

      <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">{t.addPayment}</h3>
        <form onSubmit={handleRecordPayment} className="space-y-3">
          <div>
            <label className="text-xs font-mono font-bold text-secondary block mb-1">{t.paymentAmount}</label>
            <input type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2 text-xs text-foreground" />
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-secondary block mb-1">{t.paymentMethod}</label>
            <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2 text-xs text-foreground">
              <option value="CASH">{t.cash}</option>
              <option value="CARD">{t.card}</option>
              <option value="BANK_TRANSFER">{t.bankTransfer}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-mono font-bold text-secondary block mb-1">{t.paymentReference}</label>
            <input type="text" value={payRef} onChange={(e) => setPayRef(e.target.value)} className="w-full bg-surface-50 border border-border rounded-lg px-4 py-2 text-xs text-foreground" />
          </div>
          <button type="submit" disabled={!selectedVehId || saving} className="w-full py-3 bg-green-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-green-800 transition-colors shadow-sm disabled:opacity-50">
            {t.recordPaymentBtn}
          </button>
        </form>
      </div>
    </div>
  );
}
