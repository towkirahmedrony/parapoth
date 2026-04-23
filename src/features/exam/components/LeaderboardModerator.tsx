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
      className={`flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border transition-colors ${
        fraud ? 'bg-secondary border-border-color' : 'bg-surface border-border-color'
      }`}
    >
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="font-bold text-lg w-8 text-text-secondary">
          #{idx + 1}
        </div>
        <div>
          <div className="font-medium flex items-center gap-2 text-text-primary">
            {entry.user_name}
            {fraud && (
              // Replaced missing Badge component with a standard Tailwind span mimicking a Badge
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-badge-bg text-badge-text">
                <ShieldAlert className="h-3 w-3 mr-1" /> Fraud Detected
              </span>
            )}
          </div>
          <div className="text-sm flex gap-3 mt-1 text-text-secondary">
            <span>
              Score:{' '}
              <strong className="text-text-primary">
                {entry.score}/{entry.total_marks}
              </strong>
            </span>
            <span>
              Time:{' '}
              <strong className="text-text-primary">
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
              className="w-full md:w-auto bg-accent text-primary-foreground disabled:opacity-50"
            >
              Zero Marks
            </Button>
            <Button
              disabled={isPending}
              variant="outline"
              onClick={() => onPunish(entry.user_id, 'ban_device')}
              className="w-full md:w-auto border border-border-color text-text-primary hover:bg-surface disabled:opacity-50 bg-transparent"
            >
              <Ban className="h-4 w-4 mr-2" /> Ban Device
            </Button>
          </>
        ) : (
          <Button
            disabled={isPending}
            variant="outline"
            onClick={() => onApprove(entry.user_id)}
            className="w-full md:w-auto border border-border-color text-text-primary hover:bg-surface disabled:opacity-50 bg-transparent"
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
    <Card className="bg-card-bg border-card-border">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 text-text-primary">
          Leaderboard Moderation
        </h3>
        <p className="text-sm text-text-secondary">
          Review and approve results for {examId} before publishing.
        </p>
      </div>
      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="animate-pulse text-text-secondary">
            Loading results...
          </div>
        ) : isError ? (
          <div className="font-medium text-text-secondary">Failed to load leaderboard data. Please try again.</div>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="text-text-secondary">
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
