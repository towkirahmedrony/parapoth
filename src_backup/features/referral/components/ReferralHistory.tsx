import React from 'react';
import { UserCheck } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { ReferralHistoryItem } from '../types/referral';

interface HistoryProps {
  history: ReferralHistoryItem[];
  isLoading: boolean;
}

export const ReferralHistory: React.FC<HistoryProps> = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div 
        className="animate-pulse h-32 rounded-xl" 
        style={{ backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      />
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card 
        className="p-8 text-center"
        style={{ 
          backgroundColor: 'var(--dyn-card)', 
          border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
        } as React.CSSProperties}
      >
         <div 
          className="flex flex-col items-center justify-center"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 50%, transparent)' }}
         >
            <UserCheck size={48} className="mb-2 opacity-50"/>
            <p>No referrals yet. Invite friends to start earning!</p>
         </div>
      </Card>
    );
  }

  return (
    <Card 
      className="p-0 overflow-hidden"
      style={{ 
        backgroundColor: 'var(--dyn-card)', 
        border: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' 
      } as React.CSSProperties}
    >
      <div 
        className="p-4"
        style={{ borderBottom: '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
      >
        <h3 className="font-semibold" style={{ color: 'var(--dyn-text)' }}>
          Your Squad ({history.length})
        </h3>
      </div>
      <div>
        {history.map((item, index) => {
          // Safe fallback for initial if full_name is missing
          const initial = item.user.full_name?.charAt(0)?.toUpperCase() || '?';
          // Safe date parsing
          const joinedDate = item.user.joined_at 
            ? new Date(item.user.joined_at).toLocaleDateString() 
            : 'Unknown Date';

          return (
            <div 
              key={item.user.id} 
              className="p-4 flex items-center justify-between transition hover:[background-color:color-mix(in_srgb,var(--dyn-text)_5%,transparent)]"
              style={{ 
                borderTop: index > 0 ? '1px solid color-mix(in srgb, var(--dyn-text) 10%, transparent)' : 'none' 
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0"
                  style={{ 
                    backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 15%, transparent)', 
                    color: 'var(--dyn-primary)' 
                  }}
                >
                  {item.user.avatar_url ? (
                    <img src={item.user.avatar_url} alt="User" className="w-full h-full object-cover"/>
                  ) : (
                    initial
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--dyn-text)' }}>
                    {item.user.full_name || 'Anonymous User'}
                  </p>
                  <p 
                    className="text-xs flex items-center gap-1"
                    style={{ color: 'color-mix(in srgb, var(--dyn-text) 60%, transparent)' }}
                  >
                     {joinedDate}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <span 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: item.user.status === 'active' 
                      ? 'color-mix(in srgb, #16a34a 15%, transparent)' 
                      : 'color-mix(in srgb, #eab308 15%, transparent)',
                    color: item.user.status === 'active' ? '#16a34a' : '#eab308'
                  }}
                >
                  {item.user.status === 'active' ? '+100 Coins' : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default React.memo(ReferralHistory);
