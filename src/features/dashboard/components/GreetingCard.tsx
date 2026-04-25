import React, { memo, useMemo } from 'react';
import { Sun, CloudSun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/constants/storageKeys';
import { Skeleton } from '@/shared/components/ui/Skeleton';

interface GreetingCardProps {
  userName?: string | null;
  isNameLoading?: boolean;
  hasBgImage?: boolean;
}

interface ScheduledQuote {
  date: string;
  text: string;
}

interface DailyQuoteResponse {
  success?: unknown;
  data?: {
    value?: unknown;
  };
}

const DEFAULT_QUOTE = 'আজকের প্রস্তুতি শুরু করা যাক!';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeQuoteConfig = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (!isRecord(value)) {
    return DEFAULT_QUOTE;
  }

  const today = new Date().toISOString().split('T')[0];
  const scheduled = Array.isArray(value.scheduled) ? value.scheduled : [];

  const matched = scheduled.find(
    item =>
      item &&
      typeof item === 'object' &&
      'date' in item &&
      'text' in item &&
      (item as ScheduledQuote).date === today &&
      typeof (item as ScheduledQuote).text === 'string' &&
      (item as ScheduledQuote).text.trim()
  );

  if (matched) {
    return matched.text.trim();
  }

  if (typeof value.defaultText === 'string' && value.defaultText.trim()) {
    return value.defaultText.trim();
  }

  return DEFAULT_QUOTE;
};

const fetchDailyQuote = async (): Promise<string> => {
  // 👈 এখানে /system থেকে /app-builder আপডেট করা হয়েছে
  const { data } = await apiClient.get<DailyQuoteResponse>('/app-builder/configs/daily_quote');

  if (data?.success === true) {
    return normalizeQuoteConfig(data.data?.value);
  }

  return DEFAULT_QUOTE;
};

const GreetingCard: React.FC<GreetingCardProps> = memo(
  ({ userName = null, isNameLoading = false, hasBgImage = false }) => {
    const { greeting, Icon } = useMemo(() => {
      const hour = new Date().getHours();

      if (hour >= 12 && hour < 17) {
        return { greeting: 'শুভ দুপুর', Icon: CloudSun };
      }

      if (hour >= 17) {
        return { greeting: 'শুভ সন্ধ্যা', Icon: Moon };
      }

      return { greeting: 'শুভ সকাল', Icon: Sun };
    }, []);

    const { data: dailyQuote } = useQuery({
      queryKey: QUERY_KEYS.DAILY_QUOTE,
      queryFn: fetchDailyQuote,
      staleTime: 1000 * 60 * 60 * 2,
      retry: 1,
    });

    const safeUserName =
      typeof userName === 'string' && userName.trim() ? userName.trim() : 'শিক্ষার্থী';

    const greetingTextClass = hasBgImage ? 'text-text-primary' : 'text-text-secondary';
    const nameTextClass = 'text-text-primary';
    const quoteTextClass = hasBgImage ? 'text-text-primary/80' : 'text-text-secondary';

    return (
      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-badge-bg px-3 py-1 text-badge-text">
          <Icon size={14} />
          <span className={`font-['Hind_Siliguri'] text-xs font-medium ${greetingTextClass}`}>
            {greeting}
          </span>
        </div>

        <div className="mt-2">
          {isNameLoading ? (
            <Skeleton className="h-9 w-[200px] max-w-[78%] rounded-xl bg-surface-elevated" />
          ) : (
            <h1 className={`font-['Hind_Siliguri'] text-[2rem] font-bold leading-tight ${nameTextClass}`}>
              {safeUserName}
            </h1>
          )}
        </div>

        <p className={`mt-1 font-['Hind_Siliguri'] text-sm leading-5 ${quoteTextClass}`}>
          {dailyQuote || DEFAULT_QUOTE}
        </p>
      </div>
    );
  }
);

GreetingCard.displayName = 'GreetingCard';

export default GreetingCard;
