import { supabase } from '../../../shared/lib/supabase';
import type { Database } from '../../../shared/types/supabase';

type ExamHistoryInsert = Database['public']['Tables']['exam_history']['Insert'];

export const analyticsService = {
  async saveExamResult(payload: Omit<ExamHistoryInsert, 'id'>) {
    const { data, error } = await supabase
      .from('exam_history')
      .insert({
        ...payload,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save exam result:', error);
      throw error;
    }
    
    return { success: true, historyId: data?.id };
  },

  async updateUserProgress(userId: string, xp: number, coins: number) {
    const { error } = await supabase.rpc('update_user_progress', {
      p_user_id: userId,
      p_xp: xp,
      p_coins: coins
    }); 
    
    if (error) {
      console.error('Progress update failed:', error);
      throw error;
    }
  }
};
