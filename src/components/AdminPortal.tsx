import React, { useState } from 'react';
import { User, Gym } from '../types';
import { MockStorage } from '../data/mockStorage';
import { AdminLogo } from './Logo';
import { AdminCredentialsModal } from './modals/AdminCredentialsModal';
import { InviteModal } from './modals/InviteModal';
import {
  KeyRound,
  LogOut,
  UserPlus,
  Building,
  Check,
  Search,
  Phone,
  Mail,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface AdminPortalProps {
  currentAdmin: User;
  onLogout: () => void;
  onEnterGymPortal: (gymId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentAdmin,
  onLogout,
  onEnterGymPortal,
}) => {
  const [adminUser, setAdminUser] = useState<User>(currentAdmin);
  const [gyms, setGyms] = useState<Gym[]>(() => MockStorage.getAllGyms());
  const [users, setUsers] = useState<User[]>(() => MockStorage.getAllUsers());

  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [activeInvite, setActiveInvite] = useState<{
    maintainerName: string;
    maintainerEmail: string;
    maintainerPhone?: string;
    gymName: string;
    password?: string;
  } | null>(null);

  // New Maintainer Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGymName, setNewGymName] = useState('');
  const [licenseMonths, setLicenseMonths] = useState<number>(12);

  const [searchQuery, setSearchQuery] = useState('');
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<{ user: User; gym?: Gym } | null>(null);
  const [deletePartitionConfirmed, setDeletePartitionConfirmed] = useState(true);

  const maintainers = users.filter((u) => u.role === 'GYM_MAINTAINER');

  const refreshData = () => {
    setGyms(MockStorage.getAllGyms());
    setUsers(MockStorage.getAllUsers());
  };

  const handleCreateMaintainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) {
      alert('Please fill out Full Name, Email, and Phone.');
      return;
    }

    const gymNameFinal = newGymName.trim() || `${newName.trim()}'s Gym`;
    const { gym, user } = MockStorage.createGymAndMaintainer(
      gymNameFinal,
      newName.trim(),
      newEmail.trim(),
      newPhone.trim(),
      Number(licenseMonths)
    );

    refreshData();
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewGymName('');

    setActiveInvite({
      maintainerName: user.name,
      maintainerEmail: user.email,
      maintainerPhone: user.phone,
      gymName: gym.name,
      password: 'Fitora',
    });
    setIsInviteModalOpen(true);
    setBannerNotice(`Successfully created Maintainer account for "${user.name}"!`);
    setTimeout(() => setBannerNotice(null), 5000);
  };

  const handleRenewLicense = (gym: Gym) => {
    const cur = new Date(gym.licenseExpiryDate);
    cur.setFullYear(cur.getFullYear() + 1);
    const newExp = cur.toISOString().split('T')[0];
    MockStorage.updateGymLicense(gym.id, 'Active', newExp);
    refreshData();
    setBannerNotice(`License extended for ${gym.name} until ${newExp}!`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  const handleExecuteDelete = () => {
    if (!deletingTarget) return;
    const { user, gym } = deletingTarget;
    MockStorage.deleteMaintainerAccount(user.id, deletePartitionConfirmed);
    refreshData();
    setBannerNotice(
      `Maintainer account for "${user.name}" (${user.email}) ${
        deletePartitionConfirmed && gym ? `and gym partition "${gym.name}" were` : 'was'
      } permanently deleted.`
    );
    setDeletingTarget(null);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col" id="admin-portal-root">
      {/* Top Header */}
      <header className="bg-[#0b0f19] text-white border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <AdminLogo />
          <span className="hidden md:inline-block text-xs text-slate-500 font-mono pl-3 border-l border-slate-800">
            Multi-Tenant Partition Engine
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin: {adminUser.email}</span>
          </div>

          <button
            type="button"
            id="admin-change-credentials-btn"
            onClick={() => setIsCredsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Change Super Admin login email and password"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Change Credential</span>
          </button>

          <button
            type="button"
            id="admin-logout-btn"
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-3.5 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Title & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" id="maintainers-page-title">
              Gym Maintainers
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Provision operator profiles and commercial licenses. Each gym maintainer receives a completely isolated database partition with zero cross-tenant visibility.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-2xs text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Total Gyms</span>
              <span className="text-lg font-bold text-slate-900 font-mono">{gyms.length}</span>
            </div>
            <div className="bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-2xs text-center">
              <span className="block text-[10px] uppercase font-bold text-slate-400">Maintainers</span>
              <span className="text-lg font-bold text-emerald-600 font-mono">{maintainers.length}</span>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        {bannerNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{bannerNotice}</span>
          </div>
        )}

        {/* Add Maintainer Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8" id="card-add-maintainer">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <UserPlus className="w-5 h-5 text-slate-700" />
            <h2 className="text-base font-bold">Add Maintainer</h2>
          </div>

          <form onSubmit={handleCreateMaintainer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="maintainer-name-input">
                  Full name *
                </label>
                <input
                  type="text"
                  id="maintainer-name-input"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Maintainer name"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="maintainer-email-input">
                  Email *
                </label>
                <input
                  type="email"
                  id="maintainer-email-input"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="maintainer@email.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="maintainer-phone-input">
                  Phone *
                </label>
                <input
                  type="tel"
                  id="maintainer-phone-input"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="maintainer-gym-name">
                  Gym / Branch Name (Optional)
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    id="maintainer-gym-name"
                    value={newGymName}
                    onChange={(e) => setNewGymName(e.target.value)}
                    placeholder="e.g. Iron Core Fitness, Apex Arena"
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5" htmlFor="maintainer-license">
                  Commercial License Term
                </label>
                <select
                  id="maintainer-license"
                  value={licenseMonths}
                  onChange={(e) => setLicenseMonths(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium cursor-pointer"
                >
                  <option value={1}>1 Month Trial</option>
                  <option value={3}>3 Months Commercial</option>
                  <option value={6}>6 Months License</option>
                  <option value={12}>12 Months Annual Pass</option>
                  <option value={36}>36 Months Multi-Year</option>
                  <option value={120}>Lifetime Vendor Access</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                id="btn-promote-maintainer"
                className="inline-flex items-center justify-center gap-2 bg-[#090e18] hover:bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Promote to Maintainer</span>
              </button>
            </div>
          </form>
        </div>

        {/* Maintainers List Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8 space-y-6" id="card-current-maintainers">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Current Maintainers</h2>
              <p className="text-xs text-slate-500">
                {maintainers.length} active gym operator profile{maintainers.length === 1 ? '' : 's'} provisioned.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search maintainers..."
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {maintainers.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No maintainers registered yet. Use the form above to provision a gym.
              </p>
            ) : (
              maintainers
                .filter(
                  (m) =>
                    !searchQuery ||
                    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.phone.includes(searchQuery)
                )
                .map((m) => {
                  const gym = gyms.find((g) => g.id === m.gymId);
                  const renewalDateText = gym
                    ? `Renews ${new Date(gym.licenseExpiryDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}`
                    : 'Renews soon';
                  const partitionKey = `fitora_partition_${m.gymId}`;

                  return (
                    <div
                      key={m.id}
                      className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-[#0d1322] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0 uppercase">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900">{m.name}</h3>
                            <span className="text-xs text-slate-500 font-medium">
                              ({gym?.name || 'Assigned Gym'})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{m.email}</p>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Partition: {partitionKey} · Code: {gym?.gymId}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
                        <div className="flex items-center gap-1 text-xs text-slate-600 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{m.phone}</span>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            gym?.licenseStatus === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {gym?.licenseStatus || 'Active'}
                        </span>

                        <span className="text-xs text-slate-500 font-medium font-sans">
                          {renewalDateText}
                        </span>

                        {/* Invite button */}
                        <button
                          type="button"
                          id={`send-invite-${m.id}-btn`}
                          onClick={() => {
                            setActiveInvite({
                              maintainerName: m.name,
                              maintainerEmail: m.email,
                              maintainerPhone: m.phone,
                              gymName: gym?.name || `${m.name}'s Gym`,
                              password: m.password || 'Fitora',
                            });
                            setIsInviteModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-colors shadow-2xs cursor-pointer"
                          title="Send or resend invite email and credentials"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Invite</span>
                        </button>

                        {/* Renew button */}
                        {gym && (
                          <button
                            type="button"
                            onClick={() => handleRenewLicense(gym)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                            <span>Renew</span>
                          </button>
                        )}

                        {/* Open Portal button */}
                        {m.gymId && (
                          <button
                            type="button"
                            onClick={() => onEnterGymPortal(m.gymId as string)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0f172a] hover:bg-black rounded-xl shadow-xs transition-colors cursor-pointer"
                            title="Open this maintainer's isolated portal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open Portal</span>
                          </button>
                        )}

                        {/* Delete button */}
                        <button
                          type="button"
                          id={`delete-maintainer-${m.id}-btn`}
                          onClick={() => {
                            setDeletePartitionConfirmed(true);
                            setDeletingTarget({ user: m, gym });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors shadow-2xs cursor-pointer"
                          title="Delete Maintainer Account & Gym"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletingTarget && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          id="delete-maintainer-modal"
          onClick={(e) => e.target === e.currentTarget && setDeletingTarget(null)}
        >
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            <button
              type="button"
              id="close-delete-maintainer-modal-btn"
              onClick={() => setDeletingTarget(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900" id="delete-modal-title">
                  Delete Maintainer Account?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone. Please confirm you want to remove this account.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Maintainer:</span>
                <span className="font-bold text-slate-900">{deletingTarget.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-mono text-slate-800">{deletingTarget.user.email}</span>
              </div>
              {deletingTarget.gym && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Gym Branch:</span>
                  <span className="font-semibold text-slate-900">{deletingTarget.gym.name}</span>
                </div>
              )}
            </div>

            {deletingTarget.gym && (
              <label className="flex items-start gap-2.5 text-xs text-slate-700 select-none cursor-pointer bg-amber-50/70 border border-amber-200/70 p-3 rounded-xl">
                <input
                  type="checkbox"
                  id="delete-partition-checkbox"
                  checked={deletePartitionConfirmed}
                  onChange={(e) => setDeletePartitionConfirmed(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
                />
                <span className="leading-snug">
                  Also permanently delete gym database partition for{' '}
                  <strong>{deletingTarget.gym.name}</strong> (members, plans, payments & receipts).
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="cancel-delete-maintainer-btn"
                onClick={() => setDeletingTarget(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-maintainer-btn"
                onClick={handleExecuteDelete}
                className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Credentials Modal */}
      {isCredsModalOpen && (
        <AdminCredentialsModal
          adminUser={adminUser}
          onClose={() => setIsCredsModalOpen(false)}
          onUpdated={(updated) => {
            setAdminUser(updated);
            refreshData();
            setBannerNotice(`Admin credentials updated successfully for ${updated.email}!`);
            setTimeout(() => setBannerNotice(null), 4000);
          }}
        />
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        invite={activeInvite}
      />
    </div>
  );
};
