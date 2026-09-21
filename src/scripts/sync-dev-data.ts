/**
 * 🔄 Script Sinkronisasi Penuh Semua Data Pinjaman Real MySQL Server Dev (10.101.32.134)
 * ke Database Lokal PostgreSQL 'ca-dashboard'.
 *
 * Jalankan dengan: `npm run sync:dev` atau `npx tsx src/scripts/sync-dev-data.ts`
 * Tambahkan `--fresh` untuk menghapus dan mengisi ulang dari awal.
 */
// NOTE: dotenv di-load di dalam main() saat jalan via CLI, atau oleh Next.js saat diimport.

export async function syncDevLoans(options: { fresh?: boolean } = {}) {
  const { queryRemoteMySQL } = await import('../lib/mysql');
  const { prisma } = await import('../lib/prisma');

  console.log('\n============================================================');
  console.log('🔄 SINKRONISASI DAFTAR PENGAJUAN PINJAMAN REAL DARI DEV LOCAL/REMOTE');
  console.log('   Source : MySQL 10.101.32.134 (sys_user_loan & sys_user_info)');
  console.log('   Target : PostgreSQL localhost (ca-dashboard)');
  console.log(`   Mode   : ${options.fresh ? 'FRESH RESET (wipe & reload)' : 'SMART UPSERT (preserve local reviews)'}`);
  console.log('============================================================\n');

  const realLoans = await queryRemoteMySQL(`
    SELECT 
      l.id,
      l.order_no,
      l.loan_info_id,
      l.user_id,
      l.real_name,
      l.phone,
      l.id_no,
      l.account_no,
      l.bank_name,
      l.amount,
      l.loan_val,
      l.loan_real_val,
      l.loan_period,
      l.loan_all_rate,
      l.loan_status,
      l.kyc_result,
      l.service_fee,
      l.loan_interest,
      l.noRekening,
      l.create_time,
      l.sign_time,
      l.loan_starttime,
      l.update_time,
      l.clear_time,
      u.company_name,
      u.family_detail_address,
      u.family_city,
      u.family_province,
      u.mother,
      u.monthly_income,
      u.place_of_birth,
      u.birthday,
      u.liveness_score,
      r.first_review_result,
      r.first_operator_id,
      op1.name as first_op_name,
      r.first_end_time,
      r.first_review_note,
      r.first_limt,
      r.final_review_result,
      r.final_operator_id,
      op2.name as final_op_name,
      r.final_end_time,
      r.final_review_noe,
      r.final_limit
    FROM sys_user_loan l
    LEFT JOIN sys_user_info u ON l.user_id = u.user_id
    LEFT JOIN sys_order_review r ON l.loan_info_id = r.order_id
    LEFT JOIN cfg_operator op1 ON r.first_operator_id = op1.id
    LEFT JOIN cfg_operator op2 ON r.final_operator_id = op2.id
    ORDER BY l.id DESC
  `);

  console.log(`✅ Ditemukan total ${realLoans.length} pengajuan kredit asli di server dev.`);

  if (options.fresh) {
    console.log('🧹 Menghapus data lama di PostgreSQL...');
    await prisma.loanReviewLog.deleteMany({});
    await prisma.loanApplication.deleteMany({});
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < realLoans.length; i++) {
    const r = realLoans[i];
    const cleanPhone = (r.phone || '081298765432').replace(/^62/, '0');
    const birthDateStr = r.birthday ? new Date(r.birthday).toISOString().split('T')[0] : '1987-04-18';
    
    // Requested amount: gunakan loan_val (plafon diajukan), jika 0 gunakan amount atau loan_real_val
    const reqAmount = Number(r.loan_val) > 0 
      ? Number(r.loan_val) 
      : (Number(r.amount) > 0 ? Number(r.amount) : (Number(r.loan_real_val) || 1000000));

    // Face score / Biometric score extraction dari kyc_result atau liveness_score
    let faceScore = '95.4';
    if (r.kyc_result) {
      try {
        const kyc = typeof r.kyc_result === 'string' ? JSON.parse(r.kyc_result) : r.kyc_result;
        if (kyc?.score) {
          faceScore = parseFloat(kyc.score).toFixed(2);
        }
      } catch (e) {
        // ignore JSON parse error
      }
    } else if (r.liveness_score && r.liveness_score !== '0') {
      faceScore = r.liveness_score;
    }

    let status: any = 'UNDER_REVIEW_CA';
    let currentLayer: any = 'LAYER_1_CA';
    let approvedAmount = null;
    let approvedTenor = null;
    let caNotes: string | null = null;
    let spvNotes: string | null = null;
    let rejectionReason: string | null = null;

    // ─── Mapping status dari dev MySQL ke status CA Dashboard ──────────────
    // clear + noRekening ada  → Dana sudah cair ke Core Banking (DISBURSED)
    // clear + noRekening null → Disetujui, menunggu pencairan (READY_FOR_DISBURSEMENT)
    // overdue                 → Bermasalah / kolektibilitas buruk (REJECTED_CA)
    // pass_final              → Pengajuan baru lolos verifikasi sistem (UNDER_REVIEW_CA)
    // fail_lend               → Pencairan gagal / dibatalkan oleh Colony Admin (PAYMENT_FAILED)
    // fail_final              → Ditolak final review Colony Admin (REJECTED_SPV)
    // fail_1                  → Ditolak review pertama Colony Admin (REJECTED_CA)
    // fail_auto_approve       → Ditolak otomatis sistem (REJECTED_CA)
    // ────────────────────────────────────────────────────────────────────────

    if (r.loan_status === 'clear') {
      if (r.noRekening) {
        status = 'DISBURSED';
        currentLayer = 'DISBURSEMENT';
        approvedAmount = Number(r.loan_val) > 0 ? Number(r.loan_val) : reqAmount;
        approvedTenor = r.loan_period || 1;
        caNotes = 'Analisa kredit: kapasitas bayar nasabah lancar.';
        spvNotes = 'Disetujui komite pemutus kredit. Dana telah dicairkan.';
      } else {
        status = 'READY_FOR_DISBURSEMENT';
        currentLayer = 'DISBURSEMENT';
        approvedAmount = Number(r.loan_val) > 0 ? Number(r.loan_val) : reqAmount;
        approvedTenor = r.loan_period || 1;
        caNotes = 'Analisa kredit selesai, kapasitas bayar aman.';
        spvNotes = 'Disetujui. Menunggu eksekusi pencairan.';
      }
    } else if (r.loan_status === 'overdue') {
      status = 'REJECTED_CA';
      currentLayer = 'LAYER_1_CA';
      rejectionReason = 'Catatan historis kredit mengalami tunggakan (Overdue di Core Banking).';
      caNotes = 'Ditolak: Terdeteksi status pinjaman overdue pada rekam jejak nasabah.';
    } else if (r.loan_status === 'pass_final') {
      // Pengajuan baru masuk dari nasabah (Colony: Order waiting for lending)
      status = 'UNDER_REVIEW_CA';
      currentLayer = 'LAYER_1_CA';
      caNotes = 'Pengajuan baru masuk dari Mobile Banking. Lolos validasi awal sistem (Colony: pass_final / Order Waiting for Lending). Menunggu verifikasi & analisa Credit Analyst.';
    } else if (r.loan_status === 'fail_lend') {
      // Pencairan dibatalkan / ditolak dari Colony Admin (Loan Rejection button)
      status = 'PAYMENT_FAILED';
      currentLayer = 'DISBURSEMENT';
      rejectionReason = rejectionReason || 'Pencairan dibatalkan oleh admin Colony pada antrean lending (Loan Rejection). Limit kredit nasabah telah dikembalikan.';
      caNotes = 'Pengajuan disetujui pada review kredit, namun dibatalkan pada antrean pencairan dana di Colony Admin (fail_lend).';
    } else if (r.loan_status === 'fail_final') {
      // Ditolak pada tahap final review di Colony Admin
      status = 'REJECTED_SPV';
      currentLayer = 'LAYER_2_SPV';
      rejectionReason = rejectionReason || 'Ditolak pada Final Review Colony Admin (fail_final).';
      spvNotes = 'Pengajuan ditolak pada tahap final approval di sistem Colony Admin oleh reviewer.';
    } else if (r.loan_status === 'fail_1') {
      // Ditolak pada tahap first review di Colony Admin
      status = 'REJECTED_CA';
      currentLayer = 'LAYER_1_CA';
      rejectionReason = rejectionReason || 'Ditolak pada First Review Colony Admin (fail_1).';
      caNotes = 'Pengajuan ditolak pada tahap review pertama di sistem Colony Admin.';
    } else if (r.loan_status === 'fail_auto_approve') {
      // Ditolak otomatis oleh sistem Colony Admin
      status = 'REJECTED_CA';
      currentLayer = 'LAYER_1_CA';
      rejectionReason = rejectionReason || 'Ditolak otomatis oleh sistem (fail_auto_approve).';
      caNotes = 'Ditolak: Pengajuan tidak memenuhi syarat otomatis sistem Colony Admin.';
    } else if (r.loan_status === 'audit' || r.loan_status === 'init') {
      status = 'UNDER_REVIEW_CA';
      currentLayer = 'LAYER_1_CA';
    } else {
      status = 'UNDER_REVIEW_CA';
      currentLayer = 'LAYER_1_CA';
    }

    const existing = await prisma.loanApplication.findUnique({
      where: { orderNo: r.order_no },
    });

    let targetLoanId: string;

    if (!existing) {
      const createdLoan = await prisma.loanApplication.create({
        data: {
          orderNo: r.order_no,
          applicantName: r.real_name || 'Debitur Bank Sentosa',
          idNo: r.id_no || '3217061804830007',
          phone: cleanPhone,
          accountNo: r.account_no && r.account_no.trim() !== '' ? r.account_no : `001201000${100 + i}`,
          bankName: r.bank_name && r.bank_name.trim() !== '' ? r.bank_name : 'Bank Sentosa',
          loanType: 'KREDIT_MULTIGUNA',
          requestedAmount: reqAmount,
          approvedAmount: approvedAmount,
          tenorMonth: r.loan_period || 1,
          approvedTenor: approvedTenor,
          interestRate: Number(r.loan_all_rate) > 0 ? Number(r.loan_all_rate) : 3.0,
          monthlyIncome: 12000000,
          dsrRatio: 28.5,
          creditScore: 750,
          slikStatus: status === 'REJECTED_CA' ? 'PERHATIAN_KHUSUS' : 'LANCAR',
          status: status,
          currentLayer: currentLayer,
          caNotes: caNotes,
          spvNotes: spvNotes,
          rejectionReason: rejectionReason,
          companyName: r.company_name || 'PT Maju Bersama Sentosa',
          jobType: 'Karyawan Swasta',
          streetAddress: r.family_detail_address || 'JL. AMIR MAHMUD GG. SIRNAGALIH NO. 62',
          city: r.family_city || 'CIMAHI',
          province: r.family_province || 'JAWA BARAT',
          emergencyName: 'Keluarga Debitur',
          emergencyRelation: 'Keluarga',
          emergencyPhone: '081234567890',
          deviceModel: 'Samsung Galaxy A54',
          faceScore: faceScore,
          cif: r.id_no ? `602043${r.id_no.slice(-8)}` : '6020430001',
          motherName: r.mother || 'Ibu Debitur',
          birthPlace: r.place_of_birth || 'BANDUNG',
          birthDate: birthDateStr,
          loanAccountNo: r.noRekening || (status === 'DISBURSED' ? '2121020000404' : null),
          spkNo: `SPK-2026-${r.order_no.slice(-6)}`,
          branchCode: '212',
          productCode: '102',
          creditType: '700',
          disbursementReceiptNo: status === 'DISBURSED' ? 'TRX-REALISASI-CORE' : null,
          createdAt: r.create_time ? new Date(r.create_time) : new Date(),
        },
      });
      targetLoanId = createdLoan.id;
      createdCount++;
      console.log(`  [${i + 1}/${realLoans.length}] 🆕 BARU: ${r.order_no} | ${r.real_name} -> ${status}`);
    } else {
      targetLoanId = existing.id;
      const devStatusIsFinal =
        r.loan_status === 'fail_lend' ||
        r.loan_status === 'fail_final' ||
        r.loan_status === 'fail_1' ||
        r.loan_status === 'fail_auto_approve' ||
        r.loan_status === 'overdue' ||
        r.loan_status === 'clear';

      const localIsInProgress =
        existing.status === 'WAITING_SPV_APPROVAL' ||
        existing.status === 'OFFERING_CUSTOMER' ||
        existing.status === 'READY_FOR_DISBURSEMENT' ||
        existing.status === 'DISBURSED';

      const shouldSyncStatus = devStatusIsFinal || !localIsInProgress || options.fresh;

      await prisma.loanApplication.update({
        where: { orderNo: r.order_no },
        data: {
          applicantName: r.real_name || existing.applicantName,
          phone: cleanPhone,
          faceScore: faceScore,
          requestedAmount: reqAmount,
          tenorMonth: r.loan_period || existing.tenorMonth,
          loanAccountNo: r.noRekening || existing.loanAccountNo,
          ...(shouldSyncStatus ? {
            status,
            currentLayer,
            ...(rejectionReason ? { rejectionReason } : {}),
            ...(caNotes && !localIsInProgress ? { caNotes } : {}),
            ...(spvNotes && !localIsInProgress ? { spvNotes } : {}),
          } : {}),
        },
      });
      updatedCount++;
      const statusChanged = shouldSyncStatus && existing.status !== status;
      console.log(`  [${i + 1}/${realLoans.length}] 🔄 UPDATED: ${r.order_no} | ${r.real_name} -> ${status}${
        statusChanged ? ` (was: ${existing.status} ← MySQL: ${r.loan_status})` : ''
      }`);
    }

    // ─── Tarik & Sinkronisasi Riwayat Audit Trail Lengkap dari Dev ───────
    await syncAuditTrailLogs(prisma, targetLoanId, r, reqAmount, approvedAmount);
  }

  console.log(`\n🎉 SINKRONISASI SUKSES! Total ${realLoans.length} record (Baru: ${createdCount}, Update: ${updatedCount})\n`);
  return { total: realLoans.length, created: createdCount, updated: updatedCount };
}

