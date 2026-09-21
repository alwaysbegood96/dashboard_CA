import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing SSH Tunnel & MySQL from dashboard_CA...');
  const { queryRemoteMySQL } = await import('../lib/mysql');

  try {
    const rows = await queryRemoteMySQL('SELECT COUNT(*) as total FROM sys_user_info');
    console.log('🎉 SUCCESS! Total users in server dev (digital_bank_cs):', rows[0]?.total);

    const sample = await queryRemoteMySQL(
      'SELECT id, user_id, real_name, create_time FROM sys_user_info ORDER BY id DESC LIMIT 3'
    );
    console.log('Sample dev records:', sample);
  } catch (err: any) {
    console.error('❌ Connection test error:', err.message);
  } finally {
    process.exit(0);
  }
}

main();
