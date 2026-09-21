'use server';

import { prisma } from '@/lib/prisma';
import { ibsCore } from '@/lib/ibscore';
import { LoanApplicationItem, LoanStatus, ReviewLayer } from '@/types/loan';
import { revalidatePath } from 'next/cache';

function serializeLoan(loan: any): LoanApplicationItem {
  return {
    id: loan.id,
    orderNo: loan.orderNo,
    applicantName: loan.applicantName,
    idNo: loan.idNo,
    phone: loan.phone,
    accountNo: loan.accountNo,
    bankName: loan.bankName,
    loanType: loan.loanType,
    requestedAmount: Number(loan.requestedAmount),
    approvedAmount: loan.approvedAmount ? Number(loan.approvedAmount) : null,
    tenorMonth: loan.tenorMonth,
    approvedTenor: loan.approvedTenor,
    interestRate: Number(loan.interestRate),
    monthlyIncome: Number(loan.monthlyIncome),
    dsrRatio: Number(loan.dsrRatio),
    creditScore: loan.creditScore,
    slikStatus: loan.slikStatus,
    status: loan.status as LoanStatus,
    currentLayer: loan.currentLayer as ReviewLayer,
    caNotes: loan.caNotes,
    spvNotes: loan.spvNotes,
    rejectionReason: loan.rejectionReason,
    // Extended debtor profile
    companyName: loan.companyName ?? null,
    jobType: loan.jobType ?? null,
    streetAddress: loan.streetAddress ?? null,
    city: loan.city ?? null,
    province: loan.province ?? null,
    // Emergency contact
    emergencyName: loan.emergencyName ?? null,
    emergencyRelation: loan.emergencyRelation ?? null,
    emergencyPhone: loan.emergencyPhone ?? null,
    // Device & biometric
    deviceModel: loan.deviceModel ?? null,
    faceScore: loan.faceScore ?? null,
    // CA telephone verification
    teleVerify: loan.teleVerify ?? null,
    callRelat: loan.callRelat ?? null,
    // IBSCore Core Banking fields
    cif: loan.cif ?? null,
    motherName: loan.motherName ?? null,
    birthPlace: loan.birthPlace ?? null,
    birthDate: loan.birthDate ?? null,
    loanAccountNo: loan.loanAccountNo ?? null,
    spkNo: loan.spkNo ?? null,
    branchCode: loan.branchCode ?? '212',
    productCode: loan.productCode ?? '102',
    creditType: loan.creditType ?? '700',
    disbursementReceiptNo: loan.disbursementReceiptNo ?? null,
    disbursementTxType: loan.disbursementTxType ?? 'C2',
    createdAt: loan.createdAt.toISOString(),
    updatedAt: loan.updatedAt.toISOString(),
    reviewLogs: (loan.reviewLogs || []).map((log: any) => ({
      id: log.id,
      loanId: log.loanId,
      operatorName: log.operatorName,
      operatorRole: log.operatorRole,
      action: log.action,
      amountBefore: log.amountBefore ? Number(log.amountBefore) : null,
      amountAfter: log.amountAfter ? Number(log.amountAfter) : null,
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

export async function getLoans(): Promise<LoanApplicationItem[]> {
  try {
    const rawLoans = await prisma.loanApplication.findMany({
      include: {
        reviewLogs: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rawLoans.map(serializeLoan);
  } catch (error) {
    console.error('Error in getLoans:', error);
    return [];
  }
}

export async function updateLoanScoring(
  loanId: string,
  data: {
    slikStatus: string;
    creditScore: number;
    monthlyIncome: number;
    dsrRatio: number;
  }
) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          slikStatus: data.slikStatus,
          creditScore: data.creditScore,
          monthlyIncome: data.monthlyIncome,
          dsrRatio: data.dsrRatio,
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Credit Analyst',
          operatorRole: 'CREDIT_ANALYST',
          action: 'UPDATE_SCORING_SLIK',
          notes: `Update manual SLIK: ${data.slikStatus}, Skor Kredit: ${data.creditScore}, Penghasilan: Rp ${data.monthlyIncome.toLocaleString('id-ID')}, DSR: ${data.dsrRatio}%.`,
        },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error updateLoanScoring:', error);
    return { success: false, error: error.message };
  }
}

export async function submitCaReview(
  loanId: string,
  data: {
    approvedAmount: number;
    approvedTenor: number;
    caNotes: string;
    teleVerify?: string;
    callRelat?: string;
    slikStatus?: string;
    creditScore?: number;
    monthlyIncome?: number;
    dsrRatio?: number;
  }
) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          approvedAmount: data.approvedAmount,
          approvedTenor: data.approvedTenor,
          caNotes: data.caNotes,
          teleVerify: data.teleVerify || null,
          callRelat: data.callRelat || null,
          ...(data.slikStatus ? { slikStatus: data.slikStatus } : {}),
          ...(data.creditScore !== undefined ? { creditScore: data.creditScore } : {}),
          ...(data.monthlyIncome !== undefined ? { monthlyIncome: data.monthlyIncome } : {}),
          ...(data.dsrRatio !== undefined ? { dsrRatio: data.dsrRatio } : {}),
          status: 'WAITING_SPV_APPROVAL',
          currentLayer: 'LAYER_2_SPV',
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Budi Santoso (CA)',
          operatorRole: 'CREDIT_ANALYST',
          action: 'CA_RECOMMENDATION',
          amountBefore: current.requestedAmount,
          amountAfter: data.approvedAmount,
          notes: data.caNotes,
        },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitCaReview:', error);
    return { success: false, error: error.message };
  }
}


export async function rejectByCa(loanId: string, reason: string) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          status: 'REJECTED_CA',
          rejectionReason: reason,
          caNotes: reason,
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Budi Santoso (CA)',
          operatorRole: 'CREDIT_ANALYST',
          action: 'CA_REJECT',
          amountBefore: current.requestedAmount,
          amountAfter: null,
          notes: reason,
        },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error rejectByCa:', error);
    return { success: false, error: error.message };
  }
}