/**
 * Sinkronisasi log audit trail dari rekam jejak MySQL ke loanReviewLog Postgres
 */
async function syncAuditTrailLogs(
  prisma: any,
  loanId: string,
  r: any,
  reqAmount: number,
  approvedAmount: number | null
) {
  const existingLogs = await prisma.loanReviewLog.findMany({
    where: { loanId },
    select: { action: true },
  });
  const existingActions = new Set(existingLogs.map((l: any) => l.action));

  const candidateLogs: Array<{
    operatorName: string;
    operatorRole: string;
    action: string;
    amountBefore: number | null;
    amountAfter: number | null;
    notes: string;
    createdAt: Date;
  }> = [];

  // 1. Submit pengajuan oleh nasabah di Mobile Banking
  candidateLogs.push({
    operatorName: 'Mobile Banking Core',
    operatorRole: 'SYSTEM',
    action: 'SUBMIT_APPLICATION',
    amountBefore: null,
    amountAfter: reqAmount,
    notes: `Data aplikasi pinjaman diajukan oleh nasabah melalui Mobile Banking (Order: ${r.order_no}).`,
    createdAt: r.create_time && !isNaN(new Date(r.create_time).getTime()) ? new Date(r.create_time) : new Date(),
  });

  // 2. Review CA (First Review) dari Colony Admin
  if (r.first_end_time && !isNaN(new Date(r.first_end_time).getTime())) {
    const isPass = r.first_review_result === 1;
    let noteText = r.first_review_note;
    if (noteText && (noteText.startsWith('{') || noteText.startsWith('['))) {
      try {
        const parsed = JSON.parse(noteText);
        if (Array.isArray(parsed) && parsed.length === 0) {
          noteText = 'Analisa verifikasi data debitur dan kapasitas bayar disetujui.';
        } else if (typeof parsed === 'object') {
          noteText = Object.entries(parsed)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        }
      } catch (_) {}
    }
    const caLimit = Number(r.first_limt) > 0 ? Number(r.first_limt) : reqAmount;
    candidateLogs.push({
      operatorName: r.first_op_name || 'Credit Analyst (Colony)',
      operatorRole: 'CREDIT_ANALYST',
      action: isPass ? 'RECOMMEND_APPROVAL' : 'REJECT_CA',
      amountBefore: reqAmount,
      amountAfter: caLimit,
      notes: isPass
        ? `Analisa kredit lolos verifikasi. Plafon rekomendasi: Rp ${caLimit.toLocaleString('id-ID')}. ${noteText || ''}`.trim()
        : `Ditolak oleh Credit Analyst. Alasan: ${noteText || 'Tidak memenuhi syarat kelayakan kredit.'}`,
      createdAt: new Date(r.first_end_time),
    });
  }

  // 3. Approval SPV (Final Review) dari Colony Admin
  if (r.final_end_time && !isNaN(new Date(r.final_end_time).getTime())) {
    const isPass = String(r.final_review_result) === '1';
    const spvLimit = Number(r.final_limit) > 0 ? Number(r.final_limit) : (approvedAmount || reqAmount);
    candidateLogs.push({
      operatorName: r.final_op_name || 'Supervisor CA (Colony)',
      operatorRole: 'SUPERVISOR',
      action: isPass ? 'APPROVE_APPLICATION' : 'REJECT_SPV',
      amountBefore: Number(r.first_limt) > 0 ? Number(r.first_limt) : reqAmount,
      amountAfter: spvLimit,
      notes: isPass
        ? `Persetujuan komite kredit diterbitkan. Plafon disetujui: Rp ${spvLimit.toLocaleString('id-ID')}. ${r.final_review_noe || ''}`.trim()
        : `Ditolak pada tahap approval komite SPV. Catatan: ${r.final_review_noe || 'Persetujuan kredit tidak disetujui komite.'}`,
      createdAt: new Date(r.final_end_time),
    });
  }

  // 4. Akad Pinjaman Ditandatangani Nasabah di Mobile Banking
  if (r.sign_time && !isNaN(new Date(r.sign_time).getTime())) {
    candidateLogs.push({
      operatorName: r.real_name || 'Nasabah Debitur',
      operatorRole: 'CUSTOMER',
      action: 'CUSTOMER_ACCEPT',
      amountBefore: approvedAmount,
      amountAfter: approvedAmount,
      notes: 'Nasabah menyetujui penawaran fasilitas kredit dan menandatangani akad kredit digital.',
      createdAt: new Date(r.sign_time),
    });
  }

  // 5. Eksekusi Pencairan / Pembatalan di Antrean Lending
  if (r.loan_status === 'fail_lend') {
    candidateLogs.push({
      operatorName: 'Colony Admin (Lending Queue)',
      operatorRole: 'TREASURY',
      action: 'DISBURSEMENT_REJECTED',
      amountBefore: approvedAmount,
      amountAfter: 0,
      notes: 'Pencairan dibatalkan oleh admin pada antrean lending (Loan Rejection). Limit kredit nasabah telah dikembalikan ke saldo kuota.',
      createdAt: r.update_time && !isNaN(new Date(r.update_time).getTime()) ? new Date(r.update_time) : new Date(),
    });
  } else if (r.loan_status === 'clear') {
    candidateLogs.push({
      operatorName: 'Core Banking USSI (IBSCore)',
      operatorRole: 'TREASURY',
      action: 'DISBURSEMENT_SUCCESS',
      amountBefore: approvedAmount,
      amountAfter: approvedAmount,
      notes: `Fasilitas kredit berhasil dicairkan ke rekening debitur (${r.noRekening || r.account_no || 'Core Banking'}).`,
      createdAt: r.loan_starttime && !isNaN(new Date(r.loan_starttime).getTime())
        ? new Date(r.loan_starttime)
        : (r.clear_time && !isNaN(new Date(r.clear_time).getTime()) ? new Date(r.clear_time) : new Date()),
    });
  }

  for (const log of candidateLogs) {
    if (!existingActions.has(log.action)) {
      await prisma.loanReviewLog.create({
        data: {
          loanId,
          ...log,
        },
      });
    }
  }
}

async function main() {
  const dotenv = await import('dotenv');
  dotenv.default.config();
  const isFresh = process.argv.includes('--fresh');
  try {
    await syncDevLoans({ fresh: isFresh });
  } catch (err: any) {
    console.error('❌ Error saat sinkronisasi:', err);
  } finally {
    process.exit(0);
  }
}

// Hanya jalankan main() kalau dieksekusi langsung via CLI
if (process.argv[1]?.endsWith('sync-dev-data.ts') || process.argv[1]?.endsWith('sync-dev-data.js')) {
  main();
}
