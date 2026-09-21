export interface InstallmentScheduleItem {
  installmentNo: number;
  dueDate: Date;
  dueDateFormatted: string;
  principalAmount: number;
  interestAmount: number;
  totalInstallment: number;
  remainingPrincipal: number;
}

export interface LoanRepaymentCalculation {
  principalAmount: number;        // Plafon pinjaman yang diajukan (misal: Rp 1.000.000)
  serviceFeeRate: number;         // Biaya layanan dalam % (default: 6.0%)
  serviceFee: number;             // Nominal biaya layanan dipotong di muka (misal: Rp 60.000)
  netDisbursedAmount: number;     // Dana bersih yang diterima/dicairkan ke nasabah (misal: Rp 940.000)
  tenorMonth: number;             // Jangka waktu / tenor (bulan)
  interestRatePerMonth: number;   // Suku bunga flat per bulan (misal: 3.0%)
  dailyInterestRate: string;      // Bunga harian flat (misal: 0.30%)
  totalInterest: number;          // Total bunga seluruh periode (misal: Rp 90.000)
  monthlyPrincipal: number;       // Pokok dasar per bulan (misal: Rp 333.000)
  monthlyInterest: number;        // Bunga per bulan (misal: Rp 30.000)
  monthlyInstallment: number;     // Angsuran bulan pertama (misal: Rp 364.000)
  totalRepayment: number;         // Total pelunasan nasabah (misal: Rp 1.090.000)
  disbursementDate: Date;
  isDisbursed: boolean;
  schedule: InstallmentScheduleItem[];
}

/**
 * Menghitung cicilan bulanan, potongan biaya layanan di muka, dan jadwal jatuh tempo pembayaran.
 * Mengikuti formula perbankan Bank Sentosa (Mobile Banking):
 * 
 * - Plafon diminta: Rp 1.000.000
 * - Biaya Layanan (6% di muka): Rp 60.000
 * - Dana Cair Bersih yang didapat nasabah: Rp 940.000
 * - Bunga flat 3%/bulan (Total bunga 3 bulan = Rp 90.000)
 * - Total Pembayaran: Rp 1.090.000
 * - Angsuran 1: Rp 364.000 (Pokok 334.000 + Bunga 30.000)
 * - Angsuran 2: Rp 363.000 (Pokok 333.000 + Bunga 30.000)
 * - Angsuran 3: Rp 363.000 (Pokok 333.000 + Bunga 30.000)
 */
export function calculateLoanRepayment(
  principal: number,
  tenor: number,
  interestRate: number = 3.0,
  baseDate: Date | string = new Date(),
  isDisbursed: boolean = false,
  serviceFeeRate: number = 6.0
): LoanRepaymentCalculation {
  const p = Math.max(0, Number(principal) || 0);
  const t = Math.max(1, Math.min(36, Number(tenor) || 1));
  const rate = Number(interestRate) || 3.0;
  const sFeeRate = Number(serviceFeeRate) || 6.0;

  const validBaseDate = baseDate instanceof Date ? baseDate : new Date(baseDate);
  const startDate = isNaN(validBaseDate.getTime()) ? new Date() : validBaseDate;

  // 1. Potongan biaya layanan di muka (service fee 6%)
  const serviceFee = Math.round(p * (sFeeRate / 100));

  // 2. Dana bersih riil yang diterima / dicairkan ke rekening nasabah (loan_real_val)
  const netDisbursedAmount = Math.max(0, p - serviceFee);

  // 3. Bunga flat per bulan = principal * (rate / 100)
  const monthlyInterest = Math.round(p * (rate / 100));
  const totalInterest = monthlyInterest * t;

  // 4. Pembagian pokok per bulan (dibulatkan ke ribuan, sisa pembulatan ditambahkan ke Angsuran 1)
  const baseMonthlyPrincipal = Math.floor(p / t / 1000) * 1000;
  const remainderPrincipal = p - (baseMonthlyPrincipal * t);

  const schedule: InstallmentScheduleItem[] = [];
  let remaining = p;

  for (let i = 1; i <= t; i++) {
    // Sisa pembulatan dialokasikan di angsuran pertama (Angsuran 1)
    const isFirst = i === 1;
    const princ = isFirst ? baseMonthlyPrincipal + remainderPrincipal : baseMonthlyPrincipal;
    const interest = monthlyInterest;
    const totalInst = princ + interest;
    remaining = Math.max(0, remaining - princ);

    // Hitung tanggal jatuh tempo (tanggal yang sama setiap bulannya)
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const dueDateFormatted = dueDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    schedule.push({
      installmentNo: i,
      dueDate,
      dueDateFormatted,
      principalAmount: princ,
      interestAmount: interest,
      totalInstallment: totalInst,
      remainingPrincipal: remaining,
    });
  }

  const firstInstallment = schedule[0]?.totalInstallment || (baseMonthlyPrincipal + remainderPrincipal + monthlyInterest);

  return {
    principalAmount: p,
    serviceFeeRate: sFeeRate,
    serviceFee,
    netDisbursedAmount,
    tenorMonth: t,
    interestRatePerMonth: rate,
    dailyInterestRate: '0.30% flat',
    totalInterest,
    monthlyPrincipal: baseMonthlyPrincipal,
    monthlyInterest,
    monthlyInstallment: firstInstallment,
    totalRepayment: p + totalInterest,
    disbursementDate: startDate,
    isDisbursed,
    schedule,
  };
}

/**
 * Hitung rasio DSR (Debt Service Ratio)
 * DSR = (Total Cicilan Bulanan / Pendapatan Bulanan) * 100%
 */
export function calculateDsr(monthlyInstallment: number, monthlyIncome: number): number {
  if (!monthlyIncome || monthlyIncome <= 0) return 0;
  const ratio = (monthlyInstallment / monthlyIncome) * 100;
  return Number(ratio.toFixed(1));
}
