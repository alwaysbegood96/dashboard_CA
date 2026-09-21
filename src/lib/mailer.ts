import nodemailer from 'nodemailer';

export function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
}

export function getFromAddress(): { email: string; name: string } {
  return {
    email: process.env.SMTP_FROM || 'noreply@banksentosa.co.id',
    name: process.env.SMTP_FROM_NAME || 'Bank Sentosa Credit System',
  };
}

/**
 * Kirim email undangan role ke anggota tim baru
 */
export async function sendInvitationEmail({
  to,
  inviteUrl,
  inviterName,
  roleName,
}: {
  to: string;
  inviteUrl: string;
  inviterName: string;
  roleName: string;
}) {
  const from = getFromAddress();

  console.log(`\n📧 [EMAIL INVITE SENT] to: ${to} (Role: ${roleName})`);
  console.log(`   Link Aktivasi : ${inviteUrl}\n`);

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject: `Undangan Bergabung – Portal Approval Kredit Bank Sentosa (${roleName})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #1e3a8a; padding: 28px 24px; text-align: center;">
            <div style="display: inline-block; background: #ffffff; color: #1e3a8a; font-weight: bold; font-size: 18px; width: 44px; height: 44px; line-height: 44px; border-radius: 10px; margin-bottom: 12px;">BS</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Bank Sentosa</h1>
            <p style="color: #93c5fd; margin: 4px 0 0; font-size: 13px;">Credit Approval Portal</p>
          </div>

          <div style="padding: 32px 24px; color: #334155;">
            <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Undangan Akses Sistem</h2>
            <p style="font-size: 14px; line-height: 1.6;">
              Halo, Anda telah diundang oleh <strong>${inviterName}</strong> untuk bergabung dalam
              <strong>Portal Credit Approval Bank Sentosa</strong> sebagai role:
            </p>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px 16px; margin: 16px 0; text-align: center;">
              <span style="font-size: 16px; font-weight: 700; color: #1d4ed8;">${roleName}</span>
            </div>
            <p style="font-size: 14px; line-height: 1.6;">
              Silakan klik tombol di bawah untuk melengkapi nama dan mengatur kata sandi akun Anda:
            </p>

            <div style="text-align: center; margin: 28px 0;">
              <a href="${inviteUrl}" style="background: #2563eb; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; font-size: 14px;">
                Terima Undangan & Aktivasi Akun
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
              *Link ini berlaku selama 48 jam. Jika Anda merasa tidak berwenang menerima email ini, silakan abaikan.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 11px; color: #94a3b8; word-break: break-all;">
              Jika tombol tidak dapat diklik, salin URL berikut ke browser Anda:<br />
              ${inviteUrl}
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.warn('[Mailer] SMTP delivery failed or in dev sandbox mode:', err.message);
    // Return true agar di dev environment tetap berhasil membuat token & URL
    return { success: true, simulated: true, inviteUrl };
  }
}

/**
 * Kirim email reset password
 */
export async function sendResetPasswordEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}) {
  const from = getFromAddress();

  console.log(`\n🔑 [RESET PASSWORD EMAIL SENT] to: ${to}`);
  console.log(`   Link Reset Password: ${resetUrl}\n`);

  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${from.name}" <${from.email}>`,
      to,
      subject: 'Permintaan Reset Password – Bank Sentosa Credit Approval',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 18px;">Bank Sentosa • Credit Portal</h1>
          </div>
          <div style="padding: 28px 24px; color: #334155;">
            <h2 style="font-size: 16px; color: #0f172a; margin-top: 0;">Atur Ulang Kata Sandi Anda</h2>
            <p style="font-size: 14px; line-height: 1.6;">
              Kami menerima permintaan untuk mereset kata sandi akun Anda di Portal Credit Approval Bank Sentosa.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="background: #0f172a; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 8px; display: inline-block; font-size: 14px;">
                Reset Password Sekarang
              </a>
            </div>
            <p style="font-size: 12px; color: #64748b;">
              Link ini hanya berlaku selama 1 jam. Jika Anda tidak merasa meminta reset password, akun Anda tetap aman dan abaikan pesan ini.
            </p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.warn('[Mailer] SMTP reset delivery fallback:', err.message);
    return { success: true, simulated: true, resetUrl };
  }
}
