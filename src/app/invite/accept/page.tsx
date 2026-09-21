'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getInviteDetails, acceptUserInvite } from '@/actions/rbac';
import { Lock, User, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [inviteInfo, setInviteInfo] = useState<{
    valid: boolean;
    email?: string;
    roleDisplayName?: string;
    reason?: string;
  } | null>(null);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadingDetails(false);
      setInviteInfo({ valid: false, reason: 'Token undangan tidak disertakan.' });
      return;
    }

    getInviteDetails(token).then((res) => {
      setLoadingDetails(false);
      setInviteInfo(res as any);
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const res = await acceptUserInvite({
      token: token!,
      name,
      password,
    });
    setSubmitting(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setErrorMsg(res.error || 'Gagal mengaktivasi akun.');
    }
  };

  if (loadingDetails) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">
        Memeriksa undangan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            BS
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Aktivasi Akun Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Bank Sentosa • Credit Approval System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {!inviteInfo?.valid ? (
            <div className="text-center space-y-4 py-4">
              <div className="h-12 w-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Undangan Tidak Valid</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {inviteInfo?.reason || 'Link undangan ini sudah tidak berlaku atau sudah kadaluarsa.'}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
              >
                Menuju Halaman Login
              </button>
            </div>
          ) : success ? (
            <div className="text-center space-y-4 py-4">
              <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-white">Akun Berhasil Diaktivasi!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Selamat! Akun Anda telah aktif dengan role <strong>{inviteInfo.roleDisplayName}</strong>.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
              >
                Masuk Sekarang
              </button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                  {errorMsg}
                </div>
              )}

              <div className="bg-blue-950/40 border border-blue-800/40 rounded-lg p-3 space-y-1">
                <span className="text-[11px] text-blue-300 block font-medium">Informasi Akun Diundang:</span>
                <div className="text-xs text-white font-mono">{inviteInfo.email}</div>
                <div className="text-[11px] text-blue-400 flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Role: <strong>{inviteInfo.roleDisplayName}</strong></span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Nama Lengkap</label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Password Baru</label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Konfirmasi Password</label>
                <div className="mt-1.5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Mengaktifkan...' : 'Konfirmasi & Masuk'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Memuat...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
