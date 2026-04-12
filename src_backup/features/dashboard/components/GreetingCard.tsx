import React, { memo, useMemo, useEffect } from 'react';
import { Sun, CloudSun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/lib/apiClient';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { STORAGE_KEYS, QUERY_KEYS } from '../../../shared/constants/storageKeys';

interface GreetingCardProps {
  userName: string;
}

interface ScheduledQuote {
  date: string;
  text: string;
}

interface QuoteConfig {
  defaultText?: string;
  scheduled?: ScheduledQuote[];
}

const DEFAULT_QUOTE = 'আজকের প্রস্তুতি শুরু করা যাক!';

// Extracted fetcher function for React Query
const fetchDailyQuote = async (): Promise<string> => {
  const { data } = await apiClient.get('/system/configs/daily_quote');
  
  if (data?.success && data?.data?.value) {
    const config = data.data.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (typeof config === 'object' && config !== null) {
      const typedConfig = config as QuoteConfig;
      
      if (Array.isArray(typedConfig.scheduled)) {
        const scheduledQuote = typedConfig.scheduled.find(q => q.date === today);
        if (scheduledQuote && scheduledQuote.text) {
          return scheduledQuote.text;
        }
      }
      return typedConfig.defaultText || DEFAULT_QUOTE;
    }
    return String(config);
  }
  
  throw new Error('Invalid quote response format');
};

const GreetingCard: React.FC<GreetingCardProps> = memo(({ userName }) => {
  // Determine greeting message and icon stably
  const { greeting, Icon } = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) return { greeting: 'শুভ দুপুর', Icon: CloudSun };
    if (hour >= 17) return { greeting: 'শুভ সন্ধ্যা', Icon: Moon };
    return { greeting: 'শুভ সকাল', Icon: Sun };
  }, []);

  // Proper architectural way to handle local storage fallback
  const [cachedQuote, setCachedQuote] = useLocalStorage<string>(
    STORAGE_KEYS.DAILY_QUOTE, 
    DEFAULT_QUOTE
  );

  // TanStack React Query for reliable server state management
  const { data: dailyQuote } = useQuery({
    queryKey: QUERY_KEYS.DAILY_QUOTE,
    queryFn: fetchDailyQuote,
    staleTime: 1000 * 60 * 60 * 2, // Consider data fresh for 2 hours
    initialData: cachedQuote, // Prevents layout shift / flash of empty text by using cache immediately
  });

  // Sync fresh network data with local storage
  useEffect(() => {
    if (dailyQuote && dailyQuote !== cachedQuote) {
      setCachedQuote(dailyQuote);
    }
  }, [dailyQuote, cachedQuote, setCachedQuote]);

  return (
    <div className="mb-6 mt-2 px-4">
      <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 mb-1">
        <Icon size={18} />
        <span className="text-sm font-medium">{greeting} ,</span>
      </div>
      <h1 className="text-3xl font-bold font-['Hind_Siliguri']">
        {userName}
      </h1>
      <p className="opacity-80 text-sm mt-1 font-['Hind_Siliguri'] transition-all duration-500">
        {dailyQuote}
      </p>
    </div>
  );
});

GreetingCard.displayName = 'GreetingCard';
export default GreetingCard;
