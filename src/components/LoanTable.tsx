'use client';

import React, { useState } from 'react';
import { LoanApplicationItem, UserRoleView } from '@/types/loan';
import { formatRupiah } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface LoanTableProps {
  loans: LoanApplicationItem[];
  currentRole: UserRoleView;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onSelectLoan: (loan: LoanApplicationItem) => void;
}

export default function LoanTable({
  loans,
  currentRole,
  activeFilter,
  onFilterChange,
  onSelectLoan,
}: LoanTableProps) {
  const { t, formatDateByLang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter loans based on tab and search
  const filteredLoans = loans.filter((loan) => {
    // 1. Tab filter
    if (activeFilter === 'LAYER_1_CA' && loan.status !== 'UNDER_REVIEW_CA') return false;
    if (activeFilter === 'LAYER_2_SPV' && loan.status !== 'WAITING_SPV_APPROVAL') return false;
    if (activeFilter === 'CUSTOMER_OFFERING' && loan.status !== 'OFFERING_CUSTOMER') return false;
    if (activeFilter === 'DISBURSEMENT' && loan.status !== 'READY_FOR_DISBURSEMENT') return false;
    if (activeFilter === 'PAYMENT_FAILED' && loan.status !== 'PAYMENT_FAILED') return false;
    if (
      activeFilter === 'HISTORY' &&
      loan.status !== 'DISBURSED' &&
      loan.status !== 'REJECTED_CA' &&
      loan.status !== 'REJECTED_SPV'
    ) {
      return false;
    }

    // 2. Search query filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = loan.applicantName.toLowerCase().includes(q);
      const matchOrder = loan.orderNo.toLowerCase().includes(q);
      const matchId = loan.idNo.toLowerCase().includes(q);
      return matchName || matchOrder || matchId;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAYMENT_FAILED':
        return <Badge variant="warning" className="bg-amber-50 text-amber-800 border-amber-300 font-medium">{t.table.statusPaymentFailed}</Badge>;
      case 'UNDER_REVIEW_CA':
        return <Badge variant="info">{t.table.statusUnderReviewCa}</Badge>;
      case 'WAITING_SPV_APPROVAL':
        return <Badge variant="warning">{t.table.statusWaitingSpv}</Badge>;
      case 'OFFERING_CUSTOMER':
        return <Badge variant="purple">{t.table.statusOfferingCustomer}</Badge>;
      case 'READY_FOR_DISBURSEMENT':
        return <Badge variant="success">{t.table.statusReadyDisbursement}</Badge>;
      case 'DISBURSED':
        return <Badge variant="success">{t.table.statusDisbursed}</Badge>;
      case 'REJECTED_CA':
        return <Badge variant="destructive">{t.table.statusRejectedCa}</Badge>;
      case 'REJECTED_SPV':
        return <Badge variant="destructive">{t.table.statusRejectedSpv}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      {/* Table Toolbar (Tabs & Search) */}
      <div className="p-5 border-b border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {t.table.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.table.subtitle}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t.table.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50/70 border-slate-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="overflow-x-auto pb-1">
          <Tabs value={activeFilter} onValueChange={onFilterChange} className="w-full">
            <TabsList className="bg-slate-100/90 h-9 p-0.5">
              <TabsTrigger value="ALL">{t.table.tabAll(loans.length)}</TabsTrigger>
              <TabsTrigger value="PAYMENT_FAILED">
                <span className="text-amber-700 font-semibold">
                  {t.table.tabCanceled(loans.filter((l) => l.status === 'PAYMENT_FAILED').length)}
                </span>
              </TabsTrigger>
              <TabsTrigger value="LAYER_1_CA">
                {t.table.tabCa(loans.filter((l) => l.status === 'UNDER_REVIEW_CA').length)}
              </TabsTrigger>
              <TabsTrigger value="LAYER_2_SPV">
                {t.table.tabSpv(loans.filter((l) => l.status === 'WAITING_SPV_APPROVAL').length)}
              </TabsTrigger>
              <TabsTrigger value="CUSTOMER_OFFERING">
                {t.table.tabCustomer(loans.filter((l) => l.status === 'OFFERING_CUSTOMER').length)}
              </TabsTrigger>
              <TabsTrigger value="DISBURSEMENT">
                {t.table.tabDisbursement(loans.filter((l) => l.status === 'READY_FOR_DISBURSEMENT').length)}
              </TabsTrigger>
              <TabsTrigger value="HISTORY">
                {t.table.tabHistory(
                  loans.filter(
                    (l) =>
                      l.status === 'DISBURSED' ||
                      l.status === 'REJECTED_CA' ||
                      l.status === 'REJECTED_SPV'
                  ).length
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Table Component */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">{t.table.colOrderNo} & {t.common.date}</TableHead>
            <TableHead>{t.table.colApplicant}</TableHead>
            <TableHead className="text-right">{t.drawer.requestedLabel}</TableHead>
            <TableHead className="text-right">{t.drawer.approvedLabel}</TableHead>
            <TableHead className="text-center">{t.drawer.recommendedTenor}</TableHead>
            <TableHead className="text-center">{t.table.colDsrRisk}</TableHead>
            <TableHead>{t.table.colStatus}</TableHead>
            <TableHead className="text-right pr-6">{t.table.colAction}</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredLoans.length > 0 ? (
            filteredLoans.map((loan) => (
              <TableRow
                key={loan.id}
                onClick={() => onSelectLoan(loan)}
                className="cursor-pointer transition-colors hover:bg-blue-50/30"
              >
                {/* No Order & Date */}
                <TableCell className="font-mono text-xs">
                  <div className="font-semibold text-slate-800">{loan.orderNo}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formatDateByLang(loan.createdAt)}
                  </div>
                </TableCell>

                {/* Debitur Name & NIK */}
                <TableCell>
                  <div className="font-semibold text-slate-900 text-sm">
                    {loan.applicantName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>NIK: {loan.idNo}</span>
                    <span>•</span>
                    <span>{loan.phone}</span>
                  </div>
                </TableCell>

                {/* Requested Amount */}
                <TableCell className="text-right tabular-nums font-medium text-slate-700">
                  {formatRupiah(loan.requestedAmount)}
                </TableCell>

                {/* Approved Amount */}
                <TableCell className="text-right tabular-nums">
                  {loan.approvedAmount ? (
                    <span className="font-bold text-blue-700">
                      {formatRupiah(loan.approvedAmount)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">—</span>
                  )}
                </TableCell>

                {/* Tenor */}
                <TableCell className="text-center text-xs text-slate-700 font-medium">
                  {loan.approvedTenor || loan.tenorMonth} {t.common.months}
                </TableCell>

                {/* Scoring & DSR */}
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        loan.dsrRatio > 40
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      DSR {loan.dsrRatio}%
                    </span>
                    <span className="text-slate-500 font-normal">Score: {loan.creditScore}</span>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>{getStatusBadge(loan.status)}</TableCell>

                {/* Action CTA */}
                <TableCell className="text-right pr-6" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs border-slate-300 hover:border-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => onSelectLoan(loan)}
                  >
                    <span>{t.table.actionReviewDecide}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-slate-400 italic text-sm">
                {t.table.emptyTitle}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
