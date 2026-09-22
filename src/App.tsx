/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User } from './types';
import { MockStorage } from './data/mockStorage';
import { CloudStorageService } from './lib/cloudStorage';
import { Login } from './components/Login';
import { AdminPortal } from './components/AdminPortal';
import { GymMaintainerPortal } from './components/GymMaintainerPortal';
import { LogoSplash } from './components/LogoSplash';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeGymId, setActiveGymId] = useState<string | null>(null);
  const [adminViewingGymId, setAdminViewingGymId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Restore active session on mount & sync Firestore cloud database
  useEffect(() => {
    try {
      const session = MockStorage.getActiveSession();
      if (session && session.user) {
        setCurrentUser(session.user);
        setActiveGymId(session.gymId || null);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
    } finally {
      setIsLoading(false);
    }

    // Connect and synchronize Firebase Firestore cloud database in background
    CloudStorageService.initCloudSync().catch((err) => {
      console.warn('Initial cloud sync notice:', err);
    });
  }, []);

  const handleLoginSuccess = (user: User, gymId?: string) => {
    setCurrentUser(user);
    setActiveGymId(gymId || null);
    setAdminViewingGymId(null);
  };

  const handleLogout = () => {
    MockStorage.clearActiveSession();
    setCurrentUser(null);
    setActiveGymId(null);
    setAdminViewingGymId(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Initializing Fitora Engine...
          </p>
        </div>
      );
    }

    // Not logged in -> Show Login view
    if (!currentUser) {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Super Admin view
    if (currentUser.role === 'SUPER_ADMIN') {
      // If admin clicked "Open Portal" for a specific gym
      if (adminViewingGymId) {
        return (
          <div className="min-h-screen flex flex-col">
            {/* Admin Override Banner */}
            <div className="bg-slate-900 text-white px-6 py-2.5 flex items-center justify-between text-xs z-50 border-b border-slate-700 shadow-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200">
                  Super Admin Impersonation Mode:
                </span>
                <span className="text-slate-300">
                  Viewing partition for gym ID{' '}
                  <code className="bg-slate-800 px-1.5 py-0.5 rounded text-lime-400 font-mono">
                    {adminViewingGymId}
                  </code>
                </span>
              </div>

              <button
                type="button"
                id="exit-admin-gym-view-btn"
                onClick={() => setAdminViewingGymId(null)}
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Admin Console</span>
              </button>
            </div>

            <GymMaintainerPortal
              currentGymId={adminViewingGymId}
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          </div>
        );
      }

      return (
        <AdminPortal
          currentAdmin={currentUser}
          onLogout={handleLogout}
          onEnterGymPortal={(gymId) => setAdminViewingGymId(gymId)}
        />
      );
    }

    // Gym Maintainer view
    const targetGymId = activeGymId || currentUser.gymId;
    if (targetGymId) {
      return (
        <GymMaintainerPortal
          currentGymId={targetGymId}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      );
    }

    // Fallback if maintainer has no gym assigned
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900">No Gym Partition Assigned</h2>
          <p className="text-xs text-slate-500">
            Your maintainer account is not linked to an active gym database partition. Please contact the Super Admin to provision your gym.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Logout & Return to Sign In
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {showSplash && (
        <LogoSplash onComplete={() => setShowSplash(false)} minDurationMs={1800} />
      )}
      {renderContent()}
    </>
  );
}
