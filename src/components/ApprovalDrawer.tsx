'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LoanApplicationItem, UserRoleView } from '@/types/loan';
import { formatRupiah } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import {
  calculateLoanRepayment,
  calculateDsr,
  LoanRepaymentCalculation,
} from '@/lib/loan-calculator';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  submitCaReview,
  rejectByCa,
  submitSpvApproval,
  returnToCa,
  rejectBySpv,
  submitCustomerAcceptance,
  executeDisbursement,
  updateLoanScoring,
} from '@/actions/loan';
import {
  User,
  MapPin,
  Phone,
  Briefcase,
  ShieldCheck,
  History,
  Send,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Banknote,
  AlertTriangle,
  FileCheck,
  Smartphone,
  ScanFace,
  PhoneCall,
  PhoneIncoming,
  TrendingDown,
  Calendar,
  Save,
  Calculator,
} from 'lucide-react';

interface ApprovalDrawerProps {
  loan: LoanApplicationItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRoleView;
  onSuccess: () => void;
}

/**
 * Komponen Card Rencana Pembayaran & Jadwal Angsuran
 * Mengikuti kalkulasi resmi Mobile Banking Bank Sentosa:
 * - Plafon Diminta vs Dana Diterima Nasabah (dipotong biaya layanan 6% di muka)
 * - Rincian Angsuran 1 (Pokok 334.000 + Bunga 30.000 = Rp 364.000)
 * - Rincian Angsuran 2 & 3 (Pokok 333.000 + Bunga 30.000 = Rp 363.000)
 */
