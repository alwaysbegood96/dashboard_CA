'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import MetricCards from '@/components/MetricCards';
import LoanTable from '@/components/LoanTable';
import ApprovalDrawer from '@/components/ApprovalDrawer';
import { LoanApplicationItem, UserRoleView } from '@/types/loan';
import { getLoans } from '@/actions/loan';
import { getCurrentSession } from '@/actions/rbac';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardPage() {
  const { t } = useLanguage();
  const [loans, setLoans] = useState<LoanApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRoleView>('CREDIT_ANALYST');

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState<LoanApplicationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  // Fetch loans from DB & current user session
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [data, session] = await Promise.all([getLoans(), getCurrentSession()]);
      setLoans(data);
      setSessionUser(session);

      if (session) {
        if (session.role === 'SUPER_ADMIN' || session.role === 'ADMIN') {
          setCurrentRole('CREDIT_SUPERVISOR');
        } else {
          setCurrentRole('CREDIT_ANALYST');
        }
      }

      // Update selected loan if drawer is open
      if (selectedLoan) {
        const updated = data.find((l) => l.id === selectedLoan.id);
        if (updated) setSelectedLoan(updated);
      }
    } catch (err) {
      console.error('Failed to load loans:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLoan]);

  // On mount: load loans from database
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDrawer = (loan: LoanApplicationItem) => {
    setSelectedLoan(loan);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} sessionUser={sessionUser} />

      {/* Main Content Canvas */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-7">
        {/* Workflow Guidance & Role Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  {t.workflow.dashboardTitle}
                </span>
                <span className="rounded-full bg-blue-100/70 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                  {t.workflow.dualLayerBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                <strong>{t.workflow.principleTitle}:</strong> {t.workflow.principleText}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading}
                className="h-9 gap-2 text-xs border-slate-200 hover:bg-slate-50 font-medium text-slate-700 shadow-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{t.common.refresh}</span>
              </Button>
            </div>
          </div>

          {/* Workflow Stepper Bar */}
          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${currentRole === 'CREDIT_ANALYST' ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-slate-50/70 border-slate-100 text-slate-600'}`}>
              <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                1
              </div>
              <div>
                <span className="font-semibold block">{t.workflow.step1Title}</span>
                <span className="text-[10px] text-slate-500">{t.workflow.step1Desc}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${currentRole === 'CREDIT_SUPERVISOR' ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900' : 'bg-slate-50/70 border-slate-100 text-slate-600'}`}>
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                2
              </div>
              <div>
                <span className="font-semibold block">{t.workflow.step2Title}</span>
                <span className="text-[10px] text-slate-500">{t.workflow.step2Desc}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 rounded-xl border bg-slate-50/70 border-slate-100 text-slate-600">
              <div className="h-6 w-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                3
              </div>
              <div>
                <span className="font-semibold block">{t.workflow.step3Title}</span>
                <span className="text-[10px] text-slate-500">{t.workflow.step3Desc}</span>
              </div>
            </div>

            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${currentRole === 'DISBURSEMENT_OPS' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-slate-50/70 border-slate-100 text-slate-600'}`}>
              <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                4
              </div>
              <div>
                <span className="font-semibold block">{t.workflow.step4Title}</span>
                <span className="text-[10px] text-slate-500">{t.workflow.step4Desc}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Statistic Cards */}
        <MetricCards
          loans={loans}
          activeFilter={activeFilter}
          onFilterSelect={setActiveFilter}
        />

        {/* Data Table */}
        <LoanTable
          loans={loans}
          currentRole={currentRole}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSelectLoan={handleOpenDrawer}
        />
      </main>

      {/* Interactive Approval Drawer */}
      <ApprovalDrawer
        loan={selectedLoan}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        currentRole={currentRole}
        onSuccess={loadData}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          {t.footer.copyright}
        </div>
      </footer>
    </div>
  );
}
