import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLanguage } from '@/shared/i18n/LanguageProvider';
import EmptyState from '@/shared/components/ui/EmptyState';
import { Skeleton } from '@/shared/components/ui/Skeleton';
import { GROUP_QUERY_KEYS, useGroupMessages } from '../hooks/useGroupQueries';
import { groupsService } from '../services/groupsService';
import { resolveGroupErrorMessage } from '../utils/errorMessages';
import type { GroupMessage } from '../types';

type GroupChatProps = {
  groupId: string;
  canSend: boolean;
};

const formatTime = (value: string, language: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SystemNotice: React.FC<{ message: GroupMessage }> = ({ message }) => {
  const { t } = useLanguage();
  const event = String((message.meta_data as Record<string, unknown> | null)?.event ?? '');
  const label =
    event === 'battle_created'
      ? t('groups.battleCreated')
      : event === 'battle_finished'
        ? t('groups.completed')
        : t('groups.battle');

  return (
    <div className="my-3 text-center">
      <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs text-text-secondary">
        {label}
        {message.content ? ` · ${message.content}` : ''}
      </span>
    </div>
  );
};

export const GroupChat: React.FC<GroupChatProps> = ({ groupId, canSend }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [older, setOlder] = useState<GroupMessage[]>([]);
  const [olderHasMore, setOlderHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, isError, refetch } = useGroupMessages(groupId);
  const messages = useMemo(() => data?.messages ?? [], [data?.messages]);
  const allMessages = useMemo(() => [...older, ...messages], [older, messages]);

  const sendMutation = useMutation({
    mutationFn: (value: string) => groupsService.postMessage(groupId, value),
    onSuccess: () => {
      setContent('');
      void queryClient.invalidateQueries({ queryKey: GROUP_QUERY_KEYS.messages(groupId) });
      toast.success(t('groups.sendSuccess'));
    },
    onError: (error) => {
      toast.error(resolveGroupErrorMessage(error, language));
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  useEffect(() => {
    setOlder([]);
    setOlderHasMore(true);
  }, [groupId]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="ml-auto h-12 w-2/3" />
        <Skeleton className="h-12 w-4/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="mb-3 text-sm text-text-secondary">{t('common.retry')}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {t('groups.retry')}
        </button>
      </div>
    );
  }

  const loadOlder = async () => {
    const oldest = allMessages[0]?.created_at;
    if (!oldest || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await groupsService.getMessages(groupId, { before: oldest, limit: 30 });
      setOlder((prev) => [...page.messages, ...prev]);
      if (!page.hasMore || page.messages.length === 0) setOlderHasMore(false);
    } catch (error) {
      toast.error(resolveGroupErrorMessage(error, language));
    } finally {
      setLoadingOlder(false);
    }
  };

  return (
    <div className="flex min-h-[50vh] flex-col">
      <div className="max-h-[55vh] flex-1 space-y-2 overflow-y-auto pr-1">
        {olderHasMore && allMessages.length >= 30 && (
          <div className="pb-2 text-center">
            <button
              type="button"
              onClick={() => void loadOlder()}
              disabled={loadingOlder}
              className="text-xs font-medium text-primary disabled:opacity-50"
            >
              {loadingOlder ? t('common.loading') : t('groups.loadOlder')}
            </button>
          </div>
        )}
        {allMessages.length === 0 ? (
          <EmptyState message={t('groups.noMessages')} />
        ) : (
          allMessages.map((message) => {
            if (message.message_type === 'system_alert') {
              return <SystemNotice key={message.id} message={message} />;
            }

            const isMine = message.sender_id === user?.id;
            const senderName = message.sender?.full_name || message.sender?.username || 'Student';

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 ${
                    isMine
                      ? 'rounded-br-sm bg-primary text-primary-foreground'
                      : 'rounded-bl-sm border border-card-border bg-card-bg text-text-primary'
                  }`}
                >
                  {!isMine && (
                    <p className="mb-0.5 text-[11px] font-semibold opacity-80">{senderName}</p>
                  )}
                  <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${isMine ? 'text-primary-foreground/70' : 'text-text-secondary'}`}
                  >
                    {formatTime(message.created_at, language)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {canSend && (
        <form
          className="mt-3 flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmed = content.trim();
            if (!trimmed || sendMutation.isPending) return;
            sendMutation.mutate(trimmed);
          }}
        >
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 500))}
            maxLength={500}
            rows={1}
            placeholder={t('groups.messagePlaceholder')}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-input-border bg-input-bg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
          <button
            type="submit"
            disabled={!content.trim() || sendMutation.isPending}
            aria-label={t('groups.send')}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      )}
      {canSend && (
        <p className="mt-1 text-right text-[10px] text-text-secondary">{content.length}/500</p>
      )}
    </div>
  );
};

export default GroupChat;
