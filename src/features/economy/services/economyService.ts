import apiClient from '@/shared/lib/apiClient';
import { MarketplaceItem, PurchaseResponse } from '../types/economy';

export const economyService = {
  // ইউজারের বর্তমান ব্যালেন্স দেখা
  getUserBalance: async () => {
    const response = await apiClient.get('/user/balance');
    return response.data?.coin_balance || 0;
  },

  // মার্কেটপ্লেসের আইটেম লিস্ট আনা
  getMarketplaceItems: async (): Promise<MarketplaceItem[]> => {
    const response = await apiClient.get('/marketplace/items');
    return response.data || [];
  },

  // আইটেম কেনা
  purchaseItem: async (itemId: string): Promise<PurchaseResponse> => {
    const response = await apiClient.post('/marketplace/purchase', { item_id: itemId });
    return response.data;
  }
};
