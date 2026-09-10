"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Edit2,
  KeyRound,
  UserCheck,
  UserX,
  Trash2,
  LogOut,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  Mail,
  Phone,
  User as UserIcon,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ROLES = ['ADMIN', 'MANAGER', 'SERVICE_ADVISOR', 'TECHNICIAN', 'RECEPTIONIST'] as const;
type UserRole = typeof ROLES[number];

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  _count?: {
    inspections: number;
    repairs: number;
    estimates: number;
    progressLogs: number;
  };
}

const dict = {
  ar: {
    portalTitle: "بوابة الإدارة",
    pageTitle: "إدارة الموظفين والصلاحيات",
    pageSubtitle: "إدارة حسابات موظفي الورشة وتعيين الأدوار والصلاحيات وتأمين الوصول.",
    dashboardLink: "لوحة تحكم الورشة",
    logout: "تسجيل الخروج",
    langToggle: "English",

    // Stats
    totalEmployees: "إجمالي الموظفين",
    activeStaff: "الموظفون النشطون",
    adminsCount: "المسؤولون",
    techsAndAdvisors: "الفنيون والمستشارون",

    // Actions & Filters
    searchPlaceholder: "البحث بالاسم، البريد الإلكتروني، أو رقم الجوال...",
    allRoles: "جميع الأدوار",
    allStatuses: "جميع الحالات",
    activeOnly: "النشطون فقط",
    inactiveOnly: "غير النشطين فقط",
    addEmployeeBtn: "+ إضافة موظف جديد",
    refreshBtn: "تحديث",

    // Table Headers
    colEmployee: "الموظف",
    colContact: "معلومات الاتصال",
    colRole: "الدور / الصلاحية",
    colStatus: "الحالة",
    colVerified: "التحقق",
    colJoined: "تاريخ الانضمام",
    colActions: "الإجراءات",

    // Status Badges
    statusActive: "نشط",
    statusInactive: "معطل",
    verifiedYes: "مفعل",
    verifiedNo: "غير مفعل",

    // Role Labels
    roleAdmin: "مسؤول النظام (Admin)",
    roleManager: "مدير الورشة (Manager)",
    roleAdvisor: "مستشار خدمة (Service Advisor)",
    roleTech: "فني صيانة (Technician)",
    roleReception: "موظف استقبال (Receptionist)",

    // Row Actions
    editAction: "تعديل البيانات",
    resetPassAction: "إعادة تعيين كلمة المرور",
    deactivateAction: "تعطيل الحساب",
    activateAction: "تفعيل الحساب",
    deleteAction: "حذف الموظف",

    // Modals
    addModalTitle: "إضافة موظف جديد",
    addModalDesc: "أنشئ حساباً جديداً لأحد العاملين بالورشة مع تحديد الدور والصلاحيات.",
    editModalTitle: "تعديل بيانات الموظف",
    editModalDesc: "تحديث معلومات الموظف أو تعديل دوره الوظيفي.",
    resetModalTitle: "تعيين كلمة مرور جديدة",
    resetModalDesc: "أدخل كلمة مرور جديدة أو أنشئ كلمة مرور آمنة للموظف.",

    // Form Labels
    nameLabel: "الاسم الكامل",
    namePlaceholder: "أدخل اسم الموظف",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "example@almubarmaja.com",
    phoneLabel: "رقم الجوال",
    phonePlaceholder: "+966 5X XXX XXXX",
    roleLabel: "الدور الوظيفي",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "6 أحرف على الأقل",
    statusLabel: "حالة الحساب",
    emailVerifiedLabel: "تفعيل الحساب مباشرة بدون تأكيد البريد",

    // Buttons
    saveBtn: "حفظ التغييرات",
    createBtn: "إنشاء الحساب",
    cancelBtn: "إلغاء",
    confirmBtn: "تأكيد",
    generatePassBtn: "توليد كلمة مرور عشوائية",

    // Messages & Alerts
    accessDeniedTitle: "غير مصرح بالدخول",
    accessDeniedDesc: "صفحة الإدارة مخصصة للمسؤولين (Admins) فقط. ليس لديك الصلاحية الكافية لعرض هذه الصفحة.",
    backToDashboard: "العودة إلى لوحة التحكم",
    noRecords: "لا يوجد موظفون يطابقون خيارات البحث.",
    lastAdminWarning: "لا يمكن تعطيل أو حذف المسؤول الوحيد النشط في النظام.",
    confirmDeactivateMsg: "هل أنت متأكد من رغبتك في تعطيل حساب هذا الموظف؟ لن يتمكن من تسجيل الدخول حتى إعادة التفعيل.",
    confirmDeleteMsg: "هل أنت متأكد من حذف حساب هذا الموظف؟",
    msgCreated: "تم إنشاء حساب الموظف بنجاح.",
    msgUpdated: "تم تحديث بيانات الموظف بنجاح.",
    msgStatusChanged: "تم تغيير حالة الحساب بنجاح.",
    msgPasswordReset: "تمت إعادة تعيين كلمة المرور بنجاح.",
    msgDeleted: "تمت معالجة حذف الحساب بنجاح.",
    errorGeneric: "حدث خطأ أثناء معالجة الطلب."
  },
  en: {
    portalTitle: "Admin Portal",
    pageTitle: "Employee & Access Management",
    pageSubtitle: "Manage workshop staff accounts, assign operational roles, and secure access permissions.",
    dashboardLink: "Workshop Dashboard",
    logout: "Logout",
    langToggle: "العربية",

    // Stats
    totalEmployees: "Total Employees",
    activeStaff: "Active Staff",
    adminsCount: "Administrators",
    techsAndAdvisors: "Techs & Advisors",

    // Actions & Filters
    searchPlaceholder: "Search by name, email, or phone number...",
    allRoles: "All Roles",
    allStatuses: "All Statuses",
    activeOnly: "Active Only",
    inactiveOnly: "Inactive Only",
    addEmployeeBtn: "+ Add New Employee",
    refreshBtn: "Refresh",

    // Table Headers
    colEmployee: "Employee",
    colContact: "Contact Information",
    colRole: "Role & Permission",
    colStatus: "Status",
    colVerified: "Verified",
    colJoined: "Joined Date",
    colActions: "Actions",

    // Status Badges
    statusActive: "Active",
    statusInactive: "Inactive",
    verifiedYes: "Verified",
    verifiedNo: "Unverified",

    // Role Labels
    roleAdmin: "Administrator (Admin)",
    roleManager: "Workshop Manager",
    roleAdvisor: "Service Advisor",
    roleTech: "Technician",
    roleReception: "Receptionist",

    // Row Actions
    editAction: "Edit Employee",
    resetPassAction: "Reset Password",
    deactivateAction: "Deactivate Account",
    activateAction: "Activate Account",
    deleteAction: "Delete Account",

    // Modals
    addModalTitle: "Add New Employee",
    addModalDesc: "Create a new workshop staff account with role and permission assignments.",
    editModalTitle: "Edit Employee Profile",
    editModalDesc: "Update staff details or change assigned system role.",
    resetModalTitle: "Set New Password",
    resetModalDesc: "Enter a new password or generate a secure temporary password.",

    // Form Labels
    nameLabel: "Full Name",
    namePlaceholder: "Enter employee name",
    emailLabel: "Email Address",
    emailPlaceholder: "example@almubarmaja.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+966 5X XXX XXXX",
    roleLabel: "Assigned Role",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    statusLabel: "Account Status",
    emailVerifiedLabel: "Mark email as pre-verified",

    // Buttons
    saveBtn: "Save Changes",
    createBtn: "Create Employee",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm",
    generatePassBtn: "Generate Random Password",

    // Messages & Alerts
    accessDeniedTitle: "Access Restricted",
    accessDeniedDesc: "The Admin Portal is restricted to Administrators only. Your account does not have permission to access this area.",
    backToDashboard: "Return to Workshop Dashboard",
    noRecords: "No employees match your search criteria.",
    lastAdminWarning: "Cannot deactivate or delete the last remaining active Administrator.",
    confirmDeactivateMsg: "Are you sure you want to deactivate this employee account? They will not be able to log in until reactivated.",
    confirmDeleteMsg: "Are you sure you want to delete this employee account?",
    msgCreated: "Employee account created successfully.",
    msgUpdated: "Employee details updated successfully.",
    msgStatusChanged: "Account status updated successfully.",
    msgPasswordReset: "Employee password has been reset successfully.",
    msgDeleted: "Employee account deleted successfully.",
    errorGeneric: "An error occurred while processing the request."
  }
};

