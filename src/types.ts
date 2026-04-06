export type UserRole = 'super_admin' | 'admin_central' | 'fonctionnaire' | 'citizen';
export type UserStatus = 'pending' | 'active' | 'pending_deletion';

export interface UserProfile {
  id: string;
  full_name: string;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  cnie?: string;
  grade?: string;
  matricule?: string;
  role: UserRole;
  status?: UserStatus;
  is_approved: boolean;
  city: string;
  created_at: string;
}

