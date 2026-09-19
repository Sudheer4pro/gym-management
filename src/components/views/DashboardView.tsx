import React from 'react';
import { GymPartition, Member } from '../../types';
import {
  Users,
  Clock,
  TriangleAlert,
  TrendingUp,
  UserPlus,
  RefreshCw,
  IndianRupee,
  DollarSign,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';

interface DashboardViewProps {
  partition: GymPartition;
  onNavigate: (view: string) => void;
  onSelectMember: (member: Member) => void;
  onRenewMember: (member: Member) => void;
  onWhatsAppReminder: (member: Member) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  partition,
  onNavigate,
  onSelectMember,
  onRenewMember,
  onWhatsAppReminder,
}) => {
  const { members, payments, renewals, gym } = partition;

  const activeMembers = members.filter((m) => m.status === 'Active');
  const expiringSoon = members.filter((m) => m.status === 'Expiring Soon');
  const expiresToday = members.filter((m) => m.status === 'Expires Today');
  const expired = members.filter((m) => m.status === 'Expired');
  const renewalDue = members.filter(
    (m) => m.status === 'Expiring Soon' || m.status === 'Expires Today'
  );

  const currentMonthPrefix = '2026-09';
  const newThisMonth = members.filter(
    (m) => m.createdAt && m.createdAt.startsWith(currentMonthPrefix)
  );
  const renewalsThisMonth = renewals.filter(
    (r) => r.renewalDate && r.renewalDate.startsWith(currentMonthPrefix)
  );
  const revenueThisMonth = payments
    .filter((p) => p.date && p.date.startsWith(currentMonthPrefix))
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const currency = gym.currencySymbol || '₹';

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="dashboard-title">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Overview of your gym&apos;s memberships, cash flow, and daily alerts.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metric-cards-grid">
        {/* Active Members */}
        <div
          id="card-active-members"
          onClick={() => onNavigate('members')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300/80 hover:shadow-md transition-all duration-150 cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              ACTIVE MEMBERS
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-100">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl lg:text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">
              {activeMembers.length}
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          id="card-expiring-soon"
          onClick={() => onNavigate('members')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-300/80 hover:shadow-md transition-all duration-150 cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              EXPIRING SOON
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-colors group-hover:bg-amber-100">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl lg:text-4xl font-extrabold text-amber-500 font-mono tracking-tight">
              {expiringSoon.length}
            </span>
          </div>
        </div>

        {/* Expires Today */}
        <div
          id="card-expires-today"
          onClick={() => onNavigate('members')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-orange-300/80 hover:shadow-md transition-all duration-150 cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              EXPIRES TODAY
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center transition-colors group-hover:bg-orange-100">
              <TriangleAlert className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl lg:text-4xl font-extrabold text-orange-500 font-mono tracking-tight">
              {expiresToday.length}
            </span>
          </div>
        </div>

        {/* Expired */}
        <div
          id="card-expired-members"
          onClick={() => onNavigate('expired')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-rose-300/80 hover:shadow-md transition-all duration-150 cursor-pointer relative group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              EXPIRED
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center transition-colors group-hover:bg-rose-100">
              <TrendingUp className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl lg:text-4xl font-extrabold text-rose-600 font-mono tracking-tight">
              {expired.length}
            </span>
          </div>
        </div>

        {/* New This Month */}
        <div id="card-new-this-month" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              NEW THIS MONTH
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <UserPlus className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {newThisMonth.length}
            </span>
          </div>
        </div>

        {/* Renewals This Month */}
        <div id="card-renewals-this-month" className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              RENEWALS THIS MONTH
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {renewalsThisMonth.length}
            </span>
          </div>
        </div>

        {/* Revenue This Month */}
        <div
          id="card-revenue-this-month"
          onClick={() => onNavigate('payments')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-150 cursor-pointer lg:col-span-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
              REVENUE THIS MONTH
            </span>
            <div className="w-8 h-8 rounded-xl bg-lime-50 text-lime-700 font-bold flex items-center justify-center text-sm">
              {currency === '₹' ? <IndianRupee className="w-4 h-4 inline" /> : <DollarSign className="w-4 h-4 inline" />}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2.5">
            <span className="text-3xl lg:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
              {currency}{revenueThisMonth.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({payments.length} transactions)
            </span>
          </div>
        </div>
      </div>

      {/* Renewal Due Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6" id="renewal-due-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Renewal Due</h2>
            <p className="text-xs text-slate-500">Members expiring within 7 days</p>
          </div>
          {renewalDue.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {renewalDue.length} Action{renewalDue.length > 1 ? 's' : ''} Needed
            </span>
          )}
        </div>

        {renewalDue.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm" id="empty-renewal-due">
            No memberships due for renewal right now.
          </div>
        ) : (
          <div className="overflow-x-auto" id="renewal-due-table">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-1">Member</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Current Plan</th>
                  <th className="pb-3">Expiry Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-1">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {renewalDue.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs uppercase">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <p
                            className="font-medium text-slate-900 hover:text-emerald-600 cursor-pointer"
                            onClick={() => onSelectMember(m)}
                          >
                            {m.fullName}
                          </p>
                          <span className="text-xs text-slate-400">{m.memberCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{m.phone}</td>
                    <td className="py-3 text-slate-700">{m.planName}</td>
                    <td className="py-3 text-slate-700 font-mono text-xs">
                      {new Date(m.expiryDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          m.status === 'Expires Today'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-1">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          id={`whatsapp-btn-${m.id}`}
                          onClick={() => onWhatsAppReminder(m)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          title="Send renewal notice via WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Remind</span>
                        </button>
                        <button
                          type="button"
                          id={`renew-btn-${m.id}`}
                          onClick={() => onRenewMember(m)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renew</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Access Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dashboard-quick-actions">
        <div
          onClick={() => onNavigate('add-member')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Register New Member
              </p>
              <p className="text-xs text-slate-400">Fast entry in under 1 minute</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('members')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                Search & Filter Members
              </p>
              <p className="text-xs text-slate-400">{members.length} members stored</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>

        <div
          onClick={() => onNavigate('plans')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                Membership Plans
              </p>
              <p className="text-xs text-slate-400">{partition.plans.length} active packages</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};
