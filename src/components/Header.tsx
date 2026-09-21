'use client';

import React from 'react';
import { UserRoleView } from '@/types/loan';
import { ShieldCheck, UserCheck, Banknote, Database, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface HeaderProps {
  currentRole: UserRoleView;
  onRoleChange: (role: UserRoleView) => void;
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
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

        {/* Right Controls: Language Switcher & DB Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher Buttons */}
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

          {/* DB Status Badge */}
          <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            <span>{t.header.dbStatus}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
