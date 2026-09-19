export type UserRole = 'SUPER_ADMIN' | 'GYM_MAINTAINER';

export type MemberStatus = 'Active' | 'Expiring Soon' | 'Expires Today' | 'Expired';

export interface Gym {
  id: string;
  gymId: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string;
  currencySymbol: string;
  licenseStatus: 'Active' | 'Expired' | 'Trial';
  licenseExpiryDate: string;
  createdAt: string;
}

export interface User {
  id: string;
  gymId: string | null;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface Plan {
  id: string;
  gymId: string;
  name: string;
  durationMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
}

export interface Member {
  id: string;
  gymId: string;
  memberCode: string;
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
  planName: string;
  startDate: string;
  expiryDate: string;
  amountPaid: number;
  paymentMethod: string;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  receiptNumber: string;
  notes?: string;
}

export interface Renewal {
  id: string;
  gymId: string;
  memberId: string;
  memberName: string;
  previousExpiry: string;
  newExpiry: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  renewalDate: string;
}

export interface GymPartition {
  gym: Gym;
  members: Member[];
  plans: Plan[];
  payments: Payment[];
  renewals: Renewal[];
}

export interface AdminCredentials {
  email: string;
  password: string;
}
