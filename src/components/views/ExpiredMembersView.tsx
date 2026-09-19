import React, { useState } from 'react';
import { GymPartition, Member } from '../../types';
import { Search, UserX, MessageSquare, RefreshCw } from 'lucide-react';

interface ExpiredMembersViewProps {
  partition: GymPartition;
  onRenewMember: (member: Member) => void;
  onSelectMember: (member: Member) => void;
  onWhatsAppReminder: (member: Member) => void;
}

export const ExpiredMembersView: React.FC<ExpiredMembersViewProps> = ({
  partition,
  onRenewMember,
  onSelectMember,
  onWhatsAppReminder,
}) => {
  const [search, setSearch] = useState('');
  const { members } = partition;

  const expiredMembers = members.filter((m) => m.status === 'Expired');
  const filtered = expiredMembers.filter(
    (m) =>
      !search ||
      m.fullName.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6" id="expired-members-view">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Expired Members
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Members whose subscriptions have ended without renewal. Reactivate them anytime.
        </p>
      </div>

      <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-rose-900">
              {expiredMembers.length} Expired Member{expiredMembers.length === 1 ? '' : 's'}
            </p>
            <p className="text-xs text-rose-700">
              Expired records are permanently preserved and searchable. Click &quot;Renew&quot; to reactivate.
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expired members by name, phone or ID"
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
            {search
              ? 'No expired members match your search.'
              : 'No expired members currently. Great retention!'}
          </div>
        ) : (
          filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => onSelectMember(m)}
              >
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm border border-rose-100">
                  {m.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 hover:text-emerald-600">
                    {m.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono">{m.phone}</span>
                    <span>·</span>
                    <span>Previous: {m.planName}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-400">{m.memberCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="block text-[11px] uppercase tracking-wider text-rose-500 font-medium">
                    Expired On
                  </span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {new Date(m.expiryDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onWhatsAppReminder(m)}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1 border border-emerald-200 cursor-pointer"
                    title="Send reactivation offer via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Offer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRenewMember(m)}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renew & Reactivate</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
