'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import MetricCards from '@/components/MetricCards';
import LoanTable from '@/components/LoanTable';
import ApprovalDrawer from '@/components/ApprovalDrawer';
import { LoanApplicationItem, UserRoleView } from '@/types/loan';
import { getLoans, syncDevLoansAction } from '@/actions/loan';
import { getCurrentSession } from '@/actions/rbac';
import { RefreshCw, CheckCircle, Database, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

// Auto-sync interval: 2 menit
const AUTO_SYNC_INTERVAL_MS = 2 * 60 * 1000;

export default function DashboardPage() {
  const { t } = useLanguage();
  const [loans, setLoans] = useState<LoanApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRoleView>('CREDIT_ANALYST');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [autoSyncCountdown, setAutoSyncCountdown] = useState(AUTO_SYNC_INTERVAL_MS / 1000);

  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedLoan, setSelectedLoan] = useState<LoanApplicationItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

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

  // Silent background sync: tarik data dari MySQL dev tanpa tampilkan loading penuh
  const silentSync = useCallback(async (showBanner = false) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await syncDevLoansAction();
      setLastSyncTime(new Date());
      if (showBanner) {
        setSyncMessage({ text: res.message, success: res.success });
        setTimeout(() => setSyncMessage(null), 5000);
      }
      await loadData();
    } catch (err: any) {
      if (showBanner) {
        setSyncMessage({ text: 'Gagal sinkronisasi dari dev server.', success: false });
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, loadData]);

  // Reset countdown timer
  const resetCountdown = useCallback(() => {
    setAutoSyncCountdown(AUTO_SYNC_INTERVAL_MS / 1000);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setAutoSyncCountdown((prev) => (prev <= 1 ? AUTO_SYNC_INTERVAL_MS / 1000 : prev - 1));
    }, 1000);
  }, []);

  // On mount: auto-sync immediately + setup interval
  useEffect(() => {
    // Jalankan sync pertama kali saat halaman dibuka
    silentSync(false).then(() => {
      resetCountdown();
    });

    // Auto-sync setiap AUTO_SYNC_INTERVAL_MS
    syncIntervalRef.current = setInterval(() => {
      silentSync(false).then(() => resetCountdown());
    }, AUTO_SYNC_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDrawer = (loan: LoanApplicationItem) => {
    setSelectedLoan(loan);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleSyncDev = async () => {
    resetCountdown();
    await silentSync(true);
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

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              {/* Auto-sync live indicator */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100/80 rounded-lg px-2.5 py-1.5 border border-slate-200">
                <Wifi className={`h-3 w-3 ${isSyncing ? 'text-blue-500 animate-pulse' : 'text-emerald-500'}`} />
                <span>
                  {isSyncing
                    ? t.workflow.syncing
                    : lastSyncTime
                    ? t.workflow.syncedAgo(
                        Math.floor((Date.now() - lastSyncTime.getTime()) / 1000),
                        autoSyncCountdown
                      )
                    : t.workflow.connecting}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncDev}
                disabled={isSyncing || loading}
                className="h-9 gap-2 text-xs border-blue-200 bg-blue-50/50 hover:bg-blue-100/80 text-blue-700 font-semibold shadow-xs"
                title={t.workflow.syncNowTooltip}
              >
                <Database className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-blue-600'}`} />
                <span>{isSyncing ? t.workflow.syncing : t.workflow.syncNow}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                disabled={loading || isSyncing}
                className="h-9 gap-2 text-xs border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{t.common.refresh}</span>
              </Button>
            </div>
          </div>

          {/* Sync notification banner */}
          {syncMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
                syncMessage.success
                  ? 'bg-emerald-50/90 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50/90 text-rose-800 border-rose-200'
              }`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{syncMessage.text}</span>
            </div>
          )}

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