function RepaymentScheduleCard({
  repaymentPlan,
  isDisbursed,
}: {
  repaymentPlan: LoanRepaymentCalculation;
  isDisbursed: boolean;
}) {
  const [showTable, setShowTable] = useState(true);
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-blue-200/90 bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-white p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            {t.drawer.repaymentPlanTitle}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold ${
            isDisbursed
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}
        >
          {isDisbursed ? t.drawer.badgeDefinitive : t.drawer.badgeSimulation}
        </Badge>
      </div>

      {/* HIGHLIGHT: Plafon vs Dana Yang Diterima Nasabah */}
      <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
            {t.drawer.netReceivedAmount}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-extrabold text-emerald-800 tabular-nums">
              {formatRupiah(repaymentPlan.netDisbursedAmount)}
            </span>
            <span className="text-[11px] text-emerald-700">
              {t.drawer.netDisbursedNote}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right text-[11px] text-slate-600 bg-white/70 sm:bg-transparent p-2 sm:p-0 rounded border sm:border-0 border-emerald-100">
          <div>{t.drawer.approvedLabel}: <strong className="text-slate-800 tabular-nums">{formatRupiah(repaymentPlan.principalAmount)}</strong></div>
          <div className="text-rose-600">
            {t.drawer.serviceFee} ({repaymentPlan.serviceFeeRate}% {t.drawer.upfrontFeeSuffix}): -{formatRupiah(repaymentPlan.serviceFee)}
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
        <div className="rounded-lg bg-white border border-slate-200/80 p-2.5 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            {t.drawer.totalRepaymentLabel}
          </span>
          <span className="text-sm font-bold text-slate-900 tabular-nums block mt-0.5">
            {formatRupiah(repaymentPlan.totalRepayment)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">{t.drawer.tenorLabel} {repaymentPlan.tenorMonth} {t.drawer.monthsLabel}</span>
        </div>

        <div className="rounded-lg bg-white border border-slate-200/80 p-2.5 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            {t.drawer.loanInterestLabel}
          </span>
          <span className="text-sm font-bold text-slate-700 tabular-nums block mt-0.5">
            {formatRupiah(repaymentPlan.totalInterest)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">{repaymentPlan.dailyInterestRate}</span>
        </div>

        <div className="rounded-lg bg-white border border-slate-200/80 p-2.5 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            {t.drawer.serviceFee}
          </span>
          <span className="text-sm font-bold text-slate-700 tabular-nums block mt-0.5">
            {formatRupiah(repaymentPlan.serviceFee)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">{repaymentPlan.serviceFeeRate}% {t.drawer.upfrontFeeSuffix}</span>
        </div>

        <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-2.5 shadow-2xs">
          <span className="text-[10px] text-blue-500 font-semibold uppercase block">
            {t.drawer.firstInstallmentLabel}
          </span>
          <span className="text-sm font-bold text-blue-700 tabular-nums block mt-0.5">
            {formatRupiah(repaymentPlan.monthlyInstallment)}
          </span>
          <span className="text-[9px] text-blue-500 block mt-0.5">{t.drawer.principalPlusInterest}</span>
        </div>
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg leading-relaxed">
        <AlertTriangle className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
        <span>{t.drawer.repaymentRoundingNote}</span>
      </div>

      {/* Detail list / Table */}
      <div className="pt-1">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-bold text-slate-700">
            {t.drawer.scheduleDueDetail}
          </span>
          <button
            type="button"
            onClick={() => setShowTable(!showTable)}
            className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
          >
            {showTable ? t.drawer.hideSchedule : t.drawer.viewScheduleDetail}
          </button>
        </div>

        {showTable && (
          <div className="rounded-lg border border-slate-200 bg-white overflow-hidden text-xs shadow-2xs divide-y divide-slate-100">
            {repaymentPlan.schedule.map((item) => (
              <div key={item.installmentNo} className="p-3 hover:bg-blue-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.installmentNo}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {t.drawer.installmentLabel} {item.installmentNo}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3 text-blue-500 inline" />
                      <span>{t.drawer.dueDateLabel}: <strong>{item.dueDateFormatted}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right pl-10 sm:pl-0">
                  <div className="text-sm font-extrabold text-blue-700 tabular-nums">
                    {formatRupiah(item.totalInstallment)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {t.drawer.includedPrincipal} {formatRupiah(item.principalAmount)} + {t.drawer.includedInterest} {formatRupiah(item.interestAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


export default function ApprovalDrawer({
  loan,
  isOpen,
  onClose,
  currentRole,
  onSuccess,
}: ApprovalDrawerProps) {
  const { t, formatDateByLang, formatAuditNote, formatLoanType } = useLanguage();

  // ⚠️ All hooks must be called unconditionally (Rules of Hooks)
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [approvedTenor, setApprovedTenor] = useState<number>(1);
  const [caNotes, setCaNotes] = useState<string>('');
  const [teleVerify, setTeleVerify] = useState<string>('');
  const [callRelat, setCallRelat] = useState<string>('');
  const [spvNotes, setSpvNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isReturning, setIsReturning] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('profil');

  // State untuk input & penyesuaian manual Scoring & SLIK oleh CA
  const [slikStatus, setSlikStatus] = useState<string>('LANCAR');
  const [creditScore, setCreditScore] = useState<number>(750);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(12000000);
  const [dsrRatio, setDsrRatio] = useState<number>(28.5);

  // Sync state when loan changes
  useEffect(() => {
    if (loan) {
      setApprovedAmount(loan.approvedAmount || loan.requestedAmount);
      setApprovedTenor(loan.approvedTenor || loan.tenorMonth);
      setCaNotes(loan.caNotes || '');
      setTeleVerify(loan.teleVerify || '');
      setCallRelat(loan.callRelat || '');
      setSpvNotes(loan.spvNotes || '');
      setSlikStatus(loan.slikStatus || 'LANCAR');
      setCreditScore(loan.creditScore || 750);
      setMonthlyIncome(loan.monthlyIncome || 12000000);
      setDsrRatio(loan.dsrRatio || 28.5);
      setRejectionReason('');
      setIsRejecting(false);
      setIsReturning(false);
      setFeedbackMsg(null);
      // Smart default tab based on loan status
      if (loan.status === 'UNDER_REVIEW_CA') setActiveTab('ca-review');
      else if (loan.status === 'WAITING_SPV_APPROVAL') setActiveTab('spv-review');
      else if (loan.status === 'OFFERING_CUSTOMER' || loan.status === 'READY_FOR_DISBURSEMENT') setActiveTab('spv-review');
      else setActiveTab('profil');
    }
  }, [loan]);

  // Kalkulasi dinamis jadwal angsuran dan cicilan bulanan
  const isDisbursed = loan ? loan.status === 'DISBURSED' : false;
  const activePrincipal = approvedAmount || (loan ? loan.approvedAmount || loan.requestedAmount : 1000000);
  const activeTenor = approvedTenor || (loan ? loan.approvedTenor || loan.tenorMonth : 1);
  const activeRate = loan?.interestRate || 3.0;

  const repaymentPlan = useMemo(() => {
    return calculateLoanRepayment(
      activePrincipal,
      activeTenor,
      activeRate,
      isDisbursed && loan?.updatedAt ? loan.updatedAt : new Date(),
      isDisbursed
    );
  }, [activePrincipal, activeTenor, activeRate, isDisbursed, loan?.updatedAt]);

  // ✅ Early return AFTER all hooks
  if (!loan) return null;

  // ─── Handlers ────────────────────────────────────────────────────
  const handleSaveScoring = async () => {
    setLoading(true);
    setFeedbackMsg(null);
    const res = await updateLoanScoring(loan.id, {
      slikStatus,
      creditScore: Number(creditScore),
      monthlyIncome: Number(monthlyIncome),
      dsrRatio: Number(dsrRatio),
    });
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastScoringSaved, type: 'success' });
      onSuccess();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg({ text: res.error || t.drawer.toastScoringSaveFailed, type: 'error' });
    }
  };

  const handleCaSubmit = async () => {
    setLoading(true);
    setFeedbackMsg(null);
    const res = await submitCaReview(loan.id, {
      approvedAmount: Number(approvedAmount),
      approvedTenor: Number(approvedTenor),
      caNotes,
      teleVerify,
      callRelat,
      slikStatus,
      creditScore: Number(creditScore),
      monthlyIncome: Number(monthlyIncome),
      dsrRatio: Number(dsrRatio),
    });
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastCaSentToSpv, type: 'success' });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } else {
      setFeedbackMsg({ text: res.error || t.drawer.toastCaSaveFailed, type: 'error' });
    }
  };


  const handleCaReject = async () => {
    if (!rejectionReason.trim()) { alert(t.drawer.alertRejectReasonReq); return; }
    setLoading(true);
    const res = await rejectByCa(loan.id, rejectionReason);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastCaRejected, type: 'success' });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    }
  };

  const handleSpvApprove = async () => {
    setLoading(true);
    const res = await submitSpvApproval(loan.id, spvNotes);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastSpvApproved, type: 'success' });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    }
  };

  const handleSpvReturn = async () => {
    if (!spvNotes.trim()) { alert(t.drawer.alertReturnReasonReq); return; }
    setLoading(true);
    const res = await returnToCa(loan.id, spvNotes);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastSpvReturned, type: 'success' });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    }
  };

  const handleSpvReject = async () => {
    if (!rejectionReason.trim()) { alert(t.drawer.alertSpvRejectReasonReq); return; }
    setLoading(true);
    const res = await rejectBySpv(loan.id, rejectionReason);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastSpvRejected, type: 'success' });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    }
  };

  const handleCustomerAction = async (accept: boolean) => {
    setLoading(true);
    const res = await submitCustomerAcceptance(loan.id, accept);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({
        text: accept ? t.drawer.toastCustomerAccepted : t.drawer.toastCustomerDeclined,
        type: 'success',
      });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    }
  };

  const handleDisburse = async () => {
    setLoading(true);
    const res = await executeDisbursement(loan.id);
    setLoading(false);
    if (res.success) {
      setFeedbackMsg({ text: t.drawer.toastDisbursedSuccess, type: 'success' });
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    }
  };

  // ─── Status badge ─────────────────────────────────────────────────
  const renderStatusBadge = () => {
    switch (loan.status) {
      case 'PAYMENT_FAILED':      return <Badge variant="warning" className="bg-amber-50 text-amber-800 border-amber-300 font-medium">{t.table.statusPaymentFailed}</Badge>;
      case 'UNDER_REVIEW_CA':     return <Badge variant="info">{t.table.statusUnderReviewCa}</Badge>;
      case 'WAITING_SPV_APPROVAL':return <Badge variant="warning">{t.table.statusWaitingSpv}</Badge>;
      case 'OFFERING_CUSTOMER':   return <Badge variant="purple">{t.table.statusOfferingCustomer}</Badge>;
      case 'READY_FOR_DISBURSEMENT': return <Badge variant="success">{t.table.statusReadyDisbursement}</Badge>;
      case 'DISBURSED':           return <Badge variant="success">{t.table.statusDisbursed}</Badge>;
      case 'REJECTED_CA':         return <Badge variant="destructive">{t.table.statusRejectedCa}</Badge>;
      case 'REJECTED_SPV':        return <Badge variant="destructive">{t.table.statusRejectedSpv}</Badge>;
      default:                    return <Badge variant="outline">{loan.status}</Badge>;
    }
  };

  // ─── DSR Visual Bar ───────────────────────────────────────────────
  const dsrPercent = Math.min(Number(loan.dsrRatio), 100);
  const dsrColor = dsrPercent > 40 ? 'bg-rose-500' : dsrPercent > 30 ? 'bg-amber-500' : 'bg-emerald-500';

  // ─── Info Row Helper ──────────────────────────────────────────────
  const InfoRow = ({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) =>
    value != null && value !== '' ? (
      <div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold block">{label}</span>
        <span className={`text-xs text-slate-800 font-medium mt-0.5 block ${mono ? 'font-mono' : ''}`}>{value}</span>
      </div>
    ) : null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-2xl bg-white p-0 flex flex-col overflow-hidden">

        {/* ── Drawer Header ────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center justify-between pr-8">
            <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              #{loan.orderNo}
            </span>
            {renderStatusBadge()}
          </div>
          <SheetTitle className="text-xl font-bold text-slate-900 mt-2 leading-tight">
            {loan.applicantName}
          </SheetTitle>
          <SheetDescription className="text-xs text-slate-500 mt-1">
            {formatLoanType(loan.loanType)} • {formatDateByLang(loan.createdAt)}
          </SheetDescription>

          {/* Amount summary pills */}
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">{t.drawer.requestedLabel}</span>
              <span className="text-sm font-bold text-slate-800 tabular-nums">{formatRupiah(loan.requestedAmount)}</span>
            </div>
            <div className="text-slate-300 text-lg">→</div>
            <div className="flex-1 rounded-lg bg-blue-50 border border-blue-200 p-2.5 text-center">
              <span className="text-[10px] text-blue-500 font-semibold uppercase block">{t.drawer.approvedLabel}</span>
              <span className="text-sm font-bold text-blue-700 tabular-nums">
                {loan.approvedAmount ? formatRupiah(loan.approvedAmount) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Feedback Banner ──────────────────────────────────────── */}
        {feedbackMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-lg text-xs font-medium border flex items-center gap-2 shrink-0 ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {feedbackMsg.text}
          </div>
        )}

        {/* ── Tabs ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 border-b border-slate-100 shrink-0">
              <TabsList className="bg-slate-100/80 h-9 p-0.5 gap-0.5 w-full">
                <TabsTrigger value="profil" className="flex-1 text-[11px] font-semibold px-2">
                  {t.drawer.tabProfile}
                </TabsTrigger>
                <TabsTrigger value="scoring" className="flex-1 text-[11px] font-semibold px-2">
                  {t.drawer.tabScoring}
                </TabsTrigger>
                <TabsTrigger value="ca-review" className="flex-1 text-[11px] font-semibold px-2">
                  {t.drawer.tabCaReview}
                </TabsTrigger>
                <TabsTrigger value="spv-review" className="flex-1 text-[11px] font-semibold px-2">
                  {t.drawer.tabSpvReview}
                </TabsTrigger>
                <TabsTrigger value="audit" className="flex-1 text-[11px] font-semibold px-2">
                  {t.drawer.tabAuditTrail}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── TAB 1: Profil & Alamat ─────────────────────────── */}
            <TabsContent value="profil" className="flex-1 overflow-y-auto px-6 py-5 space-y-5 m-0">
              {/* Identitas */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <User className="h-4 w-4 text-blue-600" />
                  {t.drawer.secIdentity}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label={t.drawer.nikLabel} value={loan.idNo} mono />
                  <InfoRow label={t.drawer.phoneLabel} value={loan.phone} mono />
                  <InfoRow label={t.drawer.disbursementAccount} value={`${loan.bankName} - ${loan.accountNo}`} />
                  <InfoRow label={t.drawer.monthlyIncome} value={formatRupiah(loan.monthlyIncome)} />
                  <InfoRow label={t.drawer.cifStatus} value={loan.cif ? `CIF: ${loan.cif}` : t.drawer.cifNotRegistered} mono />
                  <InfoRow label={t.drawer.motherName} value={loan.motherName} />
                </div>
              </div>

              {/* Pekerjaan */}
              {(loan.companyName || loan.jobType) && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                    {t.drawer.secEmployment}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label={t.drawer.jobType} value={loan.jobType} />
                    <InfoRow label={t.drawer.companyName} value={loan.companyName} />
                  </div>
                </div>
              )}

              {/* Alamat */}
              {(loan.streetAddress || loan.city || loan.province) && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <MapPin className="h-4 w-4 text-rose-500" />
                    {t.drawer.secAddress}
                  </div>
                  <div className="space-y-2">
                    {loan.streetAddress && (
                      <p className="text-xs text-slate-800">{loan.streetAddress}</p>
                    )}
                    <div className="flex gap-3">
                      <InfoRow label={t.drawer.cityLabel} value={loan.city} />
                      <InfoRow label={t.drawer.provinceLabel} value={loan.province} />
                    </div>
                  </div>
                </div>
              )}

              {/* Kontak Darurat */}
              {(loan.emergencyName || loan.emergencyPhone) && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Phone className="h-4 w-4 text-amber-600" />
                    {t.drawer.secEmergency}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label={t.drawer.emergencyName} value={loan.emergencyName} />
                    <InfoRow label={t.drawer.emergencyRelation} value={loan.emergencyRelation} />
                    <InfoRow label={t.drawer.phoneLabel} value={loan.emergencyPhone} mono />
                  </div>
                </div>
              )}

              {/* Pesan jika belum ada profil lengkap */}
              {!loan.companyName && !loan.streetAddress && !loan.emergencyName && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center">
                  <p className="text-xs text-slate-400 italic">
                    {t.drawer.profileIncomplete}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 2: Verifikasi & Scoring ─────────────────────── */}
            <TabsContent value="scoring" className="flex-1 overflow-y-auto px-6 py-5 space-y-5 m-0">
              {/* Note about Manual Scoring / SLIK */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 flex items-start gap-2.5 shadow-2xs">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">{t.drawer.slikManualNoticeTitle}</span>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {t.drawer.slikManualNoticeDesc}
                  </p>
                </div>
              </div>

              {/* Kredit Score & SLIK Editable Form */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    {t.drawer.scoringTitle}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleSaveScoring}
                    disabled={loading}
                    className="h-8 gap-1.5 text-xs border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100 font-semibold cursor-pointer shadow-2xs"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{t.drawer.saveScoring}</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* SLIK Status Dropdown */}
                  <div>
                    <Label className="text-[11px] font-bold text-slate-700">{t.drawer.slikStatusLabel}</Label>
                    <select
                      value={slikStatus}
                      onChange={(e) => setSlikStatus(e.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:outline-blue-600"
                    >
                      <option value="LANCAR">{t.drawer.slikKol1}</option>
                      <option value="PERHATIAN_KHUSUS">{t.drawer.slikKol2}</option>
                      <option value="KURANG_LANCAR">{t.drawer.slikKol3}</option>
                      <option value="DIRAGUKAN">{t.drawer.slikKol4}</option>
                      <option value="MACET">{t.drawer.slikKol5}</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {t.drawer.slikStatusDesc}
                    </span>
                  </div>

                  {/* Credit Score Input */}
                  <div>
                    <Label className="text-[11px] font-bold text-slate-700">{t.drawer.creditScoreLabel}</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        min={300}
                        max={850}
                        value={creditScore}
                        onChange={(e) => setCreditScore(Number(e.target.value))}
                        className="h-9 text-xs font-bold text-blue-700 tabular-nums"
                      />
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] font-semibold ${
                          creditScore >= 750
                            ? 'text-emerald-700 border-emerald-300 bg-emerald-50'
                            : creditScore >= 650
                            ? 'text-blue-700 border-blue-300 bg-blue-50'
                            : creditScore >= 550
                            ? 'text-amber-700 border-amber-300 bg-amber-50'
                            : 'text-rose-700 border-rose-300 bg-rose-50'
                        }`}
                      >
                        {creditScore >= 750
                          ? t.drawer.scoringExcellent
                          : creditScore >= 650
                          ? t.drawer.scoringGood
                          : creditScore >= 550
                          ? t.drawer.scoringFair
                          : t.drawer.scoringHighRisk}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {t.drawer.creditScoreDesc}
                    </span>
                  </div>

                  {/* Penghasilan Bulanan Terverifikasi */}
                  <div>
                    <Label className="text-[11px] font-bold text-slate-700">
                      {t.drawer.monthlyIncomeVerified}
                    </Label>
                    <Input
                      type="number"
                      step={500000}
                      value={monthlyIncome}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setMonthlyIncome(val);
                        if (val > 0) {
                          setDsrRatio(calculateDsr(repaymentPlan.monthlyInstallment, val));
                        }
                      }}
                      className="h-9 text-xs font-semibold tabular-nums mt-1"
                    />
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {t.drawer.nominalLabel}: {formatRupiah(monthlyIncome)}
                    </span>
                  </div>

                  {/* DSR Ratio (%) */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-slate-700">{t.drawer.dsrRatioLabel}</Label>
                      <button
                        type="button"
                        onClick={() => setDsrRatio(calculateDsr(repaymentPlan.monthlyInstallment, monthlyIncome))}
                        className="text-[10px] text-blue-600 hover:underline cursor-pointer flex items-center gap-1 font-medium"
                      >
                        <Calculator className="h-3 w-3" />
                        {t.drawer.autoCalc}
                      </button>
                    </div>
                    <Input
                      type="number"
                      step={0.1}
                      value={dsrRatio}
                      onChange={(e) => setDsrRatio(Number(e.target.value))}
                      className="h-9 text-xs font-bold tabular-nums mt-1"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      {t.drawer.dsrCalcFormula}
                    </span>
                  </div>
                </div>

                {/* DSR Visual Bar */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <TrendingDown className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-xs font-semibold text-slate-600">{t.drawer.dsrCapacity}</span>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        dsrRatio > 40 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {dsrRatio}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        dsrRatio > 40 ? 'bg-rose-500' : dsrRatio > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(dsrRatio, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0%</span>
                    <span className={`font-semibold ${dsrRatio > 40 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {t.drawer.dsrSafeLimit}
                    </span>
                    <span>100%</span>
                  </div>
                  {dsrRatio > 40 && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      DSR {dsrRatio}% {t.drawer.dsrWarning}
                    </div>
                  )}
                </div>
              </div>

              {/* Rincian Cicilan Pinjaman Singkat di Tab Scoring */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    {t.drawer.repaymentObligationTitle}
                  </div>
                  <span className="text-[10px] text-slate-400">{t.drawer.interestFlatLabel} {loan.interestRate}%{t.drawer.perMonthSuffix}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t.drawer.monthlyInstallmentLabel}</span>
                    <span className="text-base font-bold text-blue-700 tabular-nums">
                      {formatRupiah(repaymentPlan.monthlyInstallment)}{t.drawer.perMonthSuffix}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t.drawer.totalInterestLabel}</span>
                    <span className="text-base font-bold text-slate-800 tabular-nums">
                      {formatRupiah(repaymentPlan.totalInterest)}
                    </span>
                  </div>
                </div>
              </div>


              {/* Device & Biometrik */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Smartphone className="h-4 w-4 text-purple-600" />
                  {t.drawer.secDeviceBiometric}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {loan.deviceModel ? (
                    <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                      <span className="text-[10px] text-purple-400 uppercase font-semibold block">{t.drawer.deviceModelLabel}</span>
                      <span className="text-xs font-semibold text-purple-900 mt-0.5 block">{loan.deviceModel}</span>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 p-3">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t.drawer.deviceModelLabel}</span>
                      <span className="text-xs text-slate-400 italic mt-0.5 block">{t.drawer.notAvailable}</span>
                    </div>
                  )}

                  {loan.faceScore ? (
                    <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3">
                      <div className="flex items-center gap-1.5">
                        <ScanFace className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[10px] text-indigo-400 uppercase font-semibold">{t.drawer.faceMatchScore}</span>
                      </div>
                      <span className="text-lg font-bold text-indigo-700 mt-1 block tabular-nums">{loan.faceScore}</span>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 border border-dashed border-slate-200 p-3">
                      <div className="flex items-center gap-1.5">
                        <ScanFace className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">{t.drawer.faceMatchScore}</span>
                      </div>
                      <span className="text-xs text-slate-400 italic mt-0.5 block">{t.drawer.notAvailable}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Catatan Telepon Debitur (jika sudah diisi CA) */}
              {(loan.teleVerify || loan.callRelat) && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
                    <PhoneCall className="h-4 w-4" />
                    {t.drawer.teleVerifyResults}
                  </div>
                  {loan.teleVerify && (
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t.drawer.teleVerifyLabel}</span>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{loan.teleVerify}</p>
                    </div>
                  )}
                  {loan.callRelat && (
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t.drawer.callRelatLabel}</span>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">{loan.callRelat}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ── TAB 3: Review CA ─────────────────────────────────── */}
            <TabsContent value="ca-review" className="flex-1 overflow-y-auto px-6 py-5 space-y-4 m-0">

              {/* Existing CA Notes (read-only if not in CA stage) */}
              {loan.caNotes && loan.status !== 'UNDER_REVIEW_CA' && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-1">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wide block">{t.drawer.caNotesSectionTitle}</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{loan.caNotes}</p>
                </div>
              )}

              {/* Loan amount comparison (read-only display) */}
              {loan.status !== 'UNDER_REVIEW_CA' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-3">{t.drawer.caRecommendationTitle}</span>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[11px] text-slate-500 block">{t.drawer.recommendedPlafon}</span>
                        <span className="text-base font-bold text-blue-700 tabular-nums">
                          {formatRupiah(loan.approvedAmount || loan.requestedAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block">{t.drawer.recommendedTenor}</span>
                        <span className="text-base font-bold text-slate-800">
                          {loan.approvedTenor || loan.tenorMonth} {t.drawer.monthsLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                  <RepaymentScheduleCard repaymentPlan={repaymentPlan} isDisbursed={isDisbursed} />
                </div>
              )}

              {/* ACTION FORM: Only for UNDER_REVIEW_CA */}
              {loan.status === 'UNDER_REVIEW_CA' && (
                <div className="space-y-4">
                  {/* Verifikasi Telepon */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <PhoneCall className="h-4 w-4 text-blue-500" />
                      {t.drawer.teleVerifyChecklistTitle}
                    </div>
                    <div>
                      <Label className="text-[11px]">
                        <PhoneCall className="h-3.5 w-3.5 inline mr-1.5 text-slate-500" />
                        {t.drawer.teleVerifyLabel}
                      </Label>
                      <textarea
                        value={teleVerify}
                        onChange={(e) => setTeleVerify(e.target.value)}
                        placeholder={t.drawer.teleVerifyPlaceholder}
                        className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-blue-600 mt-1 min-h-[60px]"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">
                        <PhoneIncoming className="h-3.5 w-3.5 inline mr-1.5 text-slate-500" />
                        {t.drawer.callRelatLabel}
                      </Label>
                      <textarea
                        value={callRelat}
                        onChange={(e) => setCallRelat(e.target.value)}
                        placeholder={t.drawer.callRelatPlaceholder}
                        className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-blue-600 mt-1 min-h-[60px]"
                      />
                    </div>
                  </div>

                  {/* Rekomendasi Plafon */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <FileCheck className="h-4 w-4 text-emerald-600" />
                      {t.drawer.creditRecommendationTitle}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>{t.drawer.recommendedPlafon}</Label>
                        <Input
                          type="number"
                          value={approvedAmount}
                          onChange={(e) => setApprovedAmount(Number(e.target.value))}
                          className="mt-1 font-semibold tabular-nums"
                        />
                        {/* Quick chips */}
                        <div className="flex gap-1.5 mt-1.5">
                          {[50, 75, 100].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => setApprovedAmount(loan.requestedAmount * pct / 100)}
                              className="text-[10px] bg-white border border-slate-200 hover:bg-slate-50 px-1.5 py-0.5 rounded text-slate-600 cursor-pointer"
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>{t.drawer.tenorLabel}</Label>
                        <select
                          value={approvedTenor}
                          onChange={(e) => setApprovedTenor(Number(e.target.value))}
                          className="mt-1 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-blue-600"
                        >
                          <option value={1}>1 {t.drawer.month30Days}</option>
                          <option value={2}>2 {t.drawer.month60Days}</option>
                          <option value={3}>3 {t.drawer.month90Days}</option>
                          <option value={6}>6 {t.drawer.monthsLabel}</option>
                        </select>
                      </div>
                    </div>

                    {/* Jadwal Angsuran & Jatuh Tempo Dinamis */}
                    <div className="pt-1">
                      <RepaymentScheduleCard repaymentPlan={repaymentPlan} isDisbursed={isDisbursed} />
                    </div>

                    <div>
                      <Label>{t.drawer.caNotesLabel}</Label>
                      <textarea
                        value={caNotes}
                        onChange={(e) => setCaNotes(e.target.value)}
                        placeholder={t.drawer.caNotesPlaceholder}
                        className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-blue-600 mt-1 min-h-[60px]"
                      />
                    </div>
                  </div>


                  {/* Action Buttons */}
                  {isRejecting ? (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-rose-200">
                      <Label className="text-rose-700">{t.drawer.rejectionReasonCa}</Label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={t.drawer.rejectionPlaceholder}
                        className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-rose-600 min-h-[60px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsRejecting(false)}>{t.drawer.btnCancel}</Button>
                        <Button variant="destructive" size="sm" onClick={handleCaReject} disabled={loading}>
                          {t.drawer.btnConfirmReject}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="primary" className="flex-1 gap-2" onClick={handleCaSubmit} disabled={loading}>
                        <Send className="h-4 w-4" />
                        {t.drawer.btnSendToSpv}
                      </Button>
                      <Button
                        variant="outline"
                        className="text-rose-600 hover:bg-rose-50 border-rose-200"
                        onClick={() => setIsRejecting(true)}
                        disabled={loading}
                      >
                        <XCircle className="h-4 w-4" />
                        {t.drawer.btnReject}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Completed/Rejected states */}
              {(loan.status === 'REJECTED_CA') && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm mb-1">
                    <XCircle className="h-4 w-4 text-rose-600" />
                    {t.drawer.rejectedByCa}
                  </div>
                  <p className="text-rose-700">{loan.rejectionReason || '—'}</p>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 4: Supervisor Approval ───────────────────────── */}
            <TabsContent value="spv-review" className="flex-1 overflow-y-auto px-6 py-5 space-y-4 m-0">

              {/* CA Summary (always visible) */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wide block">{t.drawer.caRecommendationTitle}</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">{t.drawer.recommendedPlafon}</span>
                    <span className="text-lg font-bold text-blue-700 tabular-nums">
                      {formatRupiah(loan.approvedAmount || loan.requestedAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">{t.drawer.recommendedTenor}</span>
                    <span className="text-lg font-bold text-slate-800">
                      {loan.approvedTenor || loan.tenorMonth} {t.drawer.monthsLabel}
                    </span>
                  </div>
                </div>
                {loan.caNotes && (
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase block">{t.drawer.caNotesLabel}</span>
                    <p className="text-xs text-slate-700 mt-1 italic">"{loan.caNotes}"</p>
                  </div>
                )}
                <div className="pt-2">
                  <RepaymentScheduleCard repaymentPlan={repaymentPlan} isDisbursed={isDisbursed} />
                </div>
              </div>

              {/* Existing Spv Notes (read-only) */}
              {loan.spvNotes && loan.status !== 'WAITING_SPV_APPROVAL' && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide block mb-1">{t.drawer.spvNotesLabel}</span>
                  <p className="text-xs text-slate-700">{loan.spvNotes}</p>
                </div>
              )}

              {/* ACTION FORM: WAITING_SPV_APPROVAL */}
              {loan.status === 'WAITING_SPV_APPROVAL' && (
                <div className="space-y-4">
                  {isReturning ? (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-amber-200">
                      <Label className="text-amber-800">{t.drawer.returnReasonLabel}</Label>
                      <textarea
                        value={spvNotes}
                        onChange={(e) => setSpvNotes(e.target.value)}
                        placeholder={t.drawer.returnPlaceholder}
                        className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-amber-600 min-h-[60px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsReturning(false)}>{t.drawer.btnCancel}</Button>
                        <Button variant="warning" size="sm" onClick={handleSpvReturn} disabled={loading}>
                          {t.drawer.btnConfirmReturn}
                        </Button>
                      </div>
                    </div>
                  ) : isRejecting ? (
                    <div className="space-y-3 bg-white p-3 rounded-xl border border-rose-200">
                      <Label className="text-rose-700">{t.drawer.rejectionReasonSpv}</Label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder={t.drawer.rejectionPlaceholder}
                        className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-rose-600 min-h-[60px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsRejecting(false)}>{t.drawer.btnCancel}</Button>
                        <Button variant="destructive" size="sm" onClick={handleSpvReject} disabled={loading}>
                          {t.drawer.btnConfirmRejectFinal}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label>{t.drawer.spvNotesOptionalLabel}</Label>
                        <textarea
                          value={spvNotes}
                          onChange={(e) => setSpvNotes(e.target.value)}
                          placeholder={t.drawer.spvNotesOptionalPlaceholder}
                          className="w-full text-xs p-2.5 rounded-md border border-slate-200 bg-white text-slate-900 focus:outline-blue-600 mt-1 min-h-[60px]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="success" className="flex-1 gap-2" onClick={handleSpvApprove} disabled={loading}>
                          <CheckCircle2 className="h-4 w-4" />
                          {t.drawer.btnFinalApprove}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-amber-700 hover:bg-amber-50 border-amber-200"
                          onClick={() => setIsReturning(true)}
                          disabled={loading}
                        >
                          <RotateCcw className="h-4 w-4" />
                          {t.drawer.btnReturnToCa2}
                        </Button>
                        <Button
                          variant="outline"
                          className="text-rose-600 hover:bg-rose-50 border-rose-200"
                          onClick={() => setIsRejecting(true)}
                          disabled={loading}
                        >
                          <XCircle className="h-4 w-4" />
                          {t.drawer.btnReject}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Customer Offering */}
              {loan.status === 'OFFERING_CUSTOMER' && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-purple-200 text-xs">
                  <div className="flex items-center gap-2 text-purple-700 font-semibold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {t.drawer.waitingCustomerConfirmation}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {t.drawer.offeringLetterSentDesc(formatRupiah(loan.approvedAmount))}
                  </p>
                  <Separator />
                  <div className="flex gap-2 pt-1">
                    <Button variant="primary" size="sm" className="flex-1 gap-1.5" onClick={() => handleCustomerAction(true)} disabled={loading}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t.drawer.btnCustomerAccept}
                    </Button>
                    <Button variant="outline" size="sm" className="text-rose-600 border-rose-200" onClick={() => handleCustomerAction(false)} disabled={loading}>
                      {t.drawer.btnCustomerDecline}
                    </Button>
                  </div>
                </div>
              )}

              {/* Ready for Disbursement */}
              {loan.status === 'READY_FOR_DISBURSEMENT' && (
                <div className="space-y-4 bg-white p-4 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {t.drawer.readyToDisbursed}
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 p-3 border border-emerald-100 flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 block text-[11px]">{t.drawer.netDisbursedCustomerLabel}</span>
                      <span className="text-base font-bold text-emerald-800 tabular-nums">
                        {formatRupiah(repaymentPlan.netDisbursedAmount)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {t.drawer.approvedLabel} {formatRupiah(repaymentPlan.principalAmount)} - {t.drawer.serviceFee} ({repaymentPlan.serviceFeeRate}% {t.drawer.upfrontFeeSuffix}: {formatRupiah(repaymentPlan.serviceFee)})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">{t.drawer.recipientAccountLabel}</span>
                      <span className="font-semibold text-slate-800">{loan.accountNo} ({loan.bankName})</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-1.5 text-[11px]">
                    <div className="font-semibold text-slate-700">{t.drawer.coreBankingParamsTitle}:</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>{t.drawer.branchCodeLabel} <span className="font-mono font-medium">{loan.branchCode || '212'}</span></div>
                      <div>{t.drawer.productCodeLabel} <span className="font-mono font-medium">{loan.productCode || '102'}</span></div>
                      <div>{t.drawer.realizationTypeLabel} <span className="font-mono font-medium">{loan.creditType || '700'} (C2)</span></div>
                      <div>{t.drawer.spkNoLabel} <span className="font-mono font-medium">{loan.spkNo || 'Auto Generated'}</span></div>
                    </div>
                  </div>

                  <Button variant="success" size="lg" className="w-full gap-2 text-sm font-semibold cursor-pointer" onClick={handleDisburse} disabled={loading}>
                    <Banknote className="h-5 w-5" />
                    {loading ? t.drawer.processingDisburse : t.drawer.btnDisburse}
                  </Button>
                </div>
              )}

              {/* Disbursed */}
              {loan.status === 'DISBURSED' && (
                <div className="space-y-3 bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    {t.drawer.loanDisbursed}
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {t.drawer.disbursedSuccessDesc}
                  </p>
                  <div className="bg-white/80 border border-emerald-200 rounded-lg p-3 space-y-1 text-[11px]">
                    <div className="text-emerald-900 font-semibold">{t.drawer.ibscoreProofTitle}</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700">
                      <div>{t.drawer.loanAccountNoLabel} <span className="font-mono font-bold text-slate-900">{loan.loanAccountNo || '2121020000404'}</span></div>
                      <div>{t.drawer.receiptNoLabel} <span className="font-mono font-bold text-slate-900">{loan.disbursementReceiptNo || 'TRX-CBS-REALISASI'}</span></div>
                    </div>
                  </div>
                  <RepaymentScheduleCard repaymentPlan={repaymentPlan} isDisbursed={true} />
                </div>
              )}

              {/* SPV Rejected */}
              {loan.status === 'REJECTED_SPV' && (
                <div className="space-y-2 bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <XCircle className="h-5 w-5 text-rose-600" />
                    {t.drawer.rejectedBySpv}
                  </div>
                  <p className="text-rose-700">{loan.rejectionReason || '—'}</p>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 5: Audit Trail ───────────────────────────────── */}
            <TabsContent value="audit" className="flex-1 overflow-y-auto px-6 py-5 m-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <History className="h-4 w-4 text-slate-600" />
                  {t.drawer.auditTitle}
                </div>

                {loan.reviewLogs && loan.reviewLogs.length > 0 ? (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-3 top-3 bottom-3 w-px bg-slate-200" />

                    <div className="space-y-3">
                      {loan.reviewLogs.map((log, idx) => {
                        const actionColor =
                          log.action.includes('REJECT') ? 'bg-rose-500' :
                          log.action.includes('RETURN') ? 'bg-amber-500' :
                          log.action.includes('DISBURSEMENT') ? 'bg-emerald-600' :
                          log.action.includes('APPROVAL') || log.action.includes('ACCEPT') ? 'bg-emerald-500' :
                          'bg-blue-500';

                        return (
                          <div key={log.id} className="flex gap-4 relative">
                            <div className={`h-6 w-6 rounded-full ${actionColor} text-white flex items-center justify-center text-[10px] font-bold shrink-0 z-10 mt-1 shadow-sm`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 rounded-xl border border-slate-100 bg-white p-3 shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800">
                                  {log.operatorName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {formatDateByLang(log.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${actionColor} text-white`}>
                                  {t.drawer.auditActions[log.action] || log.action}
                                </span>
                                <span className="text-[10px] text-slate-400">({t.drawer.auditRoles[log.operatorRole] || log.operatorRole})</span>
                              </div>
                              {(log.amountBefore != null || log.amountAfter != null) && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                  {log.amountBefore != null && (
                                    <span className="tabular-nums">{formatRupiah(log.amountBefore)}</span>
                                  )}
                                  {log.amountBefore != null && log.amountAfter != null && (
                                    <span>→</span>
                                  )}
                                  {log.amountAfter != null && (
                                    <span className="font-semibold text-slate-700 tabular-nums">{formatRupiah(log.amountAfter)}</span>
                                  )}
                                </div>
                              )}
                              {log.notes && (
                                <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-md border border-slate-100 leading-relaxed">
                                  "{formatAuditNote(log.notes)}"
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic text-center py-8 border border-dashed border-slate-200 rounded-xl">
                    {t.drawer.noAuditLog}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
