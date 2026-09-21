'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/actions/rbac';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff, Globe } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('jimmy.dolly@banksentosa.co.id');
  const [password, setPassword] = useState('SentosaAdmin@2025');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await loginUser(email, password);
    setLoading(false);

    if (res.success) {
      router.push('/');
      router.refresh();
    } else {
      setErrorMsg(res.error || 'Login gagal.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Top right language toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center rounded-xl bg-slate-900/80 p-0.5 border border-slate-800 text-xs shadow-2xs">
        <div className="px-1 text-slate-500">
          <Globe className="h-3.5 w-3.5" />
        </div>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('zh')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            language === 'zh' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          中文
        </button>
        <button
          type="button"
          onClick={() => setLanguage('id')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            language === 'id' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ID
        </button>
      </div>

      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
            BS
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          {t.login.title}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          {t.login.subtitle}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          {errorMsg && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300">
                {t.login.emailLabel}
              </label>
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
                  className="block w-full pl-9 pr-3 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  {t.login.passwordLabel}
                </label>
                <Link
                  href="/reset-password"
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {language === 'zh' ? '忘记密码？' : language === 'en' ? 'Forgot password?' : 'Lupa password?'}
                </Link>
              </div>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 border border-slate-700 bg-slate-950/70 text-slate-100 placeholder-slate-500 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none cursor-pointer disabled:opacity-50 transition-all mt-2"
            >
              {loading ? (
                t.login.signingIn
              ) : (
                <>
                  <span>{t.login.signInBtn}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Guide */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              {t.login.demoHint}
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono text-[10px] space-y-1">
              <div>Email : <span className="text-slate-200">jimmy.dolly@banksentosa.co.id</span></div>
              <div>Pass  : <span className="text-slate-200">SentosaAdmin@2025</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
