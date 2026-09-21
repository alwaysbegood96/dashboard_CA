/**
 * 🔒 Seed script for PostgreSQL database 'ca-dashboard'
 * Follows User Rule 6: Dynamic import of Prisma inside main() after DATABASE_URL is defined.
 * Follows User Rule 1: Run with `npx tsx src/scripts/seed.ts`
 */
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const LOCAL_PG_URL =
    process.env.DATABASE_URL ||
    'postgresql://postgres:Alastor159jr%21%21@localhost:5432/ca-dashboard?schema=public';
  process.env.DATABASE_URL = LOCAL_PG_URL;

  console.log('\n============================================================');
  console.log('🌱 [SEEDER] Inisialisasi Data Demo Bank Sentosa: ca-dashboard');
  console.log(`   Target DB : localhost:5432 / ca-dashboard`);
  console.log('============================================================\n');

  // Dynamic import as per Rule 6
  const { prisma } = await import('../lib/prisma');

  try {
    console.log('🧹 Membersihkan data lama...');
    await prisma.loanReviewLog.deleteMany({});
    await prisma.loanApplication.deleteMany({});

    console.log('📥 Menambahkan data pengajuan pinjaman demo...');


    // 1. Data Pinjaman Arief Wijaya Putra (dari loan-flow-guidance.md) - Siap Review CA
    const loan1 = await prisma.loanApplication.create({
      data: {
        orderNo: '26082014400007413078',
        applicantName: 'ARIEF WIJAYA PUTRA',
        idNo: '3217061804830007',
        phone: '081298765432',
        accountNo: '001201000288',
        bankName: 'Bank Sentosa',
        loanType: 'KREDIT_MULTIGUNA',
        requestedAmount: 3000000,
        approvedAmount: null,
        tenorMonth: 1,
        interestRate: 3.00,
        monthlyIncome: 8500000,
        dsrRatio: 36.35,
        creditScore: 720,
        slikStatus: 'LANCAR',
        status: 'UNDER_REVIEW_CA',
        currentLayer: 'LAYER_1_CA',
        caNotes: null,
        spvNotes: null,
        // Extended profile
        companyName: 'PT Maju Bersama Sentosa',
        jobType: 'Karyawan Swasta',
        streetAddress: 'Jl. Kebon Jeruk Raya No. 47, RT 003/RW 008',
        city: 'Jakarta Barat',
        province: 'DKI Jakarta',
        emergencyName: 'Dewi Wijaya',
        emergencyRelation: 'Istri',
        emergencyPhone: '081234567890',
        deviceModel: 'Samsung Galaxy A54',
        faceScore: '94.7',
        reviewLogs: {
          create: [
            {
              operatorName: 'Mobile Banking System',
              operatorRole: 'SYSTEM',
              action: 'SUBMIT_APPLICATION',
              amountBefore: null,
              amountAfter: 3000000,
              notes: 'Pengajuan kredit diajukan melalui Mobile App H5.',
            },
          ],
        },
      },
    });

    // 2. Data Pinjaman Hendra Wijaya - Menunggu Approval Spv (Rekomendasi CA sudah ada)
    const loan2 = await prisma.loanApplication.create({
      data: {
        orderNo: '26081415332405122553',
        applicantName: 'HENDRA WIJAYA',
        idNo: '3171052203850002',
        phone: '081387654321',
        accountNo: '001201000412',
        bankName: 'Bank Sentosa',
        loanType: 'KREDIT_MULTIGUNA',
        requestedAmount: 10000000,
        approvedAmount: 7500000,
        tenorMonth: 3,
        approvedTenor: 3,
        interestRate: 3.00,
        monthlyIncome: 15000000,
        dsrRatio: 28.50,
        creditScore: 780,
        slikStatus: 'LANCAR',
        status: 'WAITING_SPV_APPROVAL',
        currentLayer: 'LAYER_2_SPV',
        caNotes: 'Kolektibilitas lancar, DSR 28.5%. Rekomendasi plafon disesuaikan ke Rp7.500.000 karena existing facility di bank lain.',
        spvNotes: null,
        // Extended profile
        companyName: 'CV Hendra Jaya Teknik',
        jobType: 'Wiraswasta',
        streetAddress: 'Jl. Raya Serpong No. 12, Komplek BSD Sektor 7',
        city: 'Tangerang Selatan',
        province: 'Banten',
        emergencyName: 'Rina Wijaya',
        emergencyRelation: 'Istri',
        emergencyPhone: '082198765432',
        deviceModel: 'iPhone 13',
        faceScore: '97.2',
        teleVerify: 'Nasabah dapat dihubungi 08/09/2026. Konfirmasi KTP & NPWP sesuai. Usaha bergerak di bidang instalasi listrik. Sudah berjalan 8 tahun.',
        callRelat: 'Kontak darurat (istri) dapat dihubungi. Mengetahui pengajuan pinjaman. Bersedia jadi penjamin.',
        reviewLogs: {
          create: [
            {
              operatorName: 'Mobile Banking System',
              operatorRole: 'SYSTEM',
              action: 'SUBMIT_APPLICATION',
              amountBefore: null,
              amountAfter: 10000000,
              notes: 'Pengajuan kredit diajukan nasabah.',
            },
            {
              operatorName: 'Budi Santoso (CA)',
              operatorRole: 'CREDIT_ANALYST',
              action: 'CA_RECOMMENDATION',
              amountBefore: 10000000,
              amountAfter: 7500000,
              notes: 'DSR masuk batas wajar. Rekomendasi approval Rp 7.500.000 dengan tenor 3 bulan.',
            },
          ],
        },
      },
    });


    // 3. Data Pinjaman Siti Rahmawati - Menunggu Konfirmasi Nasabah (Offering Sent)
    const loan3 = await prisma.loanApplication.create({
      data: {
        orderNo: '26081511203009845112',
        applicantName: 'SITI RAHMAWATI',
        idNo: '3273104509920005',
        phone: '085712345678',
        accountNo: '001201000599',
        bankName: 'Bank Sentosa',
        loanType: 'KREDIT_KTA',
        requestedAmount: 5000000,
        approvedAmount: 5000000,
        tenorMonth: 1,
        approvedTenor: 1,
        interestRate: 3.00,
        monthlyIncome: 9200000,
        dsrRatio: 33.60,
        creditScore: 755,
        slikStatus: 'LANCAR',
        status: 'OFFERING_CUSTOMER',
        currentLayer: 'CUSTOMER_OFFERING',
        caNotes: 'Profil finansial sangat sehat. Disetujui 100% dari requested amount.',
        spvNotes: 'Persetujuan supervisor diberikan penuh.',
        reviewLogs: {
          create: [
            {
              operatorName: 'Mobile Banking System',
              operatorRole: 'SYSTEM',
              action: 'SUBMIT_APPLICATION',
              amountBefore: null,
              amountAfter: 5000000,
              notes: 'Pengajuan diajukan.',
            },
            {
              operatorName: 'Budi Santoso (CA)',
              operatorRole: 'CREDIT_ANALYST',
              action: 'CA_RECOMMENDATION',
              amountBefore: 5000000,
              amountAfter: 5000000,
              notes: 'Rekomendasi disetujui penuh Rp 5.000.000.',
            },
            {
              operatorName: 'Dewi Lestari (Spv)',
              operatorRole: 'CREDIT_SUPERVISOR',
              action: 'FINAL_APPROVAL',
              amountBefore: 5000000,
              amountAfter: 5000000,
              notes: 'Final approval diberikan. Surat penawaran (offering) dikirim ke nasabah.',
            },
          ],
        },
      },
    });

    // 4. Data Pinjaman Dimas Prasetyo - Siap Dicairkan (Customer Accepted)
    const loan4 = await prisma.loanApplication.create({
      data: {
        orderNo: '26081609152204193844',
        applicantName: 'DIMAS PRASETYO',
        idNo: '3174081907890001',
        phone: '08119882233',
        accountNo: '001201000677',
        bankName: 'Bank Sentosa',
        loanType: 'KREDIT_MULTIGUNA',
        requestedAmount: 20000000,
        approvedAmount: 15000000,
        tenorMonth: 3,
        approvedTenor: 3,
        interestRate: 3.00,
        monthlyIncome: 22000000,
        dsrRatio: 22.70,
        creditScore: 810,
        slikStatus: 'LANCAR',
        status: 'READY_FOR_DISBURSEMENT',
        currentLayer: 'DISBURSEMENT',
        caNotes: 'Usaha stabil, mutasi rekening aktif 6 bulan terakhir.',
        spvNotes: 'Disetujui komite.',
        // IBSCore info
        cif: '602043000193844',
        motherName: 'Endang Lestari',
        birthPlace: 'JAKARTA',
        birthDate: '1989-07-19',
        branchCode: '212',
        productCode: '102',
        creditType: '700',
        spkNo: 'SPK-2026-0816',
        reviewLogs: {
          create: [
            {
              operatorName: 'Dewi Lestari (Spv)',
              operatorRole: 'CREDIT_SUPERVISOR',
              action: 'FINAL_APPROVAL',
              amountBefore: 20000000,
              amountAfter: 15000000,
              notes: 'Disetujui Rp 15.000.000.',
            },
            {
              operatorName: 'DIMAS PRASETYO (Customer)',
              operatorRole: 'CUSTOMER',
              action: 'CUSTOMER_ACCEPT',
              amountBefore: 15000000,
              amountAfter: 15000000,
              notes: 'Nasabah menyetujui Perjanjian Kredit digital melalui Mobile App.',
            },
          ],
        },
      },
    });

    // 5. Data Pinjaman Rian Gunawan - Berhasil Dicairkan (Disbursed)
    const loan5 = await prisma.loanApplication.create({
      data: {
        orderNo: '26081414131705723745',
        applicantName: 'RIAN GUNAWAN',
        idNo: '3201081504880003',
        phone: '081233445566',
        accountNo: '001201000788',
        bankName: 'Bank Sentosa',
        loanType: 'KREDIT_MULTIGUNA',
        requestedAmount: 1500000,
        approvedAmount: 1500000,
        tenorMonth: 1,
        approvedTenor: 1,
        interestRate: 3.00,
        monthlyIncome: 7000000,
        dsrRatio: 21.40,
        creditScore: 760,
        slikStatus: 'LANCAR',
        status: 'DISBURSED',
        currentLayer: 'DISBURSEMENT',
        caNotes: 'Mikro kredit multiguna.',
        spvNotes: 'Lolos review.',
        // IBSCore info
        cif: '602043000237451',
        motherName: 'Suryani',
        birthPlace: 'BOGOR',
        birthDate: '1988-04-15',
        loanAccountNo: '2121020000404',
        spkNo: 'SPK-2026-0814',
        branchCode: '212',
        productCode: '102',
        creditType: '700',
        disbursementReceiptNo: 'TRX-20260814-001',
        reviewLogs: {
          create: [
            {
              operatorName: 'Operation Disburser',
              operatorRole: 'OPERATION',
              action: 'DISBURSEMENT_SUCCESS',
              amountBefore: 1500000,
              amountAfter: 1500000,
              notes: 'Dana sukses dicairkan ke Rekening 001201000788 via USSI CBS. No Rekening Pinjaman: 2121020000404, Kuitansi: TRX-20260814-001.',
            },
          ],
        },
      },
    });

    // 6. Data Pinjaman Maya Indah - Ditolak CA
    const loan6 = await prisma.loanApplication.create({
      data: {
        orderNo: '26081016301205991823',
        applicantName: 'MAYA INDAH LESTARI',
        idNo: '3173045501900004',
        phone: '087899112233',
        accountNo: '001201000899',
        bankName: 'Bank Sentosa',
        loanType: 'KREDIT_MULTIGUNA',
        requestedAmount: 8000000,
        approvedAmount: null,
        tenorMonth: 3,
        interestRate: 3.00,
        monthlyIncome: 4500000,
        dsrRatio: 62.20,
        creditScore: 540,
        slikStatus: 'PERHATIAN_KHUSUS',
        status: 'REJECTED_CA',
        currentLayer: 'LAYER_1_CA',
        caNotes: 'Ditolak: DSR terlalu tinggi (62.2%) dan riwayat SLIK memiliki riwayat tunggakan > 60 hari.',
        rejectionReason: 'DSR melebihi batas kebijakan kredit (maksimal 40%) & catatan SLIK Kol-2.',
        reviewLogs: {
          create: [
            {
              operatorName: 'Budi Santoso (CA)',
              operatorRole: 'CREDIT_ANALYST',
              action: 'CA_REJECT',
              amountBefore: 8000000,
              amountAfter: null,
              notes: 'Ditolak pada analisis tahap 1 karena risiko kredit melebihi batas toleransi.',
            },
          ],
        },
      },
    });

    console.log('✅ Berhasil memasukkan 6 pinjaman demo pada berbagai tahapan!');
  } catch (error) {
    console.error('❌ Terjadi error saat seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
