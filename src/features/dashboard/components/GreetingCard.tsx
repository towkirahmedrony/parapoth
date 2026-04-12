import React, { memo, useMemo } from 'react';
import { Sun, CloudSun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient'; // Fixed to named import for consistency
import { QUERY_KEYS } from '@/shared/constants/storageKeys';

interface GreetingCardProps {
  // Broadened type to handle runtime edge cases safely
  userName: string | { full_name?: string } | any;
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

  // TanStack React Query for reliable server state management.
  // Manual local storage sync (useEffect + useLocalStorage) is removed 
  // because the global persister now handles offline hydration.
  const { data: dailyQuote } = useQuery({
    queryKey: QUERY_KEYS.DAILY_QUOTE, // Assumes this is an array in storageKeys.ts
    queryFn: fetchDailyQuote,
    staleTime: 1000 * 60 * 60 * 2, // Consider data fresh for 2 hours
  });

  // DEFENSIVE PROGRAMMING: Safely extract user name.
  // This explicitly prevents the "Objects are not valid as a React child" error 
  // if the parent accidentally passes a raw profile object instead of a string.
  const safeUserName = useMemo(() => {
    if (!userName) return 'শিক্ষার্থী';
    if (typeof userName === 'string') return userName;
    if (typeof userName === 'object' && 'full_name' in userName) {
      return userName.full_name || 'শিক্ষার্থী';
    }
    return String(userName);
  }, [userName]);

  return (
    <div className="mb-6 mt-2 px-4">
      <div className="flex items-center gap-2 text-yellow-500 dark:text-yellow-400 mb-1">
        <Icon size={18} />
        <span className="text-sm font-medium">{greeting} ,</span>
      </div>
      <h1 className="text-3xl font-bold font-['Hind_Siliguri']">
        {safeUserName}
      </h1>
      <p className="opacity-80 text-sm mt-1 font-['Hind_Siliguri'] transition-all duration-500">
        {dailyQuote || DEFAULT_QUOTE}
      </p>
    </div>
  );
});

GreetingCard.displayName = 'GreetingCard';
export default GreetingCard;
