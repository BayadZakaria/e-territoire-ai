export type UserRole = 'super_admin' | 'admin_central' | 'fonctionnaire' | 'citizen';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  is_approved: boolean;
  city: string;
  created_at: string;
}

