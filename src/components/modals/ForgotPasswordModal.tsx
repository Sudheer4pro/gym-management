import React, { useState, useEffect } from 'react';
import { KeyRound, Mail, X, Check, ExternalLink, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { MockStorage } from '../../data/mockStorage';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  onAutoFillPassword?: (email: string, password: string, role: 'SUPER_ADMIN' | 'GYM_MAINTAINER') => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
  onAutoFillPassword,
}) => {
  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'SUPER_ADMIN' | 'GYM_MAINTAINER';
    roleLabel: string;
    gymName?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setEmailInput(defaultEmail);
      setStatus('IDLE');
      setErrorMessage(null);
      setAccountInfo(null);
    }
  }, [isOpen, defaultEmail]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const targetEmail = emailInput.trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('SENDING');
    const adminCreds = MockStorage.getAdminCredentials();
    const allUsers = MockStorage.getAllUsers();
    const allGyms = MockStorage.getAllGyms();

    // Check admin
    if (
      targetEmail === adminCreds.email.toLowerCase() ||
      targetEmail === 'admin@email.com' ||
      targetEmail === 'admin@fitora.com'
    ) {
      setAccountInfo({
        name: 'System Admin',
        email: targetEmail,
        password: adminCreds.password || 'password123',
        role: 'SUPER_ADMIN',
        roleLabel: 'Super Admin',
      });
      setStatus('SENT');
      return;
    }

    // Check maintainers
    const user = allUsers.find((u) => u.email.toLowerCase() === targetEmail);
    if (user) {
      const gym = user.gymId ? allGyms.find((g) => g.id === user.gymId) : undefined;
      setAccountInfo({
        name: user.name,
        email: user.email,
        password: user.password || 'Fitora',
        role: user.role,
        roleLabel: user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Gym Maintainer',
        gymName: gym?.name,
      });
      setStatus('SENT');
      return;
    }

    setErrorMessage(`No account found with email "${targetEmail}". Please check the address and try again.`);
    setStatus('ERROR');
  };

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const emailSubject = encodeURIComponent('Your Fitora Password & Account Credentials');
  const emailBody = accountInfo
    ? encodeURIComponent(
        `Hi ${accountInfo.name},\n\n` +
        `You requested your login credentials for Fitora.\n\n` +
        `• Login Email: ${accountInfo.email}\n` +
        `• Password: ${accountInfo.password}\n` +
        `• Portal Role: ${accountInfo.roleLabel}\n` +
        (accountInfo.gymName ? `• Gym: ${accountInfo.gymName}\n` : '') +
        `• Login URL: ${appOrigin}\n\n` +
        `Best regards,\nFitora Admin Team`
      )
    : '';

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(accountInfo?.email || '')}&su=${emailSubject}&body=${emailBody}`;
  const mailtoUrl = `mailto:${encodeURIComponent(accountInfo?.email || '')}?subject=${emailSubject}&body=${emailBody}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      id="forgot-password-modal-overlay"
    >
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Header */}
        <div className="bg-[#0b0f19] p-5 sm:p-6 text-white relative shrink-0">
          <button
            type="button"
            id="forgot-password-modal-top-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer z-10"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="font-semibold">Close</span>
          </button>

          <div className="flex items-center gap-3 pr-20">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Password Recovery
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Instant retrieval for Admin and Gym Maintainer accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {status === 'SENT' && accountInfo ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-bold text-sm text-emerald-900">
                    Credentials Verified!
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Here is your active account credential for{' '}
                    <strong className="font-mono text-emerald-950">
                      {accountInfo.email}
                    </strong>
                    :
                  </p>
                </div>
              </div>

              {/* Account details card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 text-xs">
                  <span className="text-slate-500 font-medium">Name</span>
                  <span className="font-bold text-slate-900">{accountInfo.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 text-xs">
                  <span className="text-slate-500 font-medium">Role</span>
                  <span className="font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded text-[11px]">
                    {accountInfo.roleLabel}
                  </span>
                </div>
                {accountInfo.gymName && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 text-xs">
                    <span className="text-slate-500 font-medium">Gym</span>
                    <span className="font-semibold text-slate-800">{accountInfo.gymName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 font-medium flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                    Account Password:
                  </span>
                  <span className="font-mono font-extrabold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-lg text-sm select-all">
                    {accountInfo.password}
                  </span>
                </div>
              </div>

              {/* 1-Click Auto fill and login */}
              {onAutoFillPassword && (
                <button
                  type="button"
                  id="auto-fill-password-btn"
                  onClick={() => {
                    onAutoFillPassword(accountInfo.email, accountInfo.password, accountInfo.role);
                    onClose();
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Auto-Fill Password & Log In Now</span>
                </button>
              )}

              {/* Email Client Links */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Open Email Dispatcher
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={gmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Gmail</span>
                    <ExternalLink className="w-3 h-3 text-white/80" />
                  </a>
                  <a
                    href={mailtoUrl}
                    className="bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Default Mail App</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLookup} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your registered account email address to recover your password.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                id="submit-recover-password-btn"
                disabled={status === 'SENDING'}
                className="w-full bg-[#0f172a] hover:bg-black text-white font-bold text-sm py-3.5 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{status === 'SENDING' ? 'Retrieving...' : 'Retrieve My Password'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Fitora Security Guarantee</span>
          </span>
          <button
            type="button"
            id="forgot-password-modal-footer-close-btn"
            onClick={onClose}
            className="text-xs font-bold text-white bg-slate-900 hover:bg-black px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
