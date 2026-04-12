import apiClient from '../../../shared/lib/apiClient';
import { supabase } from '../../../shared/lib/supabase';

// Importing types based on project structure.
import type { PublicProfile } from '../types/publicProfile';
import type { UserProfileData } from '../types/profile';

// Created a specific response interface to fix TS2339 errors in the UI
export interface PublicProfileResponse {
  profile: PublicProfile;
  versusStats?: any; // Replace with proper type if available in your types
  activityData?: any; // Replace with proper type if available in your types
}

export const getPublicProfileData = async (targetId: string, currentUserId?: string): Promise<PublicProfileResponse> => {
  try {
    const headers: Record<string, string> = {};
    
    if (currentUserId) {
      headers['x-user-id'] = currentUserId;
    }

    const response = await apiClient.get<{ success: boolean; message: string; data: PublicProfileResponse }>(
      `/profiles/public/${targetId}`, 
      { headers }
    );

    return response.data?.data;
  } catch (error: unknown) {
    const err = error as any;
    if (err.response?.status === 404) {
      throw new Error('User not found');
    }
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      throw new Error('timeout');
    }
    
    const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch public profile';
    throw new Error(errorMessage);
  }
};

/**
 * Fetches the current authenticated user's profile from Supabase.
 * Extracted from UserProfile component for better separation of concerns.
 */
export const getCurrentUserProfile = async (userId: string): Promise<UserProfileData> => {
  try {
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    // Using 'as unknown as' to safely cast and prevent TS2352 strict overlap errors
    return profileData as unknown as UserProfileData;
  } catch (error: unknown) {
    const err = error as Error;
    const errorMessage = err.message || 'Failed to fetch user profile';
    throw new Error(errorMessage);
  }
};
