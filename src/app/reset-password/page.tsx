'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { requestPasswordReset, completePasswordReset } from '@/actions/rbac';
import { Lock, Mail, ArrowRight, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  // Step 1: Request Reset
  const [email, setEmail] = useState('');
  const [requestSuccess, setRequestSuccess] = useState<string | null>(null);

  // Step 2: New Password with Token
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.success) {
      setRequestSuccess(res.message || 'Instruksi reset password telah dikirim ke email Anda.');
    } else {
      setErrorMsg(res.error || 'Gagal mengirim instruksi reset.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await completePasswordReset(token!, newPassword);
    setLoading(false);

    if (res.success) {
      setResetSuccess(true);
    } else {
      setErrorMsg(res.error || 'Gagal mereset password.');
    }
  };

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
          {token ? 'Buat Password Baru' : 'Reset Password'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Bank Sentosa • Credit Approval Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {errorMsg && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          {token ? (
            /* Mode Input Password Baru */
            resetSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">Password Berhasil Diperbarui!</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kata sandi akun Anda telah berhasil diubah. Silakan masuk menggunakan kata sandi baru.
                </p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleCompleteReset}>
                <p className="text-xs text-slate-400">
                  Masukkan kata sandi baru untuk akun Anda.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Password Baru</label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-blue-500"
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
                      placeholder="Ketik ulang password baru"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                </button>
              </form>
            )
          ) : (
            /* Mode Minta Link Reset */
            requestSuccess ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-12 w-12 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-white">Cek Email Anda</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{requestSuccess}</p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Login</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleRequestReset}>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Masukkan email perusahaan Anda yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi via email SMTP.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Email Perusahaan</label>
                  <div className="mt-1.5 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@banksentosa.co.id"
                      className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Mengirim...' : 'Kirim Link Reset Password'}
                </button>

                <div className="text-center pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Batal dan kembali</span>
                  </Link>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs">Memuat...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
