import React, { memo } from 'react';
import { Activity, RefreshCcw, WifiOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { Badge } from '@/shared/components/ui/Badge';
import { useLiveProgress, useRecoverUserSession } from '../hooks/useExamData';
import type { ProgressEntry } from '../types/exam';

interface Props {
  examId: string;
}

type ConnectionStatus = 'active' | 'disconnected' | 'submitted';

// Pure function extracted outside with safe null handling
const getDerivedStatus = (lastUpdatedAt?: string | null): ConnectionStatus => {
  if (!lastUpdatedAt) return 'disconnected';
  
  const lastUpdateMs = new Date(lastUpdatedAt).getTime();
  if (isNaN(lastUpdateMs)) return 'disconnected';

  const diffInSeconds = (Date.now() - lastUpdateMs) / 1000;
  if (diffInSeconds > 120) return 'disconnected';
  
  return 'active';
};

// Extracted formatting logic for cleaner JSX
const formatTimeRemaining = (seconds?: number | null): string => {
  const safeSeconds = Math.max(0, seconds || 0);
  const m = Math.floor(safeSeconds / 60);
  const s = Math.floor(safeSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const LiveExamMonitor: React.FC<Props> = memo(({ examId }) => {
  const { data: progressList, isLoading, isError } = useLiveProgress(examId);
  const { mutate: recoverSession, isPending } = useRecoverUserSession();

  // Removed unnecessary useMemo for simple array length check
  const activeUsersCount = progressList?.length || 0;

  const handleRecoverSession = (userId: string) => {
    recoverSession(userId, {
      onSuccess: () => {
        toast.success('Session recovered successfully');
      },
      onError: () => {
        toast.error('Failed to recover session');
      }
    });
  };

  return (
    <Card
      style={{
        backgroundColor: 'var(--dyn-card)',
        borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)'
      }}
    >
      <div className="flex flex-row items-center justify-between p-6">
        <div>
          <h3
            className="font-semibold leading-none tracking-tight flex items-center gap-2"
            style={{ color: 'var(--dyn-text)' }}
          >
            <span className="relative flex h-3 w-3">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: 'var(--dyn-primary)' }}
              ></span>
              <span
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: 'var(--dyn-primary)' }}
              ></span>
            </span>
            Live Exam Control Room
          </h3>
          <p
            className="text-sm text-muted-foreground mt-1"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
          >
            Monitoring active sessions for {examId}
          </p>
        </div>
        <Badge
          className="border"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)',
            color: 'var(--dyn-primary)',
            borderColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)'
          }}
        >
          {activeUsersCount} Active Users
        </Badge>
      </div>
      
      <div className="p-6 pt-0">
        {isLoading ? (
          <div
            className="text-sm"
            style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
          >
            Connecting to progress stream...
          </div>
        ) : isError ? (
          <div className="text-red-500 text-sm">Failed to connect to progress stream.</div>
        ) : activeUsersCount === 0 ? (
           <div style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}>
             No active sessions found.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--dyn-text) 5%, transparent)',
                  color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)'
                }}
              >
                <tr>
                  <th
                    className="p-3 font-medium border-b"
                    style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                  >
                    Candidate
                  </th>
                  <th
                    className="p-3 font-medium border-b"
                    style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                  >
                    Progress
                  </th>
                  <th
                    className="p-3 font-medium border-b"
                    style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                  >
                    Time Remaining
                  </th>
                  <th
                    className="p-3 font-medium border-b"
                    style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                  >
                    Connection Status
                  </th>
                  <th
                    className="p-3 font-medium border-b text-right"
                    style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {progressList?.map((p: ProgressEntry) => {
                  const currentStatus = getDerivedStatus(p.last_updated_at);
                  
                  return (
                    <tr
                      key={p.id}
                      className="border-b transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)' }}
                    >
                      <td className="p-3">
                        <div className="font-medium" style={{ color: 'var(--dyn-text)' }}>
                          {p.user_name || 'Unknown User'}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: 'color-mix(in srgb, var(--dyn-text) 70%, transparent)' }}
                        >
                          {p.user_id}
                        </div>
                      </td>
                      <td className="p-3" style={{ color: 'var(--dyn-text)' }}>
                        Question {p.current_question_index ?? '-'}
                      </td>
                      <td className="p-3 font-mono" style={{ color: 'var(--dyn-text)' }}>
                        {formatTimeRemaining(p.time_remaining)}
                      </td>
                      <td className="p-3">
                        {currentStatus === 'active' ? (
                          <Badge
                            className="border"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--dyn-primary) 10%, transparent)',
                              color: 'var(--dyn-primary)',
                              borderColor: 'color-mix(in srgb, var(--dyn-primary) 20%, transparent)'
                            }}
                          >
                            <Activity className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        ) : currentStatus === 'disconnected' ? (
                          <Badge
                            className="border"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--dyn-accent) 10%, transparent)',
                              color: 'var(--dyn-accent)',
                              borderColor: 'color-mix(in srgb, var(--dyn-accent) 20%, transparent)'
                            }}
                          >
                            <WifiOff className="h-3 w-3 mr-1" /> Disconnected
                          </Badge>
                        ) : (
                          <Badge
                            className="border"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--dyn-text) 10%, transparent)',
                              color: 'var(--dyn-text)',
                              borderColor: 'color-mix(in srgb, var(--dyn-text) 20%, transparent)'
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" /> Submitted
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {currentStatus === 'disconnected' && (
                          <Button
                            disabled={isPending}
                            variant="outline"
                            onClick={() => handleRecoverSession(p.id)}
                            className={`border hover:opacity-80 transition-opacity ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: 'var(--dyn-primary)',
                              color: 'var(--dyn-primary)'
                            }}
                          >
                            <RefreshCcw className={`h-3 w-3 mr-2 ${isPending ? 'animate-spin' : ''}`} /> 
                            {isPending ? 'Recovering...' : 'Recover'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Card>
  );
});

// For debug tools
LiveExamMonitor.displayName = 'LiveExamMonitor';
