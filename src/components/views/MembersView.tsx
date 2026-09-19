import React, { useState, useMemo } from 'react';
import { GymPartition, Member, MemberStatus } from '../../types';
import {
  UserPlus,
  Bell,
  Search,
  User,
  MessageSquare,
  RefreshCw,
  MoreVertical,
  Trash2,
} from 'lucide-react';

interface MembersViewProps {
  partition: GymPartition;
  onNavigate: (view: string) => void;
  onSelectMember: (member: Member) => void;
  onRenewMember: (member: Member) => void;
  onDeleteMember: (memberId: string) => void;
  onWhatsAppReminder: (member: Member) => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  partition,
  onNavigate,
  onSelectMember,
  onRenewMember,
  onDeleteMember,
  onWhatsAppReminder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | MemberStatus>('All');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const { members } = partition;

  const expiringCount = members.filter(
    (m) => m.status === 'Expiring Soon' || m.status === 'Expires Today'
  ).length;

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        (m.email && m.email.toLowerCase().includes(q));

      const matchesStatus = selectedFilter === 'All' || m.status === selectedFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, selectedFilter]);

  const renderStatusBadge = (status: MemberStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Expiring Soon':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Expiring Soon
          </span>
        );
      case 'Expires Today':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Expires Today
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Expired
          </span>
        );
    }
  };

  return (
    <div className="space-y-6" id="members-view-container">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="members-page-title">
            Members
          </h1>
          <p className="text-sm text-slate-500 mt-0.5" id="members-count-subtitle">
            {members.length} total member{members.length === 1 ? '' : 's'} registered in this partition
          </p>
        </div>
        <button
          type="button"
          id="btn-add-member-top"
          onClick={() => onNavigate('add-member')}
          className="inline-flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-black text-white font-medium text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Expiry Banner */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Expiring Members Alert
        </div>
        {expiringCount > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {expiringCount} member{expiringCount > 1 ? 's' : ''} expiring soon
                </p>
                <p className="text-xs text-slate-600">
                  Send payment reminders to ensure continuous gym access.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedFilter('Expiring Soon')}
              className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Show Expiring Members</span>
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-slate-400 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All members have valid memberships. No urgent expirations.</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          id="member-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone or member code (e.g. MEM-1001)..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2" id="member-filter-tabs">
        {(['All', 'Active', 'Expiring Soon', 'Expires Today', 'Expired'] as const).map((tab) => {
          const isSelected = selectedFilter === tab;
          const count = tab === 'All' ? members.length : members.filter((m) => m.status === tab).length;

          return (
            <button
              key={tab}
              type="button"
              id={`filter-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab}
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Member Cards List */}
      <div className="space-y-3" id="members-list-cards">
        {filteredMembers.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-medium text-slate-900">No members found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No members matching "${searchQuery}". Try clearing search.`
                : 'No members in this category yet. Click "Add Member" to register your first client.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredMembers.map((m) => (
            <div
              key={m.id}
              id={`member-row-${m.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative group"
            >
              <div
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => onSelectMember(m)}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm flex-shrink-0 border border-slate-200 overflow-hidden">
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={m.fullName}
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {m.fullName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono">{m.phone}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-700">{m.planName}</span>
                    <span>·</span>
                    <span className="text-slate-400 font-mono">{m.memberCode}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                    Expires
                  </span>
                  <span className="text-sm font-semibold text-slate-800 font-mono">
                    {new Date(m.expiryDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>{renderStatusBadge(m.status)}</div>

                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWhatsAppReminder(m);
                    }}
                    title="Send WhatsApp Reminder"
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenewMember(m);
                    }}
                    title="Renew Membership"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-black rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Renew</span>
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === m.id ? null : m.id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === m.id && (
                      <div
                        className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onSelectMember(m);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>View Full Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onRenewMember(m);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                          <span>Renew Subscription</span>
                        </button>
                        <div className="border-t border-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            if (window.confirm(`Delete member ${m.fullName}?`)) {
                              onDeleteMember(m.id);
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Member</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
