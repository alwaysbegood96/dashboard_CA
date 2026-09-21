/**
 * Script diagnostik: tampilkan semua distinct loan_status dari dev MySQL
 * Jalankan: npx tsx src/scripts/check-loan-statuses.ts
 */
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { queryRemoteMySQL } = await import('../lib/mysql');

  console.log('\n=== DISTINCT loan_status dari sys_user_loan di DEV MySQL ===\n');

  const statuses = await queryRemoteMySQL(`
    SELECT loan_status, COUNT(*) as count 
    FROM sys_user_loan 
    GROUP BY loan_status 
    ORDER BY count DESC
  `);

  console.table(statuses);

  console.log('\n=== Contoh 10 record terbaru ===\n');

  const samples = await queryRemoteMySQL(`
    SELECT order_no, real_name, loan_status, amount, loan_real_val, noRekening
    FROM sys_user_loan
    ORDER BY id DESC
    LIMIT 10
  `);

  console.table(samples);

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
