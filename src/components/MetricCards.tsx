'use client';

import React from 'react';
import { LoanApplicationItem } from '@/types/loan';
import { formatRupiah } from '@/lib/utils';
import { FileText, UserCheck, ShieldAlert, Banknote, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MetricCardsProps {
  loans: LoanApplicationItem[];
  onFilterSelect?: (filter: string) => void;
  activeFilter?: string;
}

export default function MetricCards({ loans, onFilterSelect, activeFilter }: MetricCardsProps) {
  const { t } = useLanguage();
  const countTotal = loans.length;
  const countPaymentFailed = loans.filter((l) => l.status === 'PAYMENT_FAILED').length;
  const countCa = loans.filter((l) => l.status === 'UNDER_REVIEW_CA').length;
  const countSpv = loans.filter((l) => l.status === 'WAITING_SPV_APPROVAL').length;
  const countDisburse = loans.filter((l) => l.status === 'READY_FOR_DISBURSEMENT').length;

  const sumTotalAmount = loans.reduce((acc, l) => acc + l.requestedAmount, 0);
  const sumPaymentFailedAmount = loans
    .filter((l) => l.status === 'PAYMENT_FAILED')
    .reduce((acc, l) => acc + l.requestedAmount, 0);
  const sumCaAmount = loans
    .filter((l) => l.status === 'UNDER_REVIEW_CA')
    .reduce((acc, l) => acc + l.requestedAmount, 0);
  const sumSpvAmount = loans
    .filter((l) => l.status === 'WAITING_SPV_APPROVAL')
    .reduce((acc, l) => acc + (l.approvedAmount || l.requestedAmount), 0);
  const sumDisburseAmount = loans
    .filter((l) => l.status === 'READY_FOR_DISBURSEMENT')
    .reduce((acc, l) => acc + (l.approvedAmount || l.requestedAmount), 0);

  const cards = [
    {
      id: 'ALL',
      title: t.metrics.totalApplications,
      count: countTotal,
      amount: sumTotalAmount,
      label: t.metrics.totalDesc,
      icon: FileText,
      iconBg: 'bg-slate-100 text-slate-700',
      borderHover: 'hover:border-slate-400',
      activeBorder: activeFilter === 'ALL' ? 'ring-2 ring-slate-900 border-slate-900' : '',
    },
    {
      id: 'PAYMENT_FAILED',
      title: t.metrics.canceledDisbursement,
      count: countPaymentFailed,
      amount: sumPaymentFailedAmount,
      label: t.metrics.canceledDesc,
      icon: AlertCircle,
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/60',
      borderHover: 'hover:border-amber-400',
      activeBorder: activeFilter === 'PAYMENT_FAILED' ? 'ring-2 ring-amber-500 border-amber-500' : '',
    },
    {
      id: 'LAYER_1_CA',
      title: t.metrics.caReview,
      count: countCa,
      amount: sumCaAmount,
      label: t.metrics.caDesc,
      icon: UserCheck,
      iconBg: 'bg-blue-50 text-blue-700 border border-blue-200/50',
      borderHover: 'hover:border-blue-400',
      activeBorder: activeFilter === 'LAYER_1_CA' ? 'ring-2 ring-blue-600 border-blue-600' : '',
    },
    {
      id: 'LAYER_2_SPV',
      title: t.metrics.spvApproval,
      count: countSpv,
      amount: sumSpvAmount,
      label: t.metrics.spvDesc,
      icon: ShieldAlert,
      iconBg: 'bg-amber-50 text-amber-700 border border-amber-200/50',
      borderHover: 'hover:border-amber-400',
      activeBorder: activeFilter === 'LAYER_2_SPV' ? 'ring-2 ring-amber-600 border-amber-600' : '',
    },
    {
      id: 'DISBURSEMENT',
      title: t.metrics.readyDisbursement,
      count: countDisburse,
      amount: sumDisburseAmount,
      label: t.metrics.readyDesc,
      icon: Banknote,
      iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
      borderHover: 'hover:border-emerald-400',
      activeBorder: activeFilter === 'DISBURSEMENT' ? 'ring-2 ring-emerald-600 border-emerald-600' : '',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onFilterSelect?.(card.id)}
            className={`group relative overflow-hidden rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all cursor-pointer ${card.borderHover} ${card.activeBorder}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                {card.title}
              </span>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {card.count}
              </span>
              <span className="text-xs font-medium text-slate-400">{t.metrics.unit}</span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{card.label}</span>
              <span className="font-semibold text-slate-800 tabular-nums" suppressHydrationWarning>
                {formatRupiah(card.amount)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
