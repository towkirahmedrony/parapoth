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

const getDerivedStatus = (lastUpdatedAt?: string | null): ConnectionStatus => {
  if (!lastUpdatedAt) return 'disconnected';
  
  const lastUpdateMs = new Date(lastUpdatedAt).getTime();
  if (isNaN(lastUpdateMs)) return 'disconnected';

  const diffInSeconds = (Date.now() - lastUpdateMs) / 1000;
  if (diffInSeconds > 120) return 'disconnected';
  
  return 'active';
};

const formatTimeRemaining = (seconds?: number | null): string => {
  const safeSeconds = Math.max(0, seconds || 0);
  const m = Math.floor(safeSeconds / 60);
  const s = Math.floor(safeSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export const LiveExamMonitor: React.FC<Props> = memo(({ examId }) => {
  const { data: progressList, isLoading, isError } = useLiveProgress(examId);
  const { mutate: recoverSession, isPending } = useRecoverUserSession();

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
    <Card className="bg-card-bg border-card-border">
      <div className="flex flex-row items-center justify-between p-6">
        <div>
          <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2 text-text-primary">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-primary"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Live Exam Control Room
          </h3>
          <p className="text-sm mt-1 text-text-secondary">
            Monitoring active sessions for {examId}
          </p>
        </div>
        <Badge className="border border-border-color bg-badge-bg text-badge-text">
          {activeUsersCount} Active Users
        </Badge>
      </div>
      
      <div className="p-6 pt-0">
        {isLoading ? (
          <div className="text-sm text-text-secondary">
            Connecting to progress stream...
          </div>
        ) : isError ? (
          <div className="text-sm text-accent">Failed to connect to progress stream.</div>
        ) : activeUsersCount === 0 ? (
           <div className="text-text-secondary">
             No active sessions found.
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-surface text-text-secondary">
                <tr>
                  <th className="p-3 font-medium border-b border-border-color">
                    Candidate
                  </th>
                  <th className="p-3 font-medium border-b border-border-color">
                    Progress
                  </th>
                  <th className="p-3 font-medium border-b border-border-color">
                    Time Remaining
                  </th>
                  <th className="p-3 font-medium border-b border-border-color">
                    Connection Status
                  </th>
                  <th className="p-3 font-medium border-b border-border-color text-right">
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
                      className="border-b transition-colors hover:bg-surface-elevated border-border-color"
                    >
                      <td className="p-3">
                        <div className="font-medium text-text-primary">
                          {p.user_name || 'Unknown User'}
                        </div>
                        <div className="text-xs text-text-secondary">
                          {p.user_id}
                        </div>
                      </td>
                      <td className="p-3 text-text-primary">
                        Question {p.current_question_index ?? '-'}
                      </td>
                      <td className="p-3 font-mono text-text-primary">
                        {formatTimeRemaining(p.time_remaining)}
                      </td>
                      <td className="p-3">
                        {currentStatus === 'active' ? (
                          <Badge className="border border-border-color bg-badge-bg text-badge-text">
                            <Activity className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        ) : currentStatus === 'disconnected' ? (
                          <Badge className="border border-border-color bg-accent text-primary-foreground">
                            <WifiOff className="h-3 w-3 mr-1" /> Disconnected
                          </Badge>
                        ) : (
                          <Badge className="border border-border-color bg-surface-elevated text-text-primary">
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
                            className={`border border-border-color hover:bg-surface-elevated text-text-primary transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
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

LiveExamMonitor.displayName = 'LiveExamMonitor';
