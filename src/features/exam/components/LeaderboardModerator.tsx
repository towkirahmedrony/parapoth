import React, { memo, useCallback } from 'react';
import { ShieldAlert, CheckCircle2, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { useModerateLeaderboard, usePunishUser } from '../hooks/useExamLogic';
import { LeaderboardEntry } from '../types/exam';

interface Props {
  examId: string;
}

// Extracted outside to avoid reallocation
const isSuspicious = (score: number, total: number, time_taken: number): boolean => {
  return score === total && time_taken < 60;
};

// Extracted Row Component for rendering stability and preventing unnecessary re-renders
const LeaderboardRow = memo(({ 
  entry, 
  idx, 
  isPending, 
  onPunish, 
  onApprove 
}: {
  entry: LeaderboardEntry;
  idx: number;
  isPending: boolean;
  onPunish: (userId: string, action: 'zero_marks' | 'ban_device') => void;
  onApprove: (userId: string) => void;
}) => {
  const fraud = isSuspicious(entry.score, entry.total_marks, entry.time_taken);

  return (
    <div
      className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border transition-colors"
      style={{
        backgroundColor: fraud
          ? 'color-mix(in srgb, var(--dyn-accent) 5%, transparent)'
          : 'var(--dyn-card)',
        borderColor: fraud
          ? 'var(--dyn-accent)'
          : 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div
          className="font-bold text-lg w-8"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
        >
          #{idx + 1}
        </div>
        <div>
          <div
            className="font-medium flex items-center gap-2"
            style={{ color: 'var(--dyn-text)' }}
          >
            {entry.user_name}
            {fraud && (
              // Replaced missing Badge component with a standard Tailwind span mimicking a Badge
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--dyn-accent)',
                  color: 'var(--dyn-card)'
                }}
              >
                <ShieldAlert className="h-3 w-3 mr-1" /> Fraud Detected
              </span>
            )}
          </div>
          <div
            className="text-sm flex gap-3 mt-1"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
          >
            <span>
              Score:{' '}
              <strong style={{ color: 'var(--dyn-text)' }}>
                {entry.score}/{entry.total_marks}
              </strong>
            </span>
            <span>
              Time:{' '}
              <strong style={{ color: 'var(--dyn-text)' }}>
                {entry.time_taken}s
              </strong>
            </span>
            <span>Device: {entry.device_type}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
        {fraud ? (
          <>
            <Button
              disabled={isPending}
              onClick={() => onPunish(entry.user_id, 'zero_marks')}
              className="w-full md:w-auto"
              style={{
                backgroundColor: 'var(--dyn-accent)',
                color: 'var(--dyn-card)'
              }}
            >
              Zero Marks
            </Button>
            <Button
              disabled={isPending}
              variant="outline"
              onClick={() => onPunish(entry.user_id, 'ban_device')}
              className="w-full md:w-auto border"
              style={{
                backgroundColor: 'transparent',
                borderColor: 'var(--dyn-accent)',
                color: 'var(--dyn-accent)'
              }}
            >
              <Ban className="h-4 w-4 mr-2" /> Ban Device
            </Button>
          </>
        ) : (
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => onApprove(entry.user_id)}
            className="w-full md:w-auto border"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--dyn-primary)',
              color: 'var(--dyn-primary)'
            }}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
          </Button>
        )}
      </div>
    </div>
  );
});
LeaderboardRow.displayName = 'LeaderboardRow';

export const LeaderboardModerator: React.FC<Props> = memo(({ examId }) => {
  const { data: leaderboard, isLoading, isError } = useModerateLeaderboard(examId);
  // Applied the fix: Added examId here
  const { mutate: punishUser, isPending } = usePunishUser(examId);

  // Memoized handlers to prevent child row re-renders
  const handlePunish = useCallback((userId: string, action: 'zero_marks' | 'ban_device') => {
    punishUser({ userId, action }, {
      onSuccess: () => {
        toast.success(`Action "${action}" applied successfully.`);
      },
      onError: () => {
        toast.error('Failed to apply moderation action.');
      }
    });
  }, [punishUser]);

  const handleApprove = useCallback((userId: string) => {
    // Implementing a placeholder action for Approve since it lacked an onClick previously
    toast.success(`User ${userId} approved!`);
  }, []);

  return (
    <Card
      style={{
        backgroundColor: 'var(--dyn-card)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <h3
          className="font-semibold leading-none tracking-tight flex items-center gap-2"
          style={{ color: 'var(--dyn-text)' }}
        >
          Leaderboard Moderation
        </h3>
        <p
          className="text-sm text-muted-foreground"
          style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
        >
          Review and approve results for {examId} before publishing.
        </p>
      </div>
      <div className="p-6 pt-0">
        {isLoading ? (
          <div style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }} className="animate-pulse">
            Loading results...
          </div>
        ) : isError ? (
          <div className="text-red-500 font-medium">Failed to load leaderboard data. Please try again.</div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
            No entries to moderate.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry: LeaderboardEntry, idx: number) => (
              <LeaderboardRow
                key={entry.user_id || idx} // Fallback to idx if user_id is somehow missing
                entry={entry}
                idx={idx}
                isPending={isPending}
                onPunish={handlePunish}
                onApprove={handleApprove}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
});
LeaderboardModerator.displayName = 'LeaderboardModerator';
