'use client';

import React, { useState, useEffect } from 'react';
import {
  getRoles,
  toggleRolePermission,
  getAdminUsers,
  toggleUserActive,
  sendUserInvite,
} from '@/actions/rbac';
import { RoleWithUsers, AdminUserItem, ALL_PERMISSIONS, AppPermissionKey } from '@/types/rbac';
import {
  Shield,
  Users,
  Mail,
  Check,
  X,
  UserPlus,
  Lock,
  RefreshCw,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RbacModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: string;
}

export default function RbacModal({ isOpen, onClose, currentUserRole }: RbacModalProps) {
  const [activeTab, setActiveTab] = useState<'matrix' | 'users' | 'invite'>('matrix');
  const [roles, setRoles] = useState<RoleWithUsers[]>([]);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Invite Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ text: string; type: 'success' | 'error'; url?: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [rolesData, usersData] = await Promise.all([getRoles(), getAdminUsers()]);
    setRoles(rolesData);
    setUsers(usersData);
    if (rolesData.length > 0 && !inviteRoleId) {
      // Default to non-superadmin role for invite
      const defaultRole = rolesData.find((r) => r.name === 'CREDIT_ANALYST') || rolesData[1];
      if (defaultRole) setInviteRoleId(defaultRole.id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setInviteFeedback(null);
    }
  }, [isOpen]);

  const handleToggle = async (roleId: string, permKey: AppPermissionKey, currentVal: boolean) => {
    // Optimistic UI update
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const newPerms = currentVal
          ? r.permissions.filter((p) => p !== permKey)
          : [...r.permissions, permKey];
        return { ...r, permissions: newPerms };
      })
    );

    const res = await toggleRolePermission(roleId, permKey, !currentVal);
    if (!res.success) {
      alert(res.error || 'Gagal mengubah permission.');
      loadData(); // Revert
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRoleId) return;

    setInviting(true);
    setInviteFeedback(null);

    const res = await sendUserInvite({
      email: inviteEmail,
      roleId: inviteRoleId,
      inviterName: 'Jimmy Dolly (Super Admin)',
    });
    setInviting(false);

    if (res.success) {
      setInviteFeedback({
        text: res.message || 'Undangan berhasil dikirim!',
        type: 'success',
        url: res.inviteUrl,
      });
      setInviteEmail('');
      loadData();
    } else {
      setInviteFeedback({
        text: res.error || 'Gagal mengirim undangan.',
        type: 'error',
      });
    }
  };

  const handleToggleUser = async (userId: string, currentActive: boolean) => {
    const res = await toggleUserActive(userId, !currentActive);
    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentActive } : u))
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Roles & Dynamic Permission Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Manajemen hak akses, undang tim via SMTP, dan toggle permission matriks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-2">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Dynamic Permission Matrix
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Anggota Tim ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('invite')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border-b-2 transition-all cursor-pointer ${
              activeTab === 'invite'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="h-3.5 w-3.5" />
            Undang User Baru (via SMTP)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── TAB 1: DYNAMIC MATRIX ──────────────────────────────── */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Matriks Perizinan Role
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik toggle switch untuk mengaktifkan atau menonaktifkan izin secara langsung.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={loading}
                  className="h-8 gap-1.5 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Matrix</span>
                </Button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700">
                      <th className="p-3 font-semibold min-w-[220px]">Hak Akses / Modul</th>
                      {roles.map((role) => (
                        <th key={role.id} className="p-3 font-semibold text-center min-w-[150px]">
                          <span className="block font-bold text-slate-900">{role.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({role.name})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ALL_PERMISSIONS.map((perm) => (
                      <tr key={perm.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 space-y-0.5">
                          <div className="font-semibold text-slate-900">{perm.label}</div>
                          <div className="text-[11px] text-slate-500 leading-relaxed">
                            {perm.description}
                          </div>
                        </td>

                        {roles.map((role) => {
                          const isAllowed = role.permissions.includes(perm.key);
                          const isSuper = role.name === 'SUPER_ADMIN';

                          return (
                            <td key={role.id} className="p-3 text-center align-middle">
                              {isSuper ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  <Check className="h-3 w-3" />
                                  Full Access
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggle(role.id, perm.key, isAllowed)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                    isAllowed ? 'bg-blue-600' : 'bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                      isAllowed ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 2: USER MANAGEMENT ─────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Daftar Pengguna & Tim Internal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Akun yang memiliki akses login ke Portal Credit Approval Bank Sentosa.
                  </p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                      <th className="p-3 font-semibold">Nama & Email</th>
                      <th className="p-3 font-semibold">Role Terdaftar</th>
                      <th className="p-3 font-semibold text-center">Status Akun</th>
                      <th className="p-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              u.roleName === 'SUPER_ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.roleName === 'ADMIN'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {u.roleDisplayName || u.roleName || 'Tanpa Role'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {u.isActive ? 'AKTIF' : 'NON-AKTIF'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {u.roleName !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleToggleUser(u.id, u.isActive)}
                              className={`text-[11px] font-medium underline cursor-pointer ${
                                u.isActive ? 'text-rose-600 hover:text-rose-700' : 'text-emerald-600 hover:text-emerald-700'
                              }`}
                            >
                              {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 3: INVITE USER (SMTP) ──────────────────────────── */}
          {activeTab === 'invite' && (
            <div className="max-w-lg mx-auto space-y-5 py-2">
              <div className="text-center space-y-1">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Undang Anggota Tim Baru</h3>
                <p className="text-xs text-slate-500">
                  Sistem akan mengirimkan email aktivasi via SMTP resmi Bank Sentosa ke calon pengguna.
                </p>
              </div>

              {inviteFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    inviteFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    {inviteFeedback.type === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    )}
                    {inviteFeedback.text}
                  </div>
                  {inviteFeedback.url && (
                    <div className="bg-white/80 p-2 rounded border border-emerald-200/60 font-mono text-[10px] break-all select-all">
                      Link Aktivasi: {inviteFeedback.url}
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSendInvite} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                <div>
                  <Label htmlFor="inviteEmail" className="text-xs font-semibold text-slate-700">
                    Email Pengguna (Bank Sentosa)
                  </Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="contoh: analis.kredit@banksentosa.co.id"
                    className="mt-1 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="inviteRole" className="text-xs font-semibold text-slate-700">
                    Pilih Role / Hak Akses
                  </Label>
                  <select
                    id="inviteRole"
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 focus:outline-blue-600"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.displayName} ({r.name})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={inviting}
                  className="w-full gap-2 cursor-pointer text-xs font-semibold h-9"
                >
                  {inviting ? (
                    'Mengirim via SMTP...'
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim Undangan Akses</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-100 text-[11px] text-blue-900 space-y-1">
                <strong>Catatan Konfigurasi SMTP:</strong>
                <p className="text-slate-600 leading-relaxed">
                  Pengaturan host, port, dan kredensial SMTP diambil langsung dari file environment <code>.env</code> (atau <code>.env.dev</code>). Di mode sandbox lokal, link aktivasi akan langsung disediakan di layar jika SMTP offline.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
