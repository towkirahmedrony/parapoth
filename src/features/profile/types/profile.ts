export interface UserProfileData {
  // Identity
  id: string;
  username?: string | null; // Added to fix TS2339
  full_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  institution: string;

  // Group Integration
  current_group_id?: string | null;

  // Academic
  class_level: string;
  group: string; // 'Science' | 'Business' | 'Humanities'
  education_board: string;
  batch_year: string;
  study_goal: string;

  // Contact
  phone_number: string;
  is_phone_verified: boolean;
  guardian_phone: string;
  gender: string;
  address: string | Record<string, any>; // Database contains jsonb

  // Settings & Subscription
  subscription_status: 'active' | 'suspended' | 'expired' | 'inactive' | string;
  subscription_expiry?: string;
  language_preference?: string;

  // Gamification & Economy
  total_xp?: number;
  coin_balance?: number;
  current_streak?: number;

  // RBAC & Access
  role?: string; // Made optional (TS2352) since it's typically merged from user_roles table
}
