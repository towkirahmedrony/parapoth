import { useQuery } from '@tanstack/react-query';
import { fetchProgressDashboardData } from '../services/progressService';
import { ProgressDashboardResponse } from '../types/progress';

export const useProgressData = () => {
  return useQuery<ProgressDashboardResponse, Error>({
    queryKey: ['progressDashboard'],
    queryFn: fetchProgressDashboardData,
    staleTime: 1000 * 60 * 5, // ৫ মিনিট পর্যন্ত ডেটা ফ্রেশ থাকবে
    retry: 1, // ফেইল করলে ১ বার রিট্রাই করবে
  });
};