export async function submitSpvApproval(loanId: string, spvNotes: string) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          spvNotes,
          status: 'OFFERING_CUSTOMER',
          currentLayer: 'CUSTOMER_OFFERING',
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Dewi Lestari (Supervisor)',
          operatorRole: 'CREDIT_SUPERVISOR',
          action: 'FINAL_APPROVAL',
          amountBefore: current.approvedAmount || current.requestedAmount,
          amountAfter: current.approvedAmount || current.requestedAmount,
          notes: spvNotes || 'Disetujui Supervisor. Menunggu penerimaan akad oleh nasabah.',
        },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitSpvApproval:', error);
    return { success: false, error: error.message };
  }
}

export async function returnToCa(loanId: string, reason: string) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          status: 'UNDER_REVIEW_CA',
          currentLayer: 'LAYER_1_CA',
          spvNotes: reason,
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Dewi Lestari (Supervisor)',
          operatorRole: 'CREDIT_SUPERVISOR',
          action: 'RETURN_TO_CA',
          notes: `Dikembalikan ke CA untuk evaluasi ulang: ${reason}`,
        },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error returnToCa:', error);
    return { success: false, error: error.message };
  }
}

export async function rejectBySpv(loanId: string, reason: string) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          status: 'REJECTED_SPV',
          rejectionReason: reason,
          spvNotes: reason,
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Dewi Lestari (Supervisor)',
          operatorRole: 'CREDIT_SUPERVISOR',
          action: 'SPV_REJECT',
          amountBefore: current.approvedAmount || current.requestedAmount,
          amountAfter: null,
          notes: reason,
        },
      }),
    ]);

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error rejectBySpv:', error);
    return { success: false, error: error.message };
  }
}