const ROLE_BADGES: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
  ADMIN: { label: "ADMIN", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  MANAGER: { label: "MANAGER", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  SERVICE_ADVISOR: { label: "SERVICE ADVISOR", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  TECHNICIAN: { label: "TECHNICIAN", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  RECEPTIONIST: { label: "RECEPTIONIST", bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" }
};

export default function AdminPage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const t = dict[lang];

  // Auth & Permissions State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Data & Filters State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Modals State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [resetPassEmployee, setResetPassEmployee] = useState<Employee | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
    danger?: boolean;
  } | null>(null);

  // Form inputs for Add
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('TECHNICIAN');
  const [addPassword, setAddPassword] = useState('');
  const [addIsActive, setAddIsActive] = useState(true);
  const [addIsVerified, setAddIsVerified] = useState(true);

  // Form inputs for Edit
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('TECHNICIAN');
  const [editIsActive, setEditIsActive] = useState(true);

  // Form input for Reset Password
  const [newPassword, setNewPassword] = useState('');

  // UI Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4500);
  };

  // Check Auth on Mount
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';

    try {
      const storedToken = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');
      const user = storedUserStr ? JSON.parse(storedUserStr) : null;

      if (!storedToken) {
        window.location.replace('/login');
        return;
      }

      setToken(storedToken);
      setCurrentUser(user);
    } catch {
      window.location.replace('/login');
    } finally {
      setAuthChecked(true);
    }
  }, [lang]);

  // Fetch Employees
  const fetchEmployees = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        if (currentUser?.role !== 'ADMIN') {
          // Handled by role check render
          return;
        }
      }

      const data = await res.json();
      if (res.ok && data?.data) {
        setEmployees(data.data);
      } else {
        showToast(data?.message || t.errorGeneric, 'error');
      }
    } catch {
      showToast(t.errorGeneric, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, t.errorGeneric]);

  useEffect(() => {
    if (authChecked && currentUser?.role === 'ADMIN') {
      fetchEmployees();
    }
  }, [authChecked, currentUser, fetchEmployees]);

  // Logout Handler
  const handleLogout = () => {
    document.cookie = 'token=; Max-Age=0; path=/';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('/login');
  };

  // Generate random strong password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  // Handle Add Employee Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPassword) {
      showToast(lang === 'ar' ? 'يرجى إدخال جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/employees`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          phone: addPhone || null,
          role: addRole,
          password: addPassword,
          isActive: addIsActive,
          emailVerified: addIsVerified
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        showToast(t.msgCreated, 'success');
        setIsAddOpen(false);
        setAddName('');
        setAddEmail('');
        setAddPhone('');
        setAddPassword('');
        setAddRole('TECHNICIAN');
        fetchEmployees();
      } else {
        showToast(data?.message || t.errorGeneric, 'error');
      }
    } catch {
      showToast(t.errorGeneric, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Employee Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone || null,
          role: editRole,
          isActive: editIsActive
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        showToast(t.msgUpdated, 'success');
        setEditingEmployee(null);
        fetchEmployees();
      } else {
        showToast(data?.message || t.errorGeneric, 'error');
      }
    } catch {
      showToast(t.errorGeneric, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassEmployee || !newPassword) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/employees/${resetPassEmployee.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        showToast(t.msgPasswordReset, 'success');
        setResetPassEmployee(null);
        setNewPassword('');
      } else {
        showToast(data?.message || t.errorGeneric, 'error');
      }
    } catch {
      showToast(t.errorGeneric, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Toggle Active
  const handleToggleStatus = (employee: Employee) => {
    const newStatus = !employee.isActive;
    const actionName = newStatus ? t.activateAction : t.deactivateAction;

    setConfirmModal({
      title: `${actionName}: ${employee.name}`,
      message: newStatus ? (lang === 'ar' ? 'هل تريد إعادة تفعيل حساب هذا الموظف؟' : 'Reactivate this employee account?') : t.confirmDeactivateMsg,
      danger: !newStatus,
      action: async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`${API_BASE}/api/admin/employees/${employee.id}/status`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: newStatus })
          });

          const data = await res.json().catch(() => null);

          if (res.ok) {
            showToast(t.msgStatusChanged, 'success');
            setConfirmModal(null);
            fetchEmployees();
          } else {
            showToast(data?.message || t.errorGeneric, 'error');
          }
        } catch {
          showToast(t.errorGeneric, 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // Handle Delete Employee
  const handleDeleteEmployee = (employee: Employee) => {
    setConfirmModal({
      title: `${t.deleteAction}: ${employee.name}`,
      message: t.confirmDeleteMsg,
      danger: true,
      action: async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`${API_BASE}/api/admin/employees/${employee.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await res.json().catch(() => null);

          if (res.ok) {
            showToast(data?.message || t.msgDeleted, 'success');
            setConfirmModal(null);
            fetchEmployees();
          } else {
            showToast(data?.message || t.errorGeneric, 'error');
          }
        } catch {
          showToast(t.errorGeneric, 'error');
        } finally {
          setActionLoading(false);
        }
      }
    });
  };

  // Computed KPIs
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.isActive).length;
    const admins = employees.filter(e => e.role === 'ADMIN').length;
    const techsAndAdvisors = employees.filter(e => e.role === 'TECHNICIAN' || e.role === 'SERVICE_ADVISOR').length;
    return { total, active, admins, techsAndAdvisors };
  }, [employees]);

  // Filtered list
  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.phone && e.phone.includes(q)) ||
        e.role.toLowerCase().includes(q);

      const matchesRole = !selectedRole || e.role === selectedRole;
      const matchesStatus = !selectedStatus ||
        (selectedStatus === 'active' ? e.isActive : !e.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, searchQuery, selectedRole, selectedStatus]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  // Access Denied Guard
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mb-6 shadow-sm">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">{t.accessDeniedTitle}</h1>
        <p className="text-secondary max-w-md mb-8 text-sm leading-relaxed">{t.accessDeniedDesc}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-brand-hover transition-colors shadow-md"
        >
          <LayoutDashboard size={16} />
          <span>{t.backToDashboard}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 z-50 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold border ${
              toast.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-300 text-red-800' :
              'bg-blue-50 border-blue-300 text-blue-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="border-b border-border bg-white sticky top-0 z-30 h-[70px] sm:h-[85px] flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="flex items-center group">
              <img src="/logo.png" alt="AL Mubarmaja" className="h-[38px] sm:h-[48px] md:h-[54px] w-auto object-contain group-hover:opacity-85 transition-opacity" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold font-mono">
              <ShieldCheck size={14} />
              <span>{t.portalTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 border border-border bg-surface-50 rounded-lg text-xs font-bold text-secondary hover:text-foreground hover:bg-white transition-colors"
            >
              <LayoutDashboard size={14} />
              <span className="hidden md:inline">{t.dashboardLink}</span>
            </Link>

            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="px-2.5 sm:px-3 py-1.5 border border-border bg-white rounded-lg text-xs font-mono font-bold text-secondary hover:text-foreground transition-colors"
            >
              {t.langToggle}
            </button>

            {currentUser && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 border border-border bg-surface-50 rounded-lg text-xs">
                <span className="font-bold text-foreground">{currentUser.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-primary text-white rounded font-mono font-bold">ADMIN</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 border border-border rounded-lg text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1 flex flex-col gap-6 sm:gap-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground mb-1">{t.pageTitle}</h1>
            <p className="text-xs sm:text-sm text-secondary font-medium">{t.pageSubtitle}</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={fetchEmployees}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 border border-border bg-white rounded-xl text-xs font-bold text-secondary hover:text-foreground hover:bg-surface-50 transition-colors flex items-center gap-2 shadow-xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{t.refreshBtn}</span>
            </button>
            <button
              onClick={() => {
                setAddPassword(generateRandomPassword());
                setIsAddOpen(true);
              }}
              className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-md uppercase tracking-wider whitespace-nowrap"
            >
              <UserPlus size={16} />
              <span>{t.addEmployeeBtn}</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 bg-white border border-border rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-secondary uppercase tracking-wider">{t.totalEmployees}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-50 text-primary flex items-center justify-center">
                <Users size={15} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-foreground">{stats.total}</div>
          </div>

          <div className="p-4 sm:p-5 bg-white border border-border rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-secondary uppercase tracking-wider">{t.activeStaff}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center">
                <UserCheck size={15} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-green-700">{stats.active}</div>
          </div>

          <div className="p-4 sm:p-5 bg-white border border-border rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-secondary uppercase tracking-wider">{t.adminsCount}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                <ShieldCheck size={15} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-red-700">{stats.admins}</div>
          </div>

          <div className="p-4 sm:p-5 bg-white border border-border rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-bold text-secondary uppercase tracking-wider">{t.techsAndAdvisors}</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users size={15} />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold font-mono text-blue-700">{stats.techsAndAdvisors}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-border p-3.5 sm:p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={16} className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'} text-secondary pointer-events-none`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full bg-surface-50 border border-border rounded-xl text-xs py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-foreground focus:outline-none focus:border-primary transition-all`}
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-surface-50 border border-border rounded-xl text-xs py-2.5 px-3 text-secondary font-medium focus:outline-none focus:border-primary transition-all"
            >
              <option value="">{t.allRoles}</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-surface-50 border border-border rounded-xl text-xs py-2.5 px-3 text-secondary font-medium focus:outline-none focus:border-primary transition-all"
            >
              <option value="">{t.allStatuses}</option>
              <option value="active">{t.activeOnly}</option>
              <option value="inactive">{t.inactiveOnly}</option>
            </select>
          </div>
        </div>

        {/* Employees Display */}
        <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-secondary">
              <Loader2 size={30} className="animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider">{t.refreshBtn}...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-surface-50 text-secondary flex items-center justify-center mb-3">
                <Users size={24} />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">{t.noRecords}</h3>
            </div>
          ) : (
            <>
              {/* Mobile Employee Card List */}
              <div className="md:hidden divide-y divide-border">
                {filteredEmployees.map((emp) => {
                  const badge = ROLE_BADGES[emp.role] || ROLE_BADGES.TECHNICIAN;
                  const isSelf = emp.id === currentUser?.id;

                  return (
                    <div key={emp.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-surface-200 border border-border text-primary font-bold flex items-center justify-center font-mono shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono font-bold">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {emp.role}
                            </span>
                          </div>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          emp.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-green-600' : 'bg-gray-400'}`} />
                          {emp.isActive ? t.statusActive : t.statusInactive}
                        </span>
                      </div>

                      <div className="p-3 bg-surface-50 rounded-xl space-y-1.5 text-xs font-mono">
                        <div className="flex items-center gap-2 text-secondary">
                          <Mail size={13} className="shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-2 text-secondary">
                            <Phone size={13} className="shrink-0" />
                            <span className="phone-number">{emp.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                          <span className="text-secondary">{t.colVerified}: {emp.emailVerified ? <strong className="text-green-700">{t.verifiedYes}</strong> : <strong className="text-amber-700">{t.verifiedNo}</strong>}</span>
                          <span className="text-muted">{new Date(emp.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 pt-1">
                        <button
                          onClick={() => {
                            setEditingEmployee(emp);
                            setEditName(emp.name);
                            setEditEmail(emp.email);
                            setEditPhone(emp.phone || '');
                            setEditRole(emp.role);
                            setEditIsActive(emp.isActive);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-secondary hover:text-primary hover:bg-surface-50 rounded-lg border border-border transition-colors"
                        >
                          <Edit2 size={13} />
                          <span>{t.editAction}</span>
                        </button>
                        <button
                          onClick={() => {
                            setResetPassEmployee(emp);
                            setNewPassword(generateRandomPassword());
                          }}
                          className="p-2 text-secondary hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-border transition-colors"
                          title={t.resetPassAction}
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`p-2 rounded-lg border border-border transition-colors ${
                            emp.isActive ? 'text-secondary hover:text-red-600 hover:bg-red-50' : 'text-secondary hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={emp.isActive ? t.deactivateAction : t.activateAction}
                        >
                          {emp.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(emp)}
                          className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg border border-border transition-colors"
                          title={t.deleteAction}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Employee Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-50 border-b border-border text-secondary uppercase font-mono font-bold">
                      <th className="py-4 px-5 text-start">{t.colEmployee}</th>
                      <th className="py-4 px-5 text-start">{t.colContact}</th>
                      <th className="py-4 px-5 text-start">{t.colRole}</th>
                      <th className="py-4 px-5 text-center">{t.colStatus}</th>
                      <th className="py-4 px-5 text-center">{t.colVerified}</th>
                      <th className="py-4 px-5 text-start">{t.colJoined}</th>
                      <th className="py-4 px-5 text-center">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredEmployees.map((emp) => {
                      const badge = ROLE_BADGES[emp.role] || ROLE_BADGES.TECHNICIAN;
                      const isSelf = emp.id === currentUser?.id;

                      return (
                        <tr key={emp.id} className="hover:bg-surface-50/70 transition-colors">
                          {/* Employee Name */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-surface-200 border border-border text-primary font-bold flex items-center justify-center font-mono shrink-0">
                                {emp.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                                  <span>{emp.name}</span>
                                  {isSelf && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-mono font-bold">
                                      YOU
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact info */}
                          <td className="py-4 px-5 font-mono">
                            <div className="text-secondary">{emp.email}</div>
                            {emp.phone && <div className="text-[11px] text-muted phone-number">{emp.phone}</div>}
                          </td>

                          {/* Role badge */}
                          <td className="py-4 px-5">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold font-mono border ${badge.bg} ${badge.text} ${badge.border}`}>
                              {emp.role}
                            </span>
                          </td>

                          {/* Active status */}
                          <td className="py-4 px-5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              emp.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-300'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? 'bg-green-600' : 'bg-gray-400'}`} />
                              {emp.isActive ? t.statusActive : t.statusInactive}
                            </span>
                          </td>

                          {/* Verified status */}
                          <td className="py-4 px-5 text-center font-mono">
                            {emp.emailVerified ? (
                              <span className="text-green-700 font-bold">{t.verifiedYes}</span>
                            ) : (
                              <span className="text-amber-700 font-bold">{t.verifiedNo}</span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-5 font-mono text-secondary">
                            {new Date(emp.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-center">
                            <div className="inline-flex items-center gap-1">
                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingEmployee(emp);
                                  setEditName(emp.name);
                                  setEditEmail(emp.email);
                                  setEditPhone(emp.phone || '');
                                  setEditRole(emp.role);
                                  setEditIsActive(emp.isActive);
                                }}
                                className="p-1.5 text-secondary hover:text-primary hover:bg-white rounded border border-transparent hover:border-border transition-colors"
                                title={t.editAction}
                              >
                                <Edit2 size={15} />
                              </button>

                              {/* Reset Password */}
                              <button
                                onClick={() => {
                                  setResetPassEmployee(emp);
                                  setNewPassword(generateRandomPassword());
                                }}
                                className="p-1.5 text-secondary hover:text-amber-700 hover:bg-white rounded border border-transparent hover:border-border transition-colors"
                                title={t.resetPassAction}
                              >
                                <KeyRound size={15} />
                              </button>

                              {/* Toggle Active */}
                              <button
                                onClick={() => handleToggleStatus(emp)}
                                className={`p-1.5 rounded border border-transparent hover:border-border transition-colors ${
                                  emp.isActive ? 'text-secondary hover:text-red-600 hover:bg-white' : 'text-secondary hover:text-green-600 hover:bg-white'
                                }`}
                                title={emp.isActive ? t.deactivateAction : t.activateAction}
                              >
                                {emp.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteEmployee(emp)}
                                className="p-1.5 text-secondary hover:text-red-600 hover:bg-white rounded border border-transparent hover:border-border transition-colors"
                                title={t.deleteAction}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* ADD EMPLOYEE MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-50 text-primary flex items-center justify-center">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{t.addModalTitle}</h3>
                    <p className="text-xs text-secondary">{t.addModalDesc}</p>
                  </div>
                </div>
                <button onClick={() => setIsAddOpen(false)} className="text-secondary hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-secondary block mb-1">{t.nameLabel} *</label>
                  <div className="relative">
                    <UserIcon size={16} className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'} text-secondary`} />
                    <input
                      type="text"
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className={`w-full bg-surface-50 border border-border rounded-xl py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-foreground focus:outline-none focus:border-primary`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">{t.emailLabel} *</label>
                  <div className="relative">
                    <Mail size={16} className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'} text-secondary`} />
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className={`w-full bg-surface-50 border border-border rounded-xl py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-foreground focus:outline-none focus:border-primary`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">{t.phoneLabel}</label>
                  <div className="relative">
                    <Phone size={16} className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'} text-secondary`} />
                    <input
                      type="tel"
                      value={addPhone}
                      onChange={(e) => setAddPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className={`w-full bg-surface-50 border border-border rounded-xl py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-foreground focus:outline-none focus:border-primary phone-number`}
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">{t.roleLabel} *</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="w-full bg-surface-50 border border-border rounded-xl py-2.5 px-3 text-foreground font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="ADMIN">{t.roleAdmin}</option>
                    <option value="MANAGER">{t.roleManager}</option>
                    <option value="SERVICE_ADVISOR">{t.roleAdvisor}</option>
                    <option value="TECHNICIAN">{t.roleTech}</option>
                    <option value="RECEPTIONIST">{t.roleReception}</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-secondary">{t.passwordLabel} *</label>
                    <button
                      type="button"
                      onClick={() => setAddPassword(generateRandomPassword())}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      {t.generatePassBtn}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'} text-secondary`} />
                    <input
                      type="text"
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full bg-surface-50 border border-border rounded-xl py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-foreground font-mono focus:outline-none focus:border-primary`}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addIsActive}
                      onChange={(e) => setAddIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">{t.statusLabel}: {t.statusActive}</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addIsVerified}
                      onChange={(e) => setAddIsVerified(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">{t.emailVerifiedLabel}</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 border border-border rounded-xl text-secondary hover:bg-surface-50 transition-colors font-bold"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-md disabled:opacity-75"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                    <span>{t.createBtn}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* EDIT EMPLOYEE MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {editingEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-50 text-primary flex items-center justify-center">
                    <Edit2 size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{t.editModalTitle}</h3>
                    <p className="text-xs text-secondary">{t.editModalDesc}</p>
                  </div>
                </div>
                <button onClick={() => setEditingEmployee(null)} className="text-secondary hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-secondary block mb-1">{t.nameLabel} *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-surface-50 border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">{t.emailLabel} *</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-surface-50 border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">{t.phoneLabel}</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-surface-50 border border-border rounded-xl py-2.5 px-3 text-foreground focus:outline-none focus:border-primary phone-number"
                  />
                </div>

                <div>
                  <label className="font-bold text-secondary block mb-1">{t.roleLabel} *</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-surface-50 border border-border rounded-xl py-2.5 px-3 text-foreground font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="ADMIN">{t.roleAdmin}</option>
                    <option value="MANAGER">{t.roleManager}</option>
                    <option value="SERVICE_ADVISOR">{t.roleAdvisor}</option>
                    <option value="TECHNICIAN">{t.roleTech}</option>
                    <option value="RECEPTIONIST">{t.roleReception}</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-border">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(e) => setEditIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    <span className="font-medium text-foreground">{t.statusLabel}: {t.statusActive}</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(null)}
                    className="px-4 py-2 border border-border rounded-xl text-secondary hover:bg-surface-50 transition-colors font-bold"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-md disabled:opacity-75"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Edit2 size={14} />}
                    <span>{t.saveBtn}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {resetPassEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">{t.resetModalTitle}</h3>
                    <p className="text-xs text-secondary">{resetPassEmployee.name}</p>
                  </div>
                </div>
                <button onClick={() => setResetPassEmployee(null)} className="text-secondary hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-secondary">{t.passwordLabel} *</label>
                    <button
                      type="button"
                      onClick={() => setNewPassword(generateRandomPassword())}
                      className="text-[11px] text-primary hover:underline font-semibold"
                    >
                      {t.generatePassBtn}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className={`absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'} text-secondary`} />
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full bg-surface-50 border border-border rounded-xl py-2.5 ${lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} text-foreground font-mono focus:outline-none focus:border-primary`}
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setResetPassEmployee(null)}
                    className="px-4 py-2 border border-border rounded-xl text-secondary hover:bg-surface-50 transition-colors font-bold"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-brand-hover transition-colors flex items-center gap-2 shadow-md disabled:opacity-75"
                  >
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                    <span>{t.saveBtn}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* CONFIRM ACTION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {confirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmModal.danger ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-surface-50 text-primary border border-border'
                }`}>
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">{confirmModal.title}</h3>
                  <p className="text-xs text-secondary leading-relaxed">{confirmModal.message}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-bold text-secondary hover:bg-surface-50 transition-colors"
                >
                  {t.cancelBtn}
                </button>
                <button
                  onClick={confirmModal.action}
                  disabled={actionLoading}
                  className={`px-5 py-2 font-bold text-xs rounded-xl transition-colors shadow-md flex items-center gap-2 disabled:opacity-75 ${
                    confirmModal.danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-primary text-white hover:bg-brand-hover'
                  }`}
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>{t.confirmBtn}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
