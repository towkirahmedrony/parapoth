import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from '../services/notificationService';

const TYPE_KEYS = [
  ['exam', 'notification.typeExam'],
  ['reward', 'notification.typeReward'],
  ['streak', 'notification.typeStreak'],
  ['social', 'notification.typeSocial'],
  ['billing', 'notification.typeBilling'],
  ['security', 'notification.typeSecurity'],
] as const;

const LOCKED_TYPES = new Set(['billing', 'security']);

const Toggle: React.FC<{
  checked: boolean;
  disabled?: boolean;
  label: string;
  hint?: string;
  onChange?: () => void;
}> = ({ checked, disabled = false, label, hint, onChange }) => (
  <div
    className={`flex items-center justify-between gap-3 py-2.5 ${
      disabled ? 'opacity-70' : ''
    }`}
  >
    <span className="min-w-0">
      <span className="block text-sm font-medium text-text-primary">{label}</span>
      {hint && <span className="block text-[11px] text-text-secondary">{hint}</span>}
    </span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-surface-elevated border border-border-color'
      } ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  </div>
);

const NotificationPreferencesCard: React.FC<{ userId: string }> = ({ userId }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const queryKey = ['notifications', 'preferences', userId];

  const { data, isLoading } = useQuery<NotificationPreferences>({
    queryKey,
    queryFn: fetchNotificationPreferences,
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey);
      if (previous) {
        queryClient.setQueryData<NotificationPreferences>(queryKey, {
          ...previous,
          ...patch,
          types: { ...previous.types, ...(patch.types ?? {}) },
        });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-9 animate-pulse rounded-lg bg-surface-elevated" />
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border-color">
      <Toggle
        checked={data.in_app}
        label={t('notification.inApp')}
        onChange={() => mutation.mutate({ in_app: !data.in_app })}
      />
      <Toggle
        checked={data.push}
        label={t('notification.push')}
        onChange={() => mutation.mutate({ push: !data.push })}
      />

      <div className="pt-1">
        {TYPE_KEYS.map(([type, labelKey]) => {
          const locked = LOCKED_TYPES.has(type);
          return (
            <Toggle
              key={type}
              checked={locked ? true : data.types[type] !== false}
              disabled={locked}
              label={t(labelKey)}
              hint={locked ? t('notification.alwaysOn') : undefined}
              onChange={
                locked
                  ? undefined
                  : () =>
                      mutation.mutate({
                        types: { ...data.types, [type]: data.types[type] === false },
                      })
              }
            />
          );
        })}
      </div>
    </div>
  );
};

export default NotificationPreferencesCard;
