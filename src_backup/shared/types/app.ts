// Authentication & User (Aligned with Table 1 & Table 2)
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'moderator' | 'editor' | 'teacher' | 'student';
  avatar_url?: string | null;
  current_group_id?: string | null; // Group Integration
  total_xp?: number; // Gamification
  coin_balance?: number; // Virtual Wallet
  account_status?: 'active' | 'suspended' | 'deleted';
}

// Exam & Content (Aligned with Table 9: questions)
export interface QuestionStructure {
  id: string;
  body: any; // Changed to any/jsonb as per DB schema
  options: any; // Changed to any/jsonb as per DB schema
  explanation?: string | null;
  image_url?: string | null;
  solution_video_url?: string | null;
  solution_video_provider?: 'youtube' | 'vimeo' | 'native';
  difficulty_level?: string;
  type?: string;
  order_index?: number; // Frontend specific for rendering order
}

// Exam Progress (Aligned with Table 25: exam_progress)
export interface ExamProgressState {
  exam_id: string; // Added to match DB context
  currentQuestionIndex: number;
  answers_draft: Record<string, any>; // Renamed from answers to match DB column
  timeRemaining: number;
  isComplete: boolean;
  status?: 'idle' | 'running' | 'paused' | 'finished';
}

// Notifications & System (Aligned with Table 19 & 32)
export interface NotificationItem {
  id: string;
  target_user_id?: string | null; // null means global notice
  title_en: string; // Bilingual Support
  title_bn?: string | null;
  body_en: string;
  body_bn?: string | null;
  image_url?: string | null;
  action_link?: string | null;
  type: 'system' | 'exam_alert' | 'promo' | 'global_notice' | 'group_invite' | 'battle_challenge' | 'focus_request' | 'nudge_alert';
  channel?: 'push' | 'in_app' | 'email' | 'all';
  priority?: 'high' | 'normal' | 'low';
  meta_data?: Record<string, any>; // Dynamic data like group_id, battle_id
  
  // From Table 32 (notification_reads)
  is_read: boolean;
  is_clicked?: boolean; 
  created_at: string;
}
