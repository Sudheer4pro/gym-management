import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Gym, User, GymPartition, AdminCredentials } from '../types';
import { MockStorage, STORAGE_KEYS } from '../data/mockStorage';

const COLLECTIONS = {
  GYMS: 'gyms',
  USERS: 'users',
  PARTITIONS: 'gymPartitions',
  SETTINGS: 'settings',
};

export class CloudStorageService {
  private static isSyncing = false;
  private static listeners: (() => void)[] = [];

  /**
   * Initializes Firebase sync: pulls latest cloud data into local storage cache
   * and sets up real-time listener for multi-device synchronization.
   */
  static async initCloudSync(onSyncStatusChange?: (status: 'synced' | 'syncing' | 'offline') => void): Promise<void> {
    try {
      if (onSyncStatusChange) onSyncStatusChange('syncing');

      // 1. Initial local init
      MockStorage.init();

      // 2. Fetch remote gyms
      const gymsSnap = await getDocs(collection(db, COLLECTIONS.GYMS));
      if (!gymsSnap.empty) {
        const cloudGyms: Gym[] = [];
        gymsSnap.forEach((d) => {
          cloudGyms.push(d.data() as Gym);
        });
        if (cloudGyms.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(cloudGyms));
        }
      } else {
        // Seed remote with existing local gyms
        const localGyms = MockStorage.getAllGyms();
        for (const g of localGyms) {
          await setDoc(doc(db, COLLECTIONS.GYMS, g.id), { ...g, updatedAt: serverTimestamp() }, { merge: true });
        }
      }

      // 3. Fetch remote users
      const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
      if (!usersSnap.empty) {
        const cloudUsers: User[] = [];
        usersSnap.forEach((d) => {
          cloudUsers.push(d.data() as User);
        });
        if (cloudUsers.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MASTER_USERS, JSON.stringify(cloudUsers));
        }
      } else {
        // Seed remote with existing local users
        const localUsers = MockStorage.getAllUsers();
        for (const u of localUsers) {
          await setDoc(doc(db, COLLECTIONS.USERS, u.id), { ...u, updatedAt: serverTimestamp() }, { merge: true });
        }
      }

      // 4. Admin credentials check
      const adminCredDoc = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'adminCredentials'));
      if (adminCredDoc.exists()) {
        const creds = adminCredDoc.data() as AdminCredentials;
        localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(creds));
      } else {
        const localCreds = MockStorage.getAdminCredentials();
        await setDoc(doc(db, COLLECTIONS.SETTINGS, 'adminCredentials'), localCreds, { merge: true });
      }

      // 5. Seed any local partitions to cloud if not present
      const localGyms = MockStorage.getAllGyms();
      for (const gym of localGyms) {
        const partKey = `${STORAGE_KEYS.PARTITION_PREFIX}${gym.id}`;
        const rawLocalPart = localStorage.getItem(partKey);
        
        const partitionRef = doc(db, COLLECTIONS.PARTITIONS, gym.id);
        const partSnap = await getDoc(partitionRef);

        if (partSnap.exists()) {
          const remotePartition = partSnap.data() as GymPartition;
          // Store remote partition locally
          localStorage.setItem(partKey, JSON.stringify(remotePartition));
        } else if (rawLocalPart) {
          try {
            const parsedPart = JSON.parse(rawLocalPart);
            await setDoc(partitionRef, {
              ...parsedPart,
              updatedAt: new Date().toISOString(),
            });
          } catch (e) {
            console.error('Error seeding partition to Firestore:', e);
          }
        }
      }

      if (onSyncStatusChange) onSyncStatusChange('synced');
    } catch (error) {
      console.warn('Firebase sync initialized in offline/fallback mode:', error);
      if (onSyncStatusChange) onSyncStatusChange('offline');
    }
  }

  /**
   * Syncs a gym partition in real-time to Firestore.
   */
  static async syncPartitionToCloud(gymId: string, partition: GymPartition): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.PARTITIONS, gymId);
      await setDoc(
        docRef,
        {
          ...partition,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Could not sync partition to Firebase Firestore:', err);
    }
  }

  /**
   * Subscribes to real-time updates for a specific gym's partition.
   */
  static subscribeToPartition(
    gymId: string,
    onUpdate: (partition: GymPartition) => void
  ): () => void {
    try {
      const docRef = doc(db, COLLECTIONS.PARTITIONS, gymId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const remotePartition = docSnap.data() as GymPartition;
          // Also update local storage
          localStorage.setItem(
            `${STORAGE_KEYS.PARTITION_PREFIX}${gymId}`,
            JSON.stringify(remotePartition)
          );
          onUpdate(remotePartition);
        }
      });
      return unsubscribe;
    } catch (err) {
      console.warn('Could not subscribe to Firestore partition stream:', err);
      return () => {};
    }
  }

  /**
   * Syncs gym creation to Firestore
   */
  static async syncNewGym(gym: Gym, user: User, partition: GymPartition): Promise<void> {
    try {
      await Promise.all([
        setDoc(doc(db, COLLECTIONS.GYMS, gym.id), gym, { merge: true }),
        setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true }),
        setDoc(doc(db, COLLECTIONS.PARTITIONS, gym.id), partition, { merge: true }),
      ]);
    } catch (err) {
      console.warn('Could not write new gym to Firestore:', err);
    }
  }

  /**
   * Syncs gym deletion to Firestore
   */
  static async syncDeleteGym(gymId: string): Promise<void> {
    try {
      await Promise.all([
        deleteDoc(doc(db, COLLECTIONS.GYMS, gymId)),
        deleteDoc(doc(db, COLLECTIONS.PARTITIONS, gymId)),
      ]);
    } catch (err) {
      console.warn('Could not delete gym from Firestore:', err);
    }
  }

  /**
   * Syncs admin credentials change to Firestore
   */
  static async syncAdminCredentials(creds: AdminCredentials): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'adminCredentials'), creds, { merge: true });
    } catch (err) {
      console.warn('Could not update admin credentials in Firestore:', err);
    }
  }
}
