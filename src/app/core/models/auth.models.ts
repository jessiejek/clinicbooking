export type Role = 'Admin' | 'Staff' | 'Doctor' | 'Patient';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  isFirstLogin: boolean;
}
