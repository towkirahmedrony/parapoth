import React from 'react';
import { ShieldAlert, CheckCircle2, Ban } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
// Assuming the hooks are actually in hooks/useExamLogic or similar based on standard architecture
// Falling back to exact relative path provided in original code but typed correctly
import { useModerateLeaderboard, usePunishUser } from '../api/useExamEngine';
import { LeaderboardEntry } from '../types/exam';

interface Props {
  examId: string;
}

// Pure function extracted outside component to avoid reallocation
const isSuspicious = (score: number, total: number, time_taken: number): boolean => {
  return score === total && time_taken < 60;
};

export const LeaderboardModerator: React.FC<Props> = ({ examId }) => {
  const { data: leaderboard, isLoading, isError } = useModerateLeaderboard(examId);
  const { mutate: punishUser, isPending } = usePunishUser();

  return (
    <Card
      style={{
        backgroundColor: 'var(--dyn-card)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      {/* Assuming standard shadcn-like sub-components are exported from Card or used standard HTML tags as fallback */}
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
          <div style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
            Loading results...
          </div>
        ) : isError ? (
          <div className="text-red-500">Failed to load leaderboard data.</div>
        ) : leaderboard?.length === 0 ? (
          <div style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
            No entries to moderate.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard?.map((entry: LeaderboardEntry, idx: number) => {
              const fraud = isSuspicious(entry.score, entry.total_marks, entry.time_taken);
              return (
                <div
                  key={entry.id}
                  className="flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border"
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
                          <Badge
                            style={{
                              backgroundColor: 'var(--dyn-accent)',
                              color: 'var(--dyn-card)'
                            }}
                          >
                            <ShieldAlert className="h-3 w-3 mr-1" /> Fraud Detected
                          </Badge>
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
                          onClick={() => punishUser({ userId: entry.user_id, action: 'zero_marks' })}
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
                          onClick={() => punishUser({ userId: entry.user_id, action: 'ban_device' })}
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
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
