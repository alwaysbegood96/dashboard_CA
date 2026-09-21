'use server';

import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail, sendResetPasswordEmail } from '@/lib/mailer';
import { revalidatePath } from 'next/cache';
import { AppPermissionKey, RoleWithUsers, AdminUserItem } from '@/types/rbac';

/**
 * 1. Ambil semua role beserta permissions
 */
export async function getRoles(): Promise<RoleWithUsers[]> {
  try {
    const roles = await prisma.adminRole.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      permissions: r.permissions,
      isSystem: r.isSystem,
      userCount: r._count.users,
    }));
  } catch (err) {
    console.error('getRoles error:', err);
    return [];
  }
}

/**
 * 2. Toggle dynamic permission matrix ON / OFF untuk sebuah role
 */
export async function toggleRolePermission(
  roleId: string,
  permissionKey: AppPermissionKey,
  enabled: boolean
) {
  try {
    const role = await prisma.adminRole.findUnique({ where: { id: roleId } });
    if (!role) throw new Error('Role tidak ditemukan');

    // Super Admin permissions selalu locked full
    if (role.name === 'SUPER_ADMIN') {
      return { success: false, error: 'Permission Super Admin tidak dapat diubah (All Access).' };
    }

    let updatedPermissions = [...role.permissions];
    if (enabled) {
      if (!updatedPermissions.includes(permissionKey)) {
        updatedPermissions.push(permissionKey);
      }
    } else {
      updatedPermissions = updatedPermissions.filter((p) => p !== permissionKey);
    }

    await prisma.adminRole.update({
      where: { id: roleId },
      data: { permissions: updatedPermissions },
    });

    revalidatePath('/');
    return { success: true, permissions: updatedPermissions };
  } catch (err: any) {
    console.error('toggleRolePermission error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 3. Ambil daftar user admin / tim internal
 */
export async function getAdminUsers(): Promise<AdminUserItem[]> {
  try {
    const users = await prisma.adminUser.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      roleId: u.roleId,
      roleName: u.role?.name ?? null,
      roleDisplayName: u.role?.displayName ?? null,
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (err) {
    console.error('getAdminUsers error:', err);
    return [];
  }
}

/**
 * 4. Toggle status aktif user
 */
export async function toggleUserActive(userId: string, isActive: boolean) {
  try {
    await prisma.adminUser.update({
      where: { id: userId },
      data: { isActive },
    });
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 5. Invite user baru via SMTP email
 */
export async function sendUserInvite(payload: {
  email: string;
  roleId: string;
  inviterName: string;
}) {
  try {
    const email = payload.email.trim().toLowerCase();
    const role = await prisma.adminRole.findUnique({ where: { id: payload.roleId } });
    if (!role) throw new Error('Role yang dipilih tidak valid');

    const existingUser = await prisma.adminUser.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error(`Email ${email} sudah terdaftar sebagai pengguna.`);
    }

    // Hapus pending token lama untuk email ini jika ada
    await prisma.adminInvitation.deleteMany({
      where: { email, acceptedAt: null },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 jam

    await prisma.adminInvitation.create({
      data: {
        email,
        roleId: payload.roleId,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3001';
    const inviteUrl = `${appUrl}/invite/accept?token=${token}`;

    const mailResult = await sendInvitationEmail({
      to: email,
      inviteUrl,
      inviterName: payload.inviterName || 'Administrator',
      roleName: role.displayName,
    });

    revalidatePath('/');
    return {
      success: true,
      inviteUrl,
      simulated: (mailResult as any).simulated,
      message: `Undangan berhasil diterbitkan untuk ${email} sebagai ${role.displayName}`,
    };
  } catch (err: any) {
    console.error('sendUserInvite error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * 6. Verifikasi Token Undangan
 */
export async function getInviteDetails(token: string) {
  try {
    const invite = await prisma.adminInvitation.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invite) return { valid: false, reason: 'Token undangan tidak valid atau tidak ditemukan.' };
    if (invite.acceptedAt) return { valid: false, reason: 'Undangan ini sudah digunakan.' };
    if (new Date() > invite.expiresAt) return { valid: false, reason: 'Undangan telah kadaluarsa (melebihi 48 jam).' };

    return {
      valid: true,
      email: invite.email,
      roleName: invite.role.name,
      roleDisplayName: invite.role.displayName,
    };
  } catch (err: any) {
    return { valid: false, reason: err.message };
  }
}

/**
 * 7. Terima undangan & aktivasi akun baru
 */
export async function acceptUserInvite(payload: {
  token: string;
  name: string;
  password: string;
}) {
  try {
    const invite = await prisma.adminInvitation.findUnique({
      where: { token: payload.token },
    });
    if (!invite || invite.acceptedAt || new Date() > invite.expiresAt) {
      throw new Error('Undangan tidak valid atau sudah kadaluarsa.');
    }

    const passwordHash = await hash(payload.password, 10);

    await prisma.$transaction([
      prisma.adminUser.create({
        data: {
          name: payload.name,
          email: invite.email,
          passwordHash,
          roleId: invite.roleId,
          isActive: true,
        },
      }),
      prisma.adminInvitation.update({
        where: { token: payload.token },
        data: { acceptedAt: new Date() },
      }),
    ]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 8. Request Password Reset (Kirim Email via SMTP)
 */
export async function requestPasswordReset(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.adminUser.findUnique({ where: { email: cleanEmail } });

    if (!user) {
      // Keamanan: jangan beri tahu jika email tidak ada, return true generik
      return { success: true, message: 'Jika email terdaftar, instruksi reset password telah dikirim.' };
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await prisma.passwordReset.create({
      data: {
        email: cleanEmail,
        token,
        expiresAt,
      },
    });

    const appUrl = process.env.APP_URL || 'http://localhost:3001';
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const res = await sendResetPasswordEmail({ to: cleanEmail, resetUrl });

    return {
      success: true,
      resetUrl,
      simulated: (res as any).simulated,
      message: 'Instruksi reset password telah dikirim ke email Anda.',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 9. Submit Reset Password Baru
 */
export async function completePasswordReset(token: string, newPass: string) {
  try {
    const pr = await prisma.passwordReset.findUnique({ where: { token } });
    if (!pr || pr.usedAt || new Date() > pr.expiresAt) {
      throw new Error('Token reset password tidak valid atau sudah kadaluarsa.');
    }

    const passwordHash = await hash(newPass, 10);

    await prisma.$transaction([
      prisma.adminUser.update({
        where: { email: pr.email },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { token },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 10. Login User (Verifikasi Kredensial & Set Cookie Sesi)
 */
export async function loginUser(email: string, pass: string) {
  try {
    const { compare } = await import('bcryptjs');
    const { cookies } = await import('next/headers');

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
      include: { role: true },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: 'Email atau password salah.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Akun Anda sedang dinonaktifkan oleh administrator.' };
    }

    const isValid = await compare(pass, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Email atau password salah.' };
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name || 'CREDIT_ANALYST',
      roleDisplayName: user.role?.displayName || 'Credit Analyst',
      permissions: user.role?.permissions || [],
    };

    const cookieStore = await cookies();
    cookieStore.set('ca_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true, user: sessionData };
  } catch (err: any) {
    console.error('loginUser error:', err);
    return { success: false, error: 'Terjadi kesalahan sistem saat login.' };
  }
}

/**
 * 11. Ambil Sesi User Login Saat Ini
 */
export async function getCurrentSession() {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('ca_session');

    if (!sessionCookie?.value) {
      // Default fallback: Super Admin Jimmy Dolly agar flow dev tetap mulus jika belum login
      const defaultUser = await prisma.adminUser.findFirst({
        where: { email: 'jimmy.dolly@banksentosa.co.id' },
        include: { role: true },
      });

      return {
        id: defaultUser?.id || 'super-admin-id',
        name: defaultUser?.name || 'Jimmy Dolly',
        email: defaultUser?.email || 'jimmy.dolly@banksentosa.co.id',
        role: (defaultUser?.role?.name || 'SUPER_ADMIN') as any,
        roleDisplayName: defaultUser?.role?.displayName || 'Super Admin (Head of Risk)',
        permissions: defaultUser?.role?.permissions || [
          'credit:review_layer1',
          'credit:approve_layer2',
          'credit:disburse',
          'users:invite',
          'users:manage',
          'roles:matrix_manage',
        ],
      };
    }

    const parsed = JSON.parse(sessionCookie.value);
    // Refresh permission terbaru dari database
    const freshUser = await prisma.adminUser.findUnique({
      where: { id: parsed.id },
      include: { role: true },
    });

    if (freshUser && freshUser.role) {
      parsed.permissions = freshUser.role.permissions;
      parsed.role = freshUser.role.name;
      parsed.roleDisplayName = freshUser.role.displayName;
    }

    return parsed;
  } catch (err) {
    console.error('getCurrentSession error:', err);
    return null;
  }
}

/**
 * 12. Switch Session User (Interactive Testing Helper)
 */
export async function switchSessionUser(email: string) {
  try {
    const { cookies } = await import('next/headers');
    const user = await prisma.adminUser.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) throw new Error('User tidak ditemukan');

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name || 'CREDIT_ANALYST',
      roleDisplayName: user.role?.displayName || 'Credit Analyst',
      permissions: user.role?.permissions || [],
    };

    const cookieStore = await cookies();
    cookieStore.set('ca_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    revalidatePath('/');
    return { success: true, user: sessionData };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 13. Logout User
 */
export async function logoutUser() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  cookieStore.delete('ca_session');
  revalidatePath('/');
  return { success: true };
}

