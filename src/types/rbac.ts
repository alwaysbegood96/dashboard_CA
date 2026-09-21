export type AppPermissionKey =
  | 'credit:review_layer1'
  | 'credit:approve_layer2'
  | 'credit:disburse'
  | 'users:invite'
  | 'users:manage'
  | 'roles:matrix_manage';

export interface PermissionDefinition {
  key: AppPermissionKey;
  label: string;
  category: 'Credit Workflow' | 'User & Security';
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'credit:review_layer1',
    label: 'Layer 1: Credit Analyst Review',
    category: 'Credit Workflow',
    description: 'Analisis kapasitas debitur, input scoring, telepon verifikasi, dan rekomendasi plafon.',
  },
  {
    key: 'credit:approve_layer2',
    label: 'Layer 2: Supervisor Final Approval',
    category: 'Credit Workflow',
    description: 'Persetujuan akhir plafon, penolakan SPV, pengembalian berkas ke CA, dan penerbitan offering.',
  },
  {
    key: 'credit:disburse',
    label: 'Disbursement Execution',
    category: 'Credit Workflow',
    description: 'Eksekusi pembukuan realisasi pencairan dana ke USSI Core Banking (IBSCore).',
  },
  {
    key: 'users:invite',
    label: 'Invite Tim via SMTP',
    category: 'User & Security',
    description: 'Mengirim email undangan pendaftaran role baru kepada karyawan.',
  },
  {
    key: 'users:manage',
    label: 'Kelola Status Akun Tim',
    category: 'User & Security',
    description: 'Mengaktifkan / menonaktifkan akun user dan reset akses.',
  },
  {
    key: 'roles:matrix_manage',
    label: 'Toggle Dynamic Permission Matrix',
    category: 'User & Security',
    description: 'Mengubah hak akses izin matrix secara real-time pada setiap role.',
  },
];

export interface RoleWithUsers {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  roleId: string | null;
  roleName: string | null;
  roleDisplayName: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'CREDIT_ANALYST';
  roleDisplayName: string;
  permissions: string[];
}
