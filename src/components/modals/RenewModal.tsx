import React, { useState, useEffect } from 'react';
import { Member, GymPartition } from '../../types';
import { addMonthsToDate, CURRENT_SYSTEM_DATE } from '../../data/mockStorage';
import { RefreshCw, Check, X } from 'lucide-react';

interface RenewModalProps {
  member: Member;
  partition: GymPartition;
  onClose: () => void;
  onConfirmRenewal: (
    memberId: string,
    planId: string,
    amount: number,
    paymentMethod: string,
    customStartDate?: string
  ) => void;
}

export const RenewModal: React.FC<RenewModalProps> = ({
  member,
  partition,
  onClose,
  onConfirmRenewal,
}) => {
  const { plans, gym } = partition;
  const currency = gym.currencySymbol || '₹';

  const [selectedPlanId, setSelectedPlanId] = useState(
    member.planId || plans[0]?.id || ''
  );
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const [amount, setAmount] = useState<number>(selectedPlan?.price || 1500);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // If already expired, renewal starts from today (or custom). If active, it stacks onto current expiry.
  const baseStartDate =
    new Date(member.expiryDate) < new Date(CURRENT_SYSTEM_DATE)
      ? CURRENT_SYSTEM_DATE
      : member.expiryDate;

  const calculatedExpiry = selectedPlan
    ? addMonthsToDate(baseStartDate, selectedPlan.durationMonths)
    : addMonthsToDate(baseStartDate, 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePlanChange = (planId: string) => {
    setSelectedPlanId(planId);
    const p = plans.find((pl) => pl.id === planId);
    if (p) {
      setAmount(p.price);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmRenewal(member.id, selectedPlanId, Number(amount), paymentMethod);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative"
        id="renew-modal-content"
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Renew Membership</h2>
              <p className="text-xs text-slate-500">
                {member.fullName} · <span className="font-mono">{member.memberCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-renew-modal-btn"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Close modal (Esc)"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Timeline preview */}
          <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-200/60">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Expiry:</span>
              <span className="font-mono font-bold text-slate-800">
                {new Date(member.expiryDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-emerald-700">
              <span className="font-medium">New Expiry After Renewal:</span>
              <span className="font-mono font-bold text-sm bg-emerald-100/70 px-2 py-0.5 rounded-md text-emerald-800">
                {new Date(calculatedExpiry).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div>
            <label
              className="block text-xs font-semibold text-slate-700 mb-1.5"
              htmlFor="renew-plan-select"
            >
              Select Renewal Plan *
            </label>
            <select
              id="renew-plan-select"
              value={selectedPlanId}
              onChange={(e) => handlePlanChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {currency}{p.price.toLocaleString()} ({p.durationMonths}{' '}
                  {p.durationMonths === 1 ? 'Month' : 'Months'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="renew-amount-input"
              >
                Amount ({currency})
              </label>
              <input
                type="number"
                id="renew-amount-input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold text-slate-700 mb-1.5"
                htmlFor="renew-method-select"
              >
                Payment Method
              </label>
              <select
                id="renew-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-renewal-btn"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Confirm & Record Renewal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
