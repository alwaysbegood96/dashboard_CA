import mysql from 'mysql2/promise';
import { Client } from 'ssh2';
import net from 'net';

let pool: mysql.Pool | null = null;
let tunnelPort: number = 0;
let tunnelPromise: Promise<number> | null = null;

function setupSshTunnel(): Promise<number> {
  if (tunnelPort > 0) return Promise.resolve(tunnelPort);
  if (tunnelPromise) return tunnelPromise;

  tunnelPromise = new Promise((resolve, reject) => {
    const ssh = new Client();

    ssh.on('ready', () => {
      const server = net.createServer((socket) => {
        ssh.forwardOut(
          socket.remoteAddress || '127.0.0.1',
          socket.remotePort || 0,
          '127.0.0.1',
          Number(process.env.MYSQL_PORT || 3306),
          (err, stream) => {
            if (err) {
              socket.destroy();
              return;
            }
            socket.pipe(stream).pipe(socket);
          }
        );
      });

      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as net.AddressInfo;
        tunnelPort = addr.port;
        const sshHost = (process.env.SSH_HOST ?? '').replace(/^["']|["']$/g, '');
        console.log(`\n============================================================`);
        console.log(`✅ [SSH TUNNEL] STATUS: SUKSES TERHUBUNG!`);
        console.log(`   Host Remote : ${sshHost}:22`);
        console.log(`   Local Proxy : 127.0.0.1:${tunnelPort} -> Server MySQL:3306`);
        console.log(`============================================================\n`);
        resolve(tunnelPort);
      });

      server.on('error', (err) => {
        tunnelPromise = null;
        tunnelPort = 0;
        console.error(`\n❌ [SSH TUNNEL ERROR]: Gagal setup local proxy - ${err.message}\n`);
        reject(err);
      });

      ssh.on('close', () => {
        tunnelPort = 0;
        tunnelPromise = null;
        pool = null;
      });

      ssh.on('end', () => {
        tunnelPort = 0;
        tunnelPromise = null;
        pool = null;
      });
    });

    ssh.on('error', (err) => {
      tunnelPromise = null;
      tunnelPort = 0;
      console.error(`\n❌ [SSH AUTH ERROR]: Autentikasi SSH ke ${process.env.SSH_HOST} GAGAL!`);
      console.error(`   Pesan: ${err.message}`);
      console.error(`   Cek kembali SSH_USER & SSH_PASSWORD di file .env\n`);
      reject(err);
    });

    const sshHost = (process.env.SSH_HOST ?? '').replace(/^["']|["']$/g, '');
    const sshPort = Number((process.env.SSH_PORT ?? '22').replace(/^["']|["']$/g, ''));
    const sshUser = (process.env.SSH_USER ?? 'root').replace(/^["']|["']$/g, '');
    const sshPassword = (process.env.SSH_PASSWORD ?? '').replace(/^["']|["']$/g, '');

    ssh.connect({
      host: sshHost,
      port: sshPort,
      username: sshUser,
      password: sshPassword,
    });
  });

  return tunnelPromise;
}

export async function getRemoteMySQLPool(): Promise<mysql.Pool> {
  const hasSsh = !!process.env.SSH_HOST && process.env.SSH_HOST.trim() !== '';

  let host = (process.env.MYSQL_HOST ?? '127.0.0.1').replace(/^["']|["']$/g, '');
  let port = Number((process.env.MYSQL_PORT ?? '3306').replace(/^["']|["']$/g, ''));

  if (hasSsh) {
    const activePort = await setupSshTunnel();
    host = '127.0.0.1';
    port = activePort;
  }

  if (!pool) {
    const dbUser = (process.env.MYSQL_USER ?? 'root').replace(/^["']|["']$/g, '');
    let dbPassword = (process.env.MYSQL_PASSWORD ?? '').replace(/^["']|["']$/g, '').replace(/\\\\\$/g, '$').replace(/\\\$/g, '$');
    // Failsafe: Next.js dotenv-expand expands unescaped '$42' to empty string (plmBank33&d3#a)
    if (dbPassword === 'plmBank33&d3#a') {
      dbPassword = 'plmBank33$42&d3#a';
    }
    const dbName = (process.env.MYSQL_DATABASE ?? 'digital_bank_cs').replace(/^["']|["']$/g, '');

    pool = mysql.createPool({
      host,
      port,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+00:00',
      charset: 'utf8mb4',
    });
  }

  return pool;
}

/**
 * Eksekusi query langsung ke MySQL server dev
 */
export async function queryRemoteMySQL<T = any>(sql: string, values?: any[]): Promise<T[]> {
  try {
    const p = await getRemoteMySQLPool();
    const [rows] = await p.query<any>(sql, values);
    return rows as T[];
  } catch (err: any) {
    // Reset pool on auth error or connection error so next call retries fresh
    if (pool && (err.code === 'ER_ACCESS_DENIED_ERROR' || err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST')) {
      try {
        await pool.end();
      } catch (_) {}
      pool = null;
    }
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`\n❌ [MYSQL AUTH ERROR]: Username/Password MySQL SALAH!`);
      console.error(`   User     : '${process.env.MYSQL_USER}'`);
      console.error(`   Database : '${process.env.MYSQL_DATABASE}'`);
      console.error(`   Pesan    : ${err.message}\n`);
    }
    throw err;
  }
}