export async function submitCustomerAcceptance(loanId: string, accepted: boolean) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    if (accepted) {
      await prisma.$transaction([
        prisma.loanApplication.update({
          where: { id: loanId },
          data: {
            status: 'READY_FOR_DISBURSEMENT',
            currentLayer: 'DISBURSEMENT',
          },
        }),
        prisma.loanReviewLog.create({
          data: {
            loanId,
            operatorName: current.applicantName,
            operatorRole: 'CUSTOMER',
            action: 'CUSTOMER_ACCEPT',
            amountBefore: current.approvedAmount,
            amountAfter: current.approvedAmount,
            notes: 'Nasabah menyetujui Perjanjian Kredit dan plafon yang ditawarkan.',
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.loanApplication.update({
          where: { id: loanId },
          data: {
            status: 'REJECTED_CA',
            rejectionReason: 'Nasabah membatalkan / menolak penawaran plafon.',
          },
        }),
        prisma.loanReviewLog.create({
          data: {
            loanId,
            operatorName: current.applicantName,
            operatorRole: 'CUSTOMER',
            action: 'CUSTOMER_REJECT',
            notes: 'Nasabah menolak penawaran pinjaman yang disetujui.',
          },
        }),
      ]);
    }

    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Error submitCustomerAcceptance:', error);
    return { success: false, error: error.message };
  }
}

export async function executeDisbursement(loanId: string) {
  try {
    const current = await prisma.loanApplication.findUnique({
      where: { id: loanId },
    });
    if (!current) throw new Error('Pengajuan pinjaman tidak ditemukan');

    const amount = Number(current.approvedAmount || current.requestedAmount);
    const tenor = current.approvedTenor || current.tenorMonth;
    const interest = Number(current.interestRate);

    // 1. Pengecekan atau Registrasi Rekening Pinjaman di IBSCore
    let loanAccountNo = current.loanAccountNo;
    let spkNo = current.spkNo;
    const cif = current.cif || `602043${current.idNo.slice(-8)}`;

    if (!loanAccountNo) {
      const regResult = await ibsCore.registerPinjaman({
        cif,
        amount,
        tenor,
        interestRate: interest,
        spkNo: current.spkNo || undefined,
      });
      loanAccountNo = regResult.noRekening;
      spkNo = regResult.spkNo;
    }

    // 2. Eksekusi Pencairan Transaksi (Disbursement C2) ke IBSCore
    const disburseResult = await ibsCore.executeDisbursement({
      noRekening: loanAccountNo,
      amount,
      orderNo: current.orderNo,
    });

    // 3. Update Database & Catat ke Audit Trail
    await prisma.$transaction([
      prisma.loanApplication.update({
        where: { id: loanId },
        data: {
          cif,
          loanAccountNo,
          spkNo,
          disbursementReceiptNo: disburseResult.kuitansi,
          status: 'DISBURSED',
          currentLayer: 'DISBURSEMENT',
        },
      }),
      prisma.loanReviewLog.create({
        data: {
          loanId,
          operatorName: 'Treasury & Operation',
          operatorRole: 'OPERATION',
          action: 'DISBURSEMENT_SUCCESS',
          amountBefore: current.approvedAmount,
          amountAfter: current.approvedAmount,
          notes: `Dana pinjaman Rp ${amount.toLocaleString('id-ID')} dicairkan ke Rek ${current.accountNo} (${current.bankName}). No Rek Pinjaman IBSCore: ${loanAccountNo}, Kuitansi: ${disburseResult.kuitansi} (ID: ${disburseResult.kuitansiId}).`,
        },
      }),
    ]);


    revalidatePath('/');
    return {
      success: true,
      loanAccountNo,
      receiptNo: disburseResult.kuitansi,
      message: disburseResult.message,
    };
  } catch (error: any) {
    console.error('Error executeDisbursement:', error);
    return { success: false, error: error.message };
  }
}

