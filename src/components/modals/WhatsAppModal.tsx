import React, { useState, useEffect } from 'react';
import { Member, Gym } from '../../types';
import { MessageSquare, Send, Copy, Check, X } from 'lucide-react';

interface WhatsAppModalProps {
  member: Member;
  gym: Gym;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ member, gym, onClose }) => {
  const [copied, setCopied] = useState(false);
  const formattedExpiry = new Date(member.expiryDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const defaultTemplate =
    member.status === 'Expired'
      ? `Dear ${member.fullName},\n\nYour gym subscription at *${gym.name}* expired on *${formattedExpiry}*. We miss having you on the workout floor! Renew today to continue your fitness progress and lock in existing member pricing.\n\nReply to this message or visit the front desk.\nContact: ${gym.phone}`
      : `Hi ${member.fullName}! 👋\n\nThis is a friendly reminder from *${gym.name}*. Your *${member.planName}* gym membership is scheduled to expire on *${formattedExpiry}*.\n\nPlease renew at the front desk to ensure uninterrupted workout sessions.\n\nThank you!\n${gym.name} Team (Tel: ${gym.phone})`;

  const [message, setMessage] = useState(defaultTemplate);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cleanPhone = member.phone.replace(/[^0-9]/g, '');

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(message);
    const internationalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${internationalPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Renewal Notice Reminder</h2>
              <p className="text-xs text-slate-500">
                To {member.fullName} ({member.phone})
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-whatsapp-modal-btn"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Message Content (Editable)
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Status: <strong className="text-slate-800">{member.status}</strong>
            </span>
            <span>
              Expiry: <strong className="text-slate-800">{formattedExpiry}</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(message);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send on WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
