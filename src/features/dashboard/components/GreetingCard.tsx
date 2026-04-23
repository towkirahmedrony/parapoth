import React, { memo, useMemo } from 'react';
import { Sun, CloudSun, Moon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { QUERY_KEYS } from '@/shared/constants/storageKeys';

interface GreetingCardProps {
  userName: string | { full_name?: string } | unknown;
}

interface ScheduledQuote {
  date: string;
  text: string;
}

interface QuoteConfig {
  defaultText?: string;
  scheduled?: ScheduledQuote[];
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
    return value;
  }

  if (!isRecord(value)) {
    return DEFAULT_QUOTE;
  }

  const config = value as QuoteConfig;
  const today = new Date().toISOString().split('T')[0];

  if (Array.isArray(config.scheduled)) {
    const scheduledQuote = config.scheduled.find(
      item => item?.date === today && typeof item?.text === 'string' && item.text.trim()
    );

    if (scheduledQuote) {
      return scheduledQuote.text;
    }
  }

  if (typeof config.defaultText === 'string' && config.defaultText.trim()) {
    return config.defaultText;
  }

  return DEFAULT_QUOTE;
};

const fetchDailyQuote = async (): Promise<string> => {
  const { data } = await apiClient.get<DailyQuoteResponse>('/system/configs/daily_quote');

  if (data?.success === true) {
    return normalizeQuoteConfig(data.data?.value);
  }

  return DEFAULT_QUOTE;
};

const GreetingCard: React.FC<GreetingCardProps> = memo(({ userName }) => {
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

  const safeUserName = useMemo(() => {
    if (!userName) return 'শিক্ষার্থী';

    if (typeof userName === 'string') {
      return userName.trim() || 'শিক্ষার্থী';
    }

    if (typeof userName === 'object' && userName !== null && 'full_name' in userName) {
      const fullName = (userName as { full_name?: string }).full_name;
      return typeof fullName === 'string' && fullName.trim() ? fullName : 'শিক্ষার্থী';
    }

    return 'শিক্ষার্থী';
  }, [userName]);

  return (
    <div className="mb-6 mt-2 px-4">
      <div className="flex items-center gap-2 text-text-secondary mb-1">
        <Icon size={18} />
        <span className="text-sm font-medium">{greeting},</span>
      </div>

      <h1 className="text-3xl font-bold font-['Hind_Siliguri'] text-text-primary">
        {safeUserName}
      </h1>

      <p className="text-sm mt-1 font-['Hind_Siliguri'] transition-all duration-500 text-text-secondary">
        {dailyQuote || DEFAULT_QUOTE}
      </p>
    </div>
  );
});

GreetingCard.displayName = 'GreetingCard';
export default GreetingCard;
