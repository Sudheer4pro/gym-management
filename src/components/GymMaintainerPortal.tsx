import React, { useState, useEffect } from 'react';
import { User, GymPartition, Member, Payment } from '../types';
import { MockStorage } from '../data/mockStorage';
import { CloudStorageService } from '../lib/cloudStorage';
import { Logo } from './Logo';
import { DashboardView } from './views/DashboardView';
import { MembersView } from './views/MembersView';
import { AddMemberView } from './views/AddMemberView';
import { ExpiredMembersView } from './views/ExpiredMembersView';
import { PaymentsView } from './views/PaymentsView';
import { ReportsView } from './views/ReportsView';
import { PlansView } from './views/PlansView';
import { SettingsView } from './views/SettingsView';
import { MemberDetailModal } from './modals/MemberDetailModal';
import { RenewModal } from './modals/RenewModal';
import { ReceiptModal } from './modals/ReceiptModal';
import { WhatsAppModal } from './modals/WhatsAppModal';
import {
  LayoutGrid,
  Users,
  UserPlus,
  UserX,
  CreditCard,
  ChartNoAxesColumn,
  SlidersVertical,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Calendar,
  Cloud,
} from 'lucide-react';

interface GymMaintainerPortalProps {
  currentGymId: string;
  currentUser: User;
  onLogout: () => void;
}

