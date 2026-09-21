import React, { useState } from 'react';
import { UserRoleView } from '@/types/loan';
import { ShieldCheck, UserCheck, Banknote, Database, Shield, LogOut, ChevronDown, UserPlus, Globe } from 'lucide-react';
import RbacModal from '@/components/RbacModal';
import { logoutUser, switchSessionUser } from '@/actions/rbac';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  currentRole: UserRoleView;
  onRoleChange: (role: UserRoleView) => void;
  sessionUser?: {
    name: string;
    email: string;
    role: string;
    roleDisplayName: string;
    permissions: string[];
  } | null;
}

export default function Header({ currentRole, onRoleChange, sessionUser }: HeaderProps) {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [isRbacOpen, setIsRbacOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const activeName = sessionUser?.name || 'Jimmy Dolly';
  const activeRoleDisplay = sessionUser?.roleDisplayName || 'Super Admin (Head of Risk)';
  const activeRoleName = sessionUser?.role || 'SUPER_ADMIN';

  const handleQuickSwitch = async (email: string, targetRoleView: UserRoleView) => {
    await switchSessionUser(email);
    onRoleChange(targetRoleView);
    setUserDropdownOpen(false);
    router.refresh();
  };

  const handleLogout = async () => {
    await logoutUser();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-lg shadow-sm shadow-blue-500/20">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  {t.common.appName}
                </span>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200/60">
                  {t.header.creditApprovalSystem}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t.header.dashboardSubtitle}
              </p>
            </div>
          </div>

          {/* Center: Interactive Role Switcher */}
          <div className="hidden xl:flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/70">
            <button
              onClick={() => onRoleChange('CREDIT_ANALYST')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'CREDIT_ANALYST'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              {t.header.roleCa}
            </button>

            <button
              onClick={() => onRoleChange('CREDIT_SUPERVISOR')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'CREDIT_SUPERVISOR'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.header.roleSpv}
            </button>

            <button
              onClick={() => onRoleChange('DISBURSEMENT_OPS')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'DISBURSEMENT_OPS'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Banknote className="h-3.5 w-3.5" />
              {t.header.roleDisbursement}
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Buttons Option */}
            <div className="flex items-center rounded-xl bg-slate-100/90 p-0.5 border border-slate-200/80 text-xs shadow-2xs">
              <div className="px-1 text-slate-400 hidden sm:block">
                <Globe className="h-3.5 w-3.5" />
              </div>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('zh')}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  language === 'zh'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="切换至中文 (Chinese)"
              >
                中文
              </button>
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className={`flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  language === 'id'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Ganti ke Bahasa Indonesia"
              >
                ID
              </button>
            </div>

            {/* RBAC & Permission Matrix Button */}
            <button
              onClick={() => setIsRbacOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden md:inline">{t.header.permissionMatrix}</span>
            </button>

            {/* DB Status */}
            <div className="hidden 2xl:flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t.header.dbStatus}</span>
            </div>

            {/* User Profile & Dropdown Switcher */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {activeName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <span>{activeName}</span>
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-400">{activeRoleDisplay}</div>
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50 animate-in fade-in-50 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{activeName}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{sessionUser?.email || 'jimmy.dolly@banksentosa.co.id'}</div>
                    <span className="mt-1 inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                      {t.header.superAdminBadge}
                    </span>
                  </div>

                  <div className="p-2 text-[11px] text-slate-500 bg-slate-50/70 m-2 rounded-lg border border-slate-100 leading-relaxed">
                    {t.header.singleAdminNotice}
                  </div>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => { setUserDropdownOpen(false); setIsRbacOpen(true); }}
                    className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{t.header.inviteUserBtn}</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.header.logoutBtn}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* RBAC Modal */}
      <RbacModal
        isOpen={isRbacOpen}
        onClose={() => setIsRbacOpen(false)}
        currentUserRole={activeRoleName}
      />
    </>
  );
}
