import React, { useState } from 'react';
import { User } from '../types';
import { MockStorage } from '../data/mockStorage';
import { Logo } from './Logo';
import { ForgotPasswordModal } from './modals/ForgotPasswordModal';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Building,
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User, gymId?: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [roleMode, setRoleMode] = useState<'MAINTAINER' | 'ADMIN'>('MAINTAINER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const targetRole = roleMode === 'ADMIN' ? 'SUPER_ADMIN' : 'GYM_MAINTAINER';
    let result = MockStorage.validateLogin(cleanEmail, cleanPassword, targetRole);

    // If user entered admin credentials while in maintainer mode, auto-validate and log them in
    if (!result.success && result.suggestedRole) {
      const fallbackResult = MockStorage.validateLogin(
        cleanEmail,
        cleanPassword,
        result.suggestedRole
      );
      if (fallbackResult.success && fallbackResult.user) {
        result = fallbackResult;
      }
    }

    if (result.success && result.user) {
      // Successful login
      MockStorage.setActiveSession({
        user: result.user,
        gymId: result.gymId,
      });
      onLoginSuccess(result.user, result.gymId);
    } else {
      if (result.suggestedRole) {
        setErrorMessage(
          result.error ||
            `This is an ${result.suggestedRole === 'SUPER_ADMIN' ? 'Admin' : 'Gym Maintainer'} account. Please switch to ${result.suggestedRole === 'SUPER_ADMIN' ? 'Admin' : 'Gym Maintainer'} login below.`
        );
      } else {
        setErrorMessage(result.error || 'Invalid credentials. Please verify email and password.');
      }
    }
  };

  const handleAutoFillAndLogin = (
    autoEmail: string,
    autoPass: string,
    userRole: 'SUPER_ADMIN' | 'GYM_MAINTAINER'
  ) => {
    setEmail(autoEmail);
    setPassword(autoPass);
    const newMode = userRole === 'SUPER_ADMIN' ? 'ADMIN' : 'MAINTAINER';
    setRoleMode(newMode);
    setErrorMessage(null);

    const result = MockStorage.validateLogin(autoEmail, autoPass, userRole);
    if (result.success && result.user) {
      MockStorage.setActiveSession({
        user: result.user,
        gymId: result.gymId,
      });
      onLoginSuccess(result.user, result.gymId);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-xl p-7 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center pt-1">
          <Logo size="xl" showText textColor="text-slate-900" />
          <p className="text-xs text-slate-500 mt-2 text-center font-medium">
            {roleMode === 'ADMIN'
              ? 'System Administrator Management Console'
              : 'Gym Membership & Subscription Management Platform'}
          </p>
        </div>

        {/* Admin Mode Indicator (only shown when switched to Admin mode) */}
        {roleMode === 'ADMIN' && (
          <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Login Mode</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setRoleMode('MAINTAINER');
                setErrorMessage(null);
              }}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline cursor-pointer"
            >
              Back to Gym Login
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div
            className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug font-medium">
              <span>{errorMessage}</span>
              {errorMessage.includes('switch') && (
                <button
                  type="button"
                  onClick={() => {
                    setRoleMode(roleMode === 'ADMIN' ? 'MAINTAINER' : 'ADMIN');
                    setErrorMessage(null);
                  }}
                  className="block mt-1 font-bold underline text-rose-900 cursor-pointer"
                >
                  Switch to {roleMode === 'ADMIN' ? 'Gym Maintainer' : 'Admin'} Login now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-email-input">
              {roleMode === 'ADMIN' ? 'Admin Email' : 'Gym Maintainer Email'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                id="login-email-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  roleMode === 'ADMIN'
                    ? 'admin@email.com or admin@fitora.com'
                    : 'e.g. iamsudheer786@gmail.com'
                }
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="login-password-input">
                Password
              </label>
              <button
                type="button"
                id="login-forgot-password-btn"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="w-full bg-[#0f172a] hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Log in as {roleMode === 'ADMIN' ? 'Admin' : 'Gym Maintainer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Admin Login link below form */}
        <div className="pt-2 border-t border-slate-100 flex flex-col items-center">
          {roleMode === 'MAINTAINER' ? (
            <button
              type="button"
              id="switch-to-admin-login-btn"
              onClick={() => {
                setRoleMode('ADMIN');
                setErrorMessage(null);
              }}
              className="group inline-flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
              <span>Are you a system administrator? <span className="text-slate-900 font-bold underline">Admin Login</span></span>
            </button>
          ) : (
            <button
              type="button"
              id="switch-to-maintainer-login-btn"
              onClick={() => {
                setRoleMode('MAINTAINER');
                setErrorMessage(null);
              }}
              className="group inline-flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Return to <span className="text-slate-900 font-bold underline">Gym Maintainer Login</span></span>
            </button>
          )}
        </div>

        {/* Security badge footer */}
        <div className="pt-1 flex items-center justify-center gap-1.5 text-slate-400 text-xs text-center font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Multi-Tenant Partition Protection Active</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={email}
        onAutoFillPassword={handleAutoFillAndLogin}
      />
    </div>
  );
};