export const GymMaintainerPortal: React.FC<GymMaintainerPortalProps> = ({
  currentGymId,
  currentUser,
  onLogout,
}) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [partition, setPartition] = useState<GymPartition>(() =>
    MockStorage.getPartition(currentGymId)
  );

  // Modals
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [renewingMember, setRenewingMember] = useState<Member | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);
  const [whatsAppMember, setWhatsAppMember] = useState<Member | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'live'>('live');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    setPartition(MockStorage.getPartition(currentGymId));

    // Subscribe to real-time Firestore synchronization for this partition
    const unsubscribe = CloudStorageService.subscribeToPartition(
      currentGymId,
      (remotePartition) => {
        setPartition(remotePartition);
        setCloudSyncStatus('synced');
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentGymId]);

  const refreshPartition = () => {
    setPartition(MockStorage.getPartition(currentGymId));
  };

  // Handlers
  const handleAddMember = (data: Parameters<typeof MockStorage.addMember>[1]) => {
    const newMem = MockStorage.addMember(currentGymId, data);
    refreshPartition();
    setCurrentView('members');
    showToast(`Member "${newMem.fullName}" successfully registered!`);
    const part = MockStorage.getPartition(currentGymId);
    if (part.payments.length > 0) {
      setViewingReceipt(part.payments[0]);
    }
  };

  const handleUpdateMember = (memberId: string, updates: Partial<Member>) => {
    MockStorage.updateMember(currentGymId, memberId, updates);
    refreshPartition();
    showToast('Member profile updated.');
    if (selectedMember && selectedMember.id === memberId) {
      setSelectedMember({ ...selectedMember, ...updates });
    }
  };

  const handleDeleteMember = (memberId: string) => {
    MockStorage.deleteMember(currentGymId, memberId);
    refreshPartition();
    showToast('Member deleted from records.');
    setSelectedMember(null);
  };

  const handleConfirmRenewal = (
    memberId: string,
    planId: string,
    amount: number,
    paymentMethod: string,
    customStartDate?: string
  ) => {
    const res = MockStorage.renewMember(
      currentGymId,
      memberId,
      planId,
      amount,
      paymentMethod,
      customStartDate
    );
    if (res) {
      refreshPartition();
      showToast(`Membership successfully renewed for ${res.member.fullName}!`);
      setViewingReceipt(res.payment);
    }
  };

  const handleAddPlan = (planData: Parameters<typeof MockStorage.addPlan>[1]) => {
    MockStorage.addPlan(currentGymId, planData);
    refreshPartition();
    showToast(`Plan "${planData.name}" created.`);
  };

  const handleUpdatePlan = (planId: string, updates: Parameters<typeof MockStorage.updatePlan>[2]) => {
    MockStorage.updatePlan(currentGymId, planId, updates);
    refreshPartition();
    showToast('Plan updated.');
  };

  const handleDeletePlan = (planId: string) => {
    MockStorage.deletePlan(currentGymId, planId);
    refreshPartition();
    showToast('Plan removed.');
  };

  const handleUpdateGymInfo = (info: Partial<GymPartition['gym']>) => {
    const current = MockStorage.getGymById(currentGymId);
    if (current) {
      const updated = { ...current, ...info };
      const part = MockStorage.getPartition(currentGymId);
      part.gym = updated;
      MockStorage.savePartition(currentGymId, part);
      refreshPartition();
      showToast('Gym details saved.');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'add-member', label: 'Add Member', icon: UserPlus },
    { id: 'expired', label: 'Expired Members', icon: UserX },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: ChartNoAxesColumn },
    { id: 'plans', label: 'Membership Plans', icon: SlidersVertical },
    { id: 'settings', label: 'Settings & DB', icon: Settings },
  ];

  return (
    <div
      className="min-h-screen bg-[#f3f4f6] flex flex-col md:flex-row text-slate-900 font-sans"
      id="gym-maintainer-portal-root"
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-lime-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-[#0a0d14] text-white px-3.5 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Logo size="sm" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] font-medium text-slate-200 truncate max-w-[130px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="truncate">{partition.gym.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentView !== 'add-member' && (
            <button
              type="button"
              onClick={() => setCurrentView('add-member')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#a3e635] text-black font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg cursor-pointer transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-150"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-[#0a0d14] text-slate-300 flex flex-col justify-between z-50 md:z-30 transition-transform duration-200 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } border-r border-slate-800/80`}
        id="sidebar-container"
      >
        <div className="p-5 space-y-6">
          <div className="flex items-center justify-between pl-1">
            <Logo size="md" />
          </div>

          {/* Active Gym Badge */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
              <span>ACTIVE GYM</span>
              <span className="font-mono text-lime-400">{partition.gym.gymId}</span>
            </div>
            <div className="font-bold text-white text-sm mt-1 truncate">
              {partition.gym.name}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">
              Operator: {currentUser.name}
            </div>
          </div>

          <nav className="space-y-1.5" id="sidebar-navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#a3e635] text-black font-bold shadow-md shadow-lime-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-black stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-[#080b11]">
          <button
            type="button"
            id="maintainer-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-8 py-3.5 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {partition.gym.name}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Maintainer Portal
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Partition: {partition.gym.id}
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200/80"
              title="Persistent cross-device Firebase Firestore database connected"
            >
              <Cloud className="w-3 h-3 text-sky-600" />
              <span>Firebase Cloud DB</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>17 Sep 2026</span>
            </div>

            {currentView !== 'add-member' && (
              <button
                type="button"
                onClick={() => setCurrentView('add-member')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#a3e635] hover:bg-[#92d02a] text-black font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>New Member</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8">
          {currentView === 'dashboard' && (
            <DashboardView
              partition={partition}
              onNavigate={(v) => setCurrentView(v)}
              onSelectMember={(m) => setSelectedMember(m)}
              onRenewMember={(m) => setRenewingMember(m)}
              onWhatsAppReminder={(m) => setWhatsAppMember(m)}
            />
          )}

          {currentView === 'members' && (
            <MembersView
              partition={partition}
              onNavigate={(v) => setCurrentView(v)}
              onSelectMember={(m) => setSelectedMember(m)}
              onRenewMember={(m) => setRenewingMember(m)}
              onDeleteMember={handleDeleteMember}
              onWhatsAppReminder={(m) => setWhatsAppMember(m)}
            />
          )}

          {currentView === 'add-member' && (
            <AddMemberView
              partition={partition}
              onMemberAdded={handleAddMember}
              onCancel={() => setCurrentView('members')}
            />
          )}

          {currentView === 'expired' && (
            <ExpiredMembersView
              partition={partition}
              onSelectMember={(m) => setSelectedMember(m)}
              onRenewMember={(m) => setRenewingMember(m)}
              onWhatsAppReminder={(m) => setWhatsAppMember(m)}
            />
          )}

          {currentView === 'payments' && (
            <PaymentsView
              partition={partition}
              onViewReceipt={(p) => setViewingReceipt(p)}
            />
          )}

          {currentView === 'reports' && <ReportsView partition={partition} />}

          {currentView === 'plans' && (
            <PlansView
              partition={partition}
              onAddPlan={handleAddPlan}
              onUpdatePlan={handleUpdatePlan}
              onDeletePlan={handleDeletePlan}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              partition={partition}
              onUpdateGymInfo={handleUpdateGymInfo}
              onPartitionReloaded={refreshPartition}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0d14]/95 backdrop-blur-md border-t border-slate-800/90 px-3 py-1.5 flex items-center justify-between text-slate-400 shadow-2xl"
          id="mobile-bottom-nav"
        >
          <button
            type="button"
            onClick={() => {
              setCurrentView('dashboard');
              setIsMobileNavOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
              currentView === 'dashboard' ? 'text-[#a3e635] font-bold' : 'hover:text-white'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('members');
              setIsMobileNavOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
              currentView === 'members' ? 'text-[#a3e635] font-bold' : 'hover:text-white'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Members</span>
          </button>

          {/* Center Quick Add Floating Button */}
          <button
            type="button"
            onClick={() => {
              setCurrentView('add-member');
              setIsMobileNavOpen(false);
            }}
            className="flex flex-col items-center justify-center -mt-5 group cursor-pointer"
            title="Register New Member"
          >
            <div className="w-12 h-12 rounded-full bg-[#a3e635] hover:bg-[#92d02a] text-black flex items-center justify-center shadow-lg shadow-lime-500/25 active:scale-95 transition-all">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-slate-300 mt-0.5">Add</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentView('payments');
              setIsMobileNavOpen(false);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
              currentView === 'payments' ? 'text-[#a3e635] font-bold' : 'hover:text-white'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Payments</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors cursor-pointer ${
              isMobileNavOpen ? 'text-[#a3e635] font-bold' : 'hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Menu</span>
          </button>
        </nav>
      </div>

      {/* Modals */}
      {selectedMember && (
        <MemberDetailModal
          member={selectedMember}
          partition={partition}
          onClose={() => setSelectedMember(null)}
          onRenew={(m) => setRenewingMember(m)}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          onWhatsAppReminder={(m) => setWhatsAppMember(m)}
        />
      )}

      {renewingMember && (
        <RenewModal
          member={renewingMember}
          partition={partition}
          onClose={() => setRenewingMember(null)}
          onConfirmRenewal={handleConfirmRenewal}
        />
      )}

      {viewingReceipt && (
        <ReceiptModal
          payment={viewingReceipt}
          gym={partition.gym}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      {whatsAppMember && (
        <WhatsAppModal
          member={whatsAppMember}
          gym={partition.gym}
          onClose={() => setWhatsAppMember(null)}
        />
      )}
    </div>
  );
};
