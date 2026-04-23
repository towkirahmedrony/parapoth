export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price_coins: number;
  icon_url?: string;
  features: string[];
  is_active: boolean;
  item_type: 'premium_feature' | 'exam_pass' | 'profile_badge';
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  new_balance: number;
}
