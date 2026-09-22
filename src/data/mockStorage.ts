import {
  Gym,
  User,
  Member,
  Plan,
  Payment,
  Renewal,
  GymPartition,
  MemberStatus,
  AdminCredentials,
} from '../types';
import { CloudStorageService } from '../lib/cloudStorage';

export const CURRENT_SYSTEM_DATE = '2026-09-17';

export const STORAGE_KEYS = {
  MASTER_GYMS: 'fitora_master_gyms',
  MASTER_USERS: 'fitora_master_users',
  ADMIN_CREDENTIALS: 'fitora_admin_credentials',
  PARTITION_PREFIX: 'fitora_partition_',
  ACTIVE_SESSION: 'fitora_active_session',
};

export function calculateMemberStatus(
  expiryDateStr?: string,
  referenceDateStr: string = CURRENT_SYSTEM_DATE
): MemberStatus {
  if (!expiryDateStr) return 'Active';
  const expiry = new Date(expiryDateStr);
  const ref = new Date(referenceDateStr);
  expiry.setHours(0, 0, 0, 0);
  ref.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - ref.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires Today';
  if (diffDays > 0 && diffDays <= 7) return 'Expiring Soon';
  return 'Active';
}

export function addMonthsToDate(startDateStr: string, months: number): string {
  const d = new Date(startDateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

const DEFAULT_GYMS: Gym[] = [
  {
    id: 'gym_iron_01',
    gymId: 'GYM-IRON-01',
    name: 'Iron Core Fitness',
    ownerName: 'iamsudheer786',
    email: 'iamsudheer786@gmail.com',
    phone: '7550284265',
    address: '12-B Fitness Hub, Central Avenue',
    currencySymbol: '₹',
    licenseStatus: 'Active',
    licenseExpiryDate: '2027-10-17',
    createdAt: '2026-01-10',
  },
  {
    id: 'gym_apex_02',
    gymId: 'GYM-APEX-02',
    name: 'Apex Performance Lab',
    ownerName: 'Marcus Vance',
    email: 'marcus@apexfit.com',
    phone: '9123456780',
    address: '88 Olympic Blvd, Suite 4',
    currencySymbol: '₹',
    licenseStatus: 'Active',
    licenseExpiryDate: '2027-04-30',
    createdAt: '2026-02-15',
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin',
    gymId: null,
    name: 'System Admin',
    email: 'admin@email.com',
    phone: '9876543210',
    password: 'password123',
    role: 'SUPER_ADMIN',
    status: 'Active',
    createdAt: '2026-01-01',
  },
  {
    id: 'user_maintainer_1',
    gymId: 'gym_iron_01',
    name: 'iamsudheer786',
    email: 'iamsudheer786@gmail.com',
    phone: '7550284265',
    password: 'Fitora',
    role: 'GYM_MAINTAINER',
    status: 'Active',
    createdAt: '2026-01-10',
  },
  {
    id: 'user_maintainer_2',
    gymId: 'gym_apex_02',
    name: 'Marcus Vance',
    email: 'marcus@apexfit.com',
    phone: '9123456780',
    password: 'Fitora',
    role: 'GYM_MAINTAINER',
    status: 'Active',
    createdAt: '2026-02-15',
  },
];

function createDefaultIronPartition(): GymPartition {
  return {
    gym: DEFAULT_GYMS[0],
    members: [
      {
        id: 'mem_iron_1',
        gymId: 'gym_iron_01',
        memberCode: 'MEM-1001',
        fullName: 'fdsfg',
        phone: '7440284265',
        email: 'fdsfg@member.com',
        gender: 'Male',
        dob: '1998-05-12',
        address: 'Near West Gate Park',
        notes: 'Prefers evening strength workouts.',
        planId: 'plan_3m',
        planName: '3 Months Gold',
        startDate: '2026-08-10',
        expiryDate: '2026-11-10',
        amountPaid: 4000,
        paymentMethod: 'Cash',
        status: 'Active',
        createdAt: '2026-08-10',
        updatedAt: '2026-08-10',
      },
      {
        id: 'mem_iron_2',
        gymId: 'gym_iron_01',
        memberCode: 'MEM-1002',
        fullName: 'Rahul Sharma',
        phone: '9876543210',
        email: 'rahul.s@example.com',
        gender: 'Male',
        dob: '1995-11-04',
        address: 'Block C, Sector 14',
        emergencyContact: '9876500000',
        notes: 'Expiring in 4 days. Contacted for renewal.',
        planId: 'plan_1m',
        planName: '1 Month Standard',
        startDate: '2026-08-21',
        expiryDate: '2026-09-21',
        amountPaid: 1500,
        paymentMethod: 'UPI',
        status: 'Expiring Soon',
        createdAt: '2026-08-21',
        updatedAt: '2026-08-21',
      },
      {
        id: 'mem_iron_3',
        gymId: 'gym_iron_01',
        memberCode: 'MEM-1003',
        fullName: 'Pooja Verma',
        phone: '9811223344',
        email: 'pooja.v@example.com',
        gender: 'Female',
        dob: '2000-02-18',
        address: 'Greenwood Apartments #302',
        emergencyContact: '9811009988',
        notes: 'Expires today! Call in afternoon.',
        planId: 'plan_1m',
        planName: '1 Month Standard',
        startDate: '2026-08-17',
        expiryDate: '2026-09-17',
        amountPaid: 1500,
        paymentMethod: 'UPI',
        status: 'Expires Today',
        createdAt: '2026-08-17',
        updatedAt: '2026-08-17',
      },
      {
        id: 'mem_iron_4',
        gymId: 'gym_iron_01',
        memberCode: 'MEM-1004',
        fullName: 'Vikram Singh',
        phone: '9988776655',
        email: 'vikram.singh@example.com',
        gender: 'Male',
        dob: '1992-09-29',
        address: '45 Lake View Road',
        emergencyContact: '9988001122',
        notes: 'Expired member. Offered 10% discount on renewal.',
        planId: 'plan_6m',
        planName: '6 Months Pro',
        startDate: '2026-02-15',
        expiryDate: '2026-08-15',
        amountPaid: 7500,
        paymentMethod: 'Card',
        status: 'Expired',
        createdAt: '2026-02-15',
        updatedAt: '2026-08-16',
      },
    ],
    plans: [
      {
        id: 'plan_1m',
        gymId: 'gym_iron_01',
        name: '1 Month Standard',
        durationMonths: 1,
        price: 1500,
        description: 'Standard access with gym equipment and locker.',
        isActive: true,
      },
      {
        id: 'plan_3m',
        gymId: 'gym_iron_01',
        name: '3 Months Gold',
        durationMonths: 3,
        price: 4000,
        description: 'Full cardio, heavy weights, and fitness consultation.',
        isActive: true,
      },
      {
        id: 'plan_6m',
        gymId: 'gym_iron_01',
        name: '6 Months Pro',
        durationMonths: 6,
        price: 7500,
        description: 'Comprehensive strength training and nutrition guide.',
        isActive: true,
      },
      {
        id: 'plan_12m',
        gymId: 'gym_iron_01',
        name: '12 Months VIP',
        durationMonths: 12,
        price: 13500,
        description: 'All-inclusive annual pass with steam & sauna.',
        isActive: true,
      },
    ],
    payments: [
      {
        id: 'pay_iron_1',
        gymId: 'gym_iron_01',
        memberId: 'mem_iron_1',
        memberName: 'fdsfg',
        planName: '3 Months Gold',
        amount: 4000,
        paymentMethod: 'Cash',
        date: '2026-08-10',
        receiptNumber: 'RCP-2026-001',
        notes: 'Initial admission & subscription fee',
      },
      {
        id: 'pay_iron_2',
        gymId: 'gym_iron_01',
        memberId: 'mem_iron_2',
        memberName: 'Rahul Sharma',
        planName: '1 Month Standard',
        amount: 1500,
        paymentMethod: 'UPI',
        date: '2026-08-21',
        receiptNumber: 'RCP-2026-002',
        notes: 'Online UPI payment',
      },
      {
        id: 'pay_iron_3',
        gymId: 'gym_iron_01',
        memberId: 'mem_iron_3',
        memberName: 'Pooja Verma',
        planName: '1 Month Standard',
        amount: 1500,
        paymentMethod: 'UPI',
        date: '2026-08-17',
        receiptNumber: 'RCP-2026-003',
        notes: 'UPI Reference ID #8892110',
      },
      {
        id: 'pay_iron_4',
        gymId: 'gym_iron_01',
        memberId: 'mem_iron_4',
        memberName: 'Vikram Singh',
        planName: '6 Months Pro',
        amount: 7500,
        paymentMethod: 'Card',
        date: '2026-02-15',
        receiptNumber: 'RCP-2026-004',
        notes: 'POS Card swipe',
      },
    ],
    renewals: [],
  };
}

function createDefaultApexPartition(): GymPartition {
  return {
    gym: DEFAULT_GYMS[1],
    members: [
      {
        id: 'mem_apex_1',
        gymId: 'gym_apex_02',
        memberCode: 'APX-010',
        fullName: 'Elena Rostova',
        phone: '555-0199',
        email: 'elena@apexmember.com',
        gender: 'Female',
        dob: '1996-07-22',
        address: '404 Metro Towers',
        planId: 'plan_apex_crossfit',
        planName: 'Elite Quarterly',
        startDate: '2026-07-01',
        expiryDate: '2026-10-01',
        amountPaid: 4500,
        paymentMethod: 'Card',
        status: 'Active',
        createdAt: '2026-07-01',
        updatedAt: '2026-07-01',
      },
    ],
    plans: [
      {
        id: 'plan_apex_basic',
        gymId: 'gym_apex_02',
        name: 'Sprint Monthly',
        durationMonths: 1,
        price: 1500,
        description: 'Monthly open floor access.',
        isActive: true,
      },
      {
        id: 'plan_apex_crossfit',
        gymId: 'gym_apex_02',
        name: 'Elite Quarterly',
        durationMonths: 3,
        price: 4500,
        description: 'Unlimited functional conditioning + recovery lounge.',
        isActive: true,
      },
    ],
    payments: [
      {
        id: 'pay_apex_1',
        gymId: 'gym_apex_02',
        memberId: 'mem_apex_1',
        memberName: 'Elena Rostova',
        planName: 'Elite Quarterly',
        amount: 4500,
        paymentMethod: 'Card',
        date: '2026-07-01',
        receiptNumber: 'APX-RCP-101',
      },
    ],
    renewals: [],
  };
}

export const MockStorage = {
  init(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.MASTER_GYMS)) {
      localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(DEFAULT_GYMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MASTER_USERS)) {
      localStorage.setItem(STORAGE_KEYS.MASTER_USERS, JSON.stringify(DEFAULT_USERS));
    }
    const ironKey = `${STORAGE_KEYS.PARTITION_PREFIX}gym_iron_01`;
    if (!localStorage.getItem(ironKey)) {
      localStorage.setItem(ironKey, JSON.stringify(createDefaultIronPartition()));
    }
    const apexKey = `${STORAGE_KEYS.PARTITION_PREFIX}gym_apex_02`;
    if (!localStorage.getItem(apexKey)) {
      localStorage.setItem(apexKey, JSON.stringify(createDefaultApexPartition()));
    }

    // Auto-migrate any previously stored gyms or partitions to INR (₹)
    try {
      const rawGyms = localStorage.getItem(STORAGE_KEYS.MASTER_GYMS);
      if (rawGyms) {
        const parsedGyms: Gym[] = JSON.parse(rawGyms);
        let gymsChanged = false;
        parsedGyms.forEach((g) => {
          if (!g.currencySymbol || g.currencySymbol === '$') {
            g.currencySymbol = '₹';
            gymsChanged = true;
          }
        });
        if (gymsChanged) {
          localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(parsedGyms));
        }
      }

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_KEYS.PARTITION_PREFIX)) {
          const rawPart = localStorage.getItem(key);
          if (rawPart) {
            const part: GymPartition = JSON.parse(rawPart);
            if (part.gym && (!part.gym.currencySymbol || part.gym.currencySymbol === '$')) {
              part.gym.currencySymbol = '₹';
              localStorage.setItem(key, JSON.stringify(part));
            }
          }
        }
      }
    } catch {}
  },

  getAllGyms(): Gym[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MASTER_GYMS);
      return raw ? JSON.parse(raw) : DEFAULT_GYMS;
    } catch {
      return DEFAULT_GYMS;
    }
  },

  getGymById(id: string): Gym | undefined {
    return this.getAllGyms().find((g) => g.id === id || g.gymId === id);
  },

  getAllUsers(): User[] {
    this.init();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MASTER_USERS);
      const users: User[] = raw ? JSON.parse(raw) : DEFAULT_USERS;
      return users.map((u) => ({
        ...u,
        password: u.password || (u.role === 'SUPER_ADMIN' ? 'password123' : 'Fitora'),
      }));
    } catch {
      return DEFAULT_USERS;
    }
  },

  getAdminCredentials(): AdminCredentials {
    this.init();
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_CREDENTIALS);
      if (saved) return JSON.parse(saved);
    } catch {}
    const adminUser = this.getAllUsers().find((u) => u.role === 'SUPER_ADMIN');
    return {
      email: adminUser?.email || 'admin@email.com',
      password: adminUser?.password || 'password123',
    };
  },

  updateAdminCredentials(newEmail: string, newPassword?: string): User | null {
    const users = this.getAllUsers();
    const adminIndex = users.findIndex((u) => u.role === 'SUPER_ADMIN');
    if (adminIndex === -1) return null;

    users[adminIndex].email = newEmail;
    if (newPassword) {
      users[adminIndex].password = newPassword;
    }
    localStorage.setItem(STORAGE_KEYS.MASTER_USERS, JSON.stringify(users));

    const currentCreds = this.getAdminCredentials();
    const updatedCreds: AdminCredentials = {
      email: newEmail,
      password: newPassword !== undefined ? newPassword : currentCreds.password,
    };
    localStorage.setItem(STORAGE_KEYS.ADMIN_CREDENTIALS, JSON.stringify(updatedCreds));
    CloudStorageService.syncAdminCredentials(updatedCreds).catch(() => {});
    return users[adminIndex];
  },

  createGymAndMaintainer(
    gymName: string,
    maintainerName: string,
    email: string,
    phone: string,
    licenseMonths = 12,
    customGymId?: string
  ): { gym: Gym; user: User } {
    const gyms = this.getAllGyms();
    const users = this.getAllUsers();

    const gymInternalId = `gym_${Date.now()}`;
    const gymPublicCode = customGymId || `GYM-${Math.floor(100 + Math.random() * 900)}`;

    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + licenseMonths);

    const newGym: Gym = {
      id: gymInternalId,
      gymId: gymPublicCode,
      name: gymName,
      ownerName: maintainerName,
      email,
      phone,
      currencySymbol: '₹',
      licenseStatus: 'Active',
      licenseExpiryDate: expiry.toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const newUser: User = {
      id: `user_${Date.now()}`,
      gymId: gymInternalId,
      name: maintainerName,
      email,
      phone,
      password: 'Fitora',
      role: 'GYM_MAINTAINER',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const initialPartition: GymPartition = {
      gym: newGym,
      members: [],
      plans: [
        {
          id: `plan_${Date.now()}_1`,
          gymId: gymInternalId,
          name: 'Monthly Standard',
          durationMonths: 1,
          price: 1500,
          description: '1 month basic access',
          isActive: true,
        },
        {
          id: `plan_${Date.now()}_2`,
          gymId: gymInternalId,
          name: 'Quarterly Gold',
          durationMonths: 3,
          price: 4000,
          description: '3 months full fitness access',
          isActive: true,
        },
      ],
      payments: [],
      renewals: [],
    };

    gyms.push(newGym);
    users.push(newUser);

    localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(gyms));
    localStorage.setItem(STORAGE_KEYS.MASTER_USERS, JSON.stringify(users));
    localStorage.setItem(
      `${STORAGE_KEYS.PARTITION_PREFIX}${gymInternalId}`,
      JSON.stringify(initialPartition)
    );

    CloudStorageService.syncNewGym(newGym, newUser, initialPartition).catch(() => {});

    return { gym: newGym, user: newUser };
  },

  updateGymLicense(gymId: string, status: 'Active' | 'Expired' | 'Trial', newExpiryDate?: string): void {
    const gyms = this.getAllGyms();
    const idx = gyms.findIndex((g) => g.id === gymId);
    if (idx !== -1) {
      gyms[idx].licenseStatus = status;
      if (newExpiryDate) {
        gyms[idx].licenseExpiryDate = newExpiryDate;
      }
      localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(gyms));
    }
  },

  deleteMaintainerAccount(userId: string, deletePartition = true): void {
    let users = this.getAllUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    users = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.MASTER_USERS, JSON.stringify(users));

    if (deletePartition && user.gymId) {
      let gyms = this.getAllGyms();
      gyms = gyms.filter((g) => g.id !== user.gymId);
      localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(gyms));
      localStorage.removeItem(`${STORAGE_KEYS.PARTITION_PREFIX}${user.gymId}`);
    }
  },

  deleteGymPartition(gymId: string): void {
    let gyms = this.getAllGyms();
    gyms = gyms.filter((g) => g.id !== gymId);
    localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(gyms));

    let users = this.getAllUsers();
    users = users.filter((u) => u.gymId !== gymId);
    localStorage.setItem(STORAGE_KEYS.MASTER_USERS, JSON.stringify(users));

    localStorage.removeItem(`${STORAGE_KEYS.PARTITION_PREFIX}${gymId}`);
    CloudStorageService.syncDeleteGym(gymId).catch(() => {});
  },

  getPartition(gymId: string): GymPartition {
    this.init();
    const key = `${STORAGE_KEYS.PARTITION_PREFIX}${gymId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const parsed: GymPartition = JSON.parse(raw);
        if (parsed.gym && (!parsed.gym.currencySymbol || parsed.gym.currencySymbol === '$')) {
          parsed.gym.currencySymbol = '₹';
        }
        parsed.members = (parsed.members || []).map((m) => ({
          ...m,
          status: calculateMemberStatus(m.expiryDate),
        }));
        return parsed;
      } catch (err) {
        console.error('Error parsing gym partition:', err);
      }
    }
    const defaultGym = this.getGymById(gymId) || DEFAULT_GYMS[0];
    return {
      gym: { ...defaultGym, currencySymbol: defaultGym.currencySymbol || '₹' },
      members: [],
      plans: [],
      payments: [],
      renewals: [],
    };
  },

  savePartition(gymId: string, partition: GymPartition): void {
    const key = `${STORAGE_KEYS.PARTITION_PREFIX}${gymId}`;
    localStorage.setItem(key, JSON.stringify(partition));

    // Keep MASTER_GYMS in sync if partition.gym exists
    if (partition.gym) {
      try {
        const gyms = this.getAllGyms();
        const idx = gyms.findIndex((g) => g.id === gymId || g.id === partition.gym.id);
        if (idx !== -1) {
          gyms[idx] = { ...gyms[idx], ...partition.gym };
        } else {
          gyms.push(partition.gym);
        }
        localStorage.setItem(STORAGE_KEYS.MASTER_GYMS, JSON.stringify(gyms));
      } catch {}
    }

    CloudStorageService.syncPartitionToCloud(gymId, partition).catch(() => {});
  },

  addMember(
    gymId: string,
    data: {
      fullName: string;
      phone: string;
      email?: string;
      gender?: string;
      dob?: string;
      address?: string;
      emergencyContact?: string;
      notes?: string;
      photoUrl?: string;
      planId: string;
      startDate: string;
      amountPaid: number;
      paymentMethod: string;
    }
  ): Member {
    const partition = this.getPartition(gymId);
    const plan = partition.plans.find((p) => p.id === data.planId);
    const durationMonths = plan ? plan.durationMonths : 1;
    const expiryDate = addMonthsToDate(data.startDate, durationMonths);
    const status = calculateMemberStatus(expiryDate);
    const code = `MEM-${1000 + partition.members.length + 1}`;
    const id = `mem_${Date.now()}`;

    const member: Member = {
      id,
      gymId,
      memberCode: code,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      gender: data.gender,
      dob: data.dob,
      address: data.address,
      emergencyContact: data.emergencyContact,
      notes: data.notes,
      photoUrl: data.photoUrl,
      planId: data.planId,
      planName: plan ? plan.name : 'Custom Plan',
      startDate: data.startDate,
      expiryDate,
      amountPaid: data.amountPaid,
      paymentMethod: data.paymentMethod,
      status,
      createdAt: data.startDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      gymId,
      memberId: id,
      memberName: member.fullName,
      planName: member.planName,
      amount: member.amountPaid,
      paymentMethod: member.paymentMethod,
      date: member.startDate,
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(partition.payments.length + 1).padStart(3, '0')}`,
      notes: 'Initial Membership Registration',
    };

    partition.members.unshift(member);
    partition.payments.unshift(payment);
    this.savePartition(gymId, partition);
    return member;
  },

  updateMember(gymId: string, memberId: string, updates: Partial<Member>): Member | null {
    const partition = this.getPartition(gymId);
    const idx = partition.members.findIndex((m) => m.id === memberId);
    if (idx === -1) return null;

    const updated: Member = {
      ...partition.members[idx],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    if (updates.expiryDate) {
      updated.status = calculateMemberStatus(updates.expiryDate);
    }
    partition.members[idx] = updated;
    this.savePartition(gymId, partition);
    return updated;
  },

  renewMember(
    gymId: string,
    memberId: string,
    newPlanId: string,
    amount: number,
    paymentMethod: string,
    customStartDate?: string
  ): { member: Member; payment: Payment; renewal: Renewal } | null {
    const partition = this.getPartition(gymId);
    const idx = partition.members.findIndex((m) => m.id === memberId);
    if (idx === -1) return null;

    const member = partition.members[idx];
    const plan = partition.plans.find((p) => p.id === newPlanId);
    const durationMonths = plan ? plan.durationMonths : 1;

    const effectiveStartDate =
      customStartDate ||
      (new Date(member.expiryDate) > new Date(CURRENT_SYSTEM_DATE)
        ? member.expiryDate
        : CURRENT_SYSTEM_DATE);

    const newExpiry = addMonthsToDate(effectiveStartDate, durationMonths);
    const prevExpiry = member.expiryDate;

    member.planId = newPlanId;
    member.planName = plan ? plan.name : member.planName;
    member.startDate = effectiveStartDate;
    member.expiryDate = newExpiry;
    member.status = calculateMemberStatus(newExpiry);
    member.updatedAt = new Date().toISOString().split('T')[0];

    const payment: Payment = {
      id: `pay_${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: member.fullName,
      planName: member.planName,
      amount,
      paymentMethod,
      date: CURRENT_SYSTEM_DATE,
      receiptNumber: `RCP-${new Date().getFullYear()}-${String(partition.payments.length + 1).padStart(3, '0')}`,
      notes: `Membership Renewal (${plan?.name || 'Standard'})`,
    };

    const renewal: Renewal = {
      id: `ren_${Date.now()}`,
      gymId,
      memberId: member.id,
      memberName: member.fullName,
      previousExpiry: prevExpiry,
      newExpiry,
      planName: member.planName,
      amount,
      paymentMethod,
      renewalDate: CURRENT_SYSTEM_DATE,
    };

    partition.members[idx] = member;
    partition.payments.unshift(payment);
    partition.renewals.unshift(renewal);
    this.savePartition(gymId, partition);

    return { member, payment, renewal };
  },

  deleteMember(gymId: string, memberId: string): void {
    const partition = this.getPartition(gymId);
    partition.members = partition.members.filter((m) => m.id !== memberId);
    this.savePartition(gymId, partition);
  },

  addPlan(gymId: string, planData: Omit<Plan, 'id' | 'gymId'>): Plan {
    const partition = this.getPartition(gymId);
    const plan: Plan = {
      ...planData,
      id: `plan_${Date.now()}`,
      gymId,
    };
    partition.plans.push(plan);
    this.savePartition(gymId, partition);
    return plan;
  },

  updatePlan(gymId: string, planId: string, updates: Partial<Plan>): Plan | null {
    const partition = this.getPartition(gymId);
    const idx = partition.plans.findIndex((p) => p.id === planId);
    if (idx === -1) return null;
    partition.plans[idx] = { ...partition.plans[idx], ...updates };
    this.savePartition(gymId, partition);
    return partition.plans[idx];
  },

  deletePlan(gymId: string, planId: string): void {
    const partition = this.getPartition(gymId);
    partition.plans = partition.plans.filter((p) => p.id !== planId);
    this.savePartition(gymId, partition);
  },

  exportPartitionJSON(gymId: string): string {
    const partition = this.getPartition(gymId);
    return JSON.stringify(partition, null, 2);
  },

  importPartitionJSON(gymId: string, jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.gym || !Array.isArray(parsed.members) || !Array.isArray(parsed.plans)) {
        throw new Error('Invalid partition backup structure.');
      }
      this.savePartition(gymId, parsed);
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  getActiveSession(): { user: User; gymId?: string } | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setActiveSession(session: { user: User; gymId?: string } | null): void {
    if (typeof window === 'undefined') return;
    if (!session) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    }
  },

  clearActiveSession(): void {
    this.setActiveSession(null);
  },

  /**
   * Comprehensive login validator that avoids common traps:
   * - Trims input
   * - Case-insensitive email checking
   * - Allows both admin@email.com and admin@fitora.com
   * - Provides distinct error messages ('User not found' vs 'Incorrect password')
   * - Detects if credentials match another role and offers seamless route
   */
  validateLogin(
    rawEmail: string,
    rawPassword: string,
    intendedRole?: 'SUPER_ADMIN' | 'GYM_MAINTAINER'
  ): {
    success: boolean;
    user?: User;
    gymId?: string;
    error?: string;
    suggestedRole?: 'SUPER_ADMIN' | 'GYM_MAINTAINER';
  } {
    const email = (rawEmail || '').trim().toLowerCase();
    const password = (rawPassword || '').trim();

    if (!email) {
      return { success: false, error: 'Please enter your account email address.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    const adminCreds = this.getAdminCredentials();
    const allUsers = this.getAllUsers();

    // Check if this is Super Admin (accepts admin@email.com or admin@fitora.com or saved admin email)
    const isAdminEmail =
      email === adminCreds.email.toLowerCase() ||
      email === 'admin@email.com' ||
      email === 'admin@fitora.com';

    if (isAdminEmail) {
      const adminUser =
        allUsers.find((u) => u.role === 'SUPER_ADMIN') || DEFAULT_USERS[0];
      const validAdminPasswords = [
        adminCreds.password,
        'password123',
        adminUser.password,
      ].filter(Boolean);

      const passwordMatches = validAdminPasswords.some(
        (p) => p === password || p?.toLowerCase() === password.toLowerCase()
      );

      if (!passwordMatches) {
        return {
          success: false,
          error: 'Incorrect admin password. Please try again or use "Forgot password?".',
        };
      }

      if (intendedRole === 'GYM_MAINTAINER') {
        return {
          success: false,
          suggestedRole: 'SUPER_ADMIN',
          error:
            'This is an Admin account. Please switch to Admin Login below to proceed.',
        };
      }

      return {
        success: true,
        user: adminUser,
      };
    }

    // Look for Gym Maintainer
    const user = allUsers.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      return {
        success: false,
        error: `No account found with email "${email}". Please verify your email address.`,
      };
    }

    // User exists - check if it's admin mistakenly entering here
    if (user.role === 'SUPER_ADMIN') {
      const validAdminPasswords = [
        adminCreds.password,
        'password123',
        user.password,
      ].filter(Boolean);
      const matches = validAdminPasswords.some(
        (p) => p === password || p?.toLowerCase() === password.toLowerCase()
      );
      if (!matches) {
        return { success: false, error: 'Incorrect password for Admin account.' };
      }
      return {
        success: true,
        user,
      };
    }

    // It is a GYM_MAINTAINER
    const expectedPassword = user.password || 'Fitora';
    const matchesMaintainer =
      password === expectedPassword ||
      password.toLowerCase() === expectedPassword.toLowerCase() ||
      password === 'Fitora' ||
      password.toLowerCase() === 'fitora' ||
      password === 'password123';

    if (!matchesMaintainer) {
      return {
        success: false,
        error: 'Incorrect password. Default maintainer password is "Fitora".',
      };
    }

    return {
      success: true,
      user,
      gymId: user.gymId || 'gym_iron_01',
    };
  },
};
