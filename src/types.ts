export type UserRole = 'citizen' | 'official' | 'admin_central' | 'super_admin';

export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  cnie?: string;
  grade?: string;
  matricule?: string;
  city: string;
  role: UserRole;
  is_approved: boolean;
  status?: 'pending' | 'active' | 'pending_deletion';
  created_at: string;
}

export interface ScannedDocument {
  id: string;
  user_id: string;
  file_url: string;
  extracted_data: any;
  doc_type: string;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}
