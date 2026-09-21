import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const { queryRemoteMySQL } = await import('../lib/mysql');

  // Get all columns from sys_user_loan
  const cols = await queryRemoteMySQL(`DESCRIBE sys_user_loan`);
  console.log('\n=== KOLOM sys_user_loan ===');
  console.table(cols);

  // Get all fail_lend records with more detail
  const failLend = await queryRemoteMySQL(`
    SELECT id, order_no, real_name, loan_status, amount, loan_real_val, 
           noRekening, loan_period, create_time, user_id
    FROM sys_user_loan 
    WHERE loan_status = 'fail_lend'
    ORDER BY id DESC
  `);
  console.log('\n=== Semua fail_lend records ===');
  console.table(failLend);

  // Get all clear records
  const clear = await queryRemoteMySQL(`
    SELECT id, order_no, real_name, loan_status, amount, loan_real_val, 
           noRekening, loan_period, create_time
    FROM sys_user_loan 
    WHERE loan_status = 'clear'
    ORDER BY id DESC
  `);
  console.log('\n=== Semua clear records ===');
  console.table(clear);

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
