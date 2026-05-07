import { useQuery } from '@tanstack/react-query';
import { atelierApi } from '@/features/atelier/api/atelierApi';
import type { TaskStatus } from '@/features/atelier/types/atelier.types';

const DONE_STATUSES = new Set(['SUCCEEDED', 'FAILED']);

export const useTaskStatus = (taskId: string | null, taskType: 'text' | 'refine' | 'image') => {
  return useQuery<TaskStatus>({
    queryKey: ['atelier-task', taskId, taskType],
    queryFn: () => atelierApi.getStatus(taskId!, taskType),
    enabled: !!taskId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && DONE_STATUSES.has(status) ? false : 3000;
    },
  });
};
