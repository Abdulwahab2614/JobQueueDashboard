import { useCallback, useEffect, useState } from 'react';
import { ApiError, jobsApi } from '../services/jobsApi';
import type { CreateJobPayload, Job, JobStatus } from '../types/job';
import { useToast } from '../components/ToastProvider';

interface UseJobsResult {
  jobs: Job[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createJob: (payload: CreateJobPayload) => Promise<boolean>;
  updateStatus: (id: string, status: JobStatus) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  pendingIds: Set<string>;
}

export function useJobs(): UseJobsResult {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  const load = useCallback(async (isBackgroundRefresh = false) => {
    if (isBackgroundRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await jobsApi.getJobs();
      setJobs(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to load jobs.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  const createJob = useCallback(
    async (payload: CreateJobPayload): Promise<boolean> => {
      try {
        const created = await jobsApi.createJob(payload);
        setJobs((prev) => [created, ...prev]);
        showToast(`"${created.title}" was created.`, 'success');
        return true;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not create job.';
        showToast(message, 'error');
        return false;
      }
    },
    [showToast],
  );

  const markPending = (id: string, isPending: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (isPending) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const updateStatus = useCallback(
    async (id: string, status: JobStatus) => {
      markPending(id, true);
      try {
        const updated = await jobsApi.updateJobStatus(id, status);
        setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
        showToast(`Job moved to "${status}".`, 'success');
      } catch (err) {
        if (err instanceof ApiError && err.isConflict) {
          showToast(err.message, 'error');
          await load(true); // resync with server state
        } else {
          const message = err instanceof ApiError ? err.message : 'Could not update job status.';
          showToast(message, 'error');
        }
      } finally {
        markPending(id, false);
      }
    },
    [load, showToast],
  );

  const deleteJob = useCallback(
    async (id: string) => {
      markPending(id, true);
      try {
        await jobsApi.deleteJob(id);
        setJobs((prev) => prev.filter((j) => j.id !== id));
        showToast('Job deleted.', 'success');
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Could not delete job.';
        showToast(message, 'error');
        if (err instanceof ApiError && err.status === 404) {
          await load(true);
        }
      } finally {
        markPending(id, false);
      }
    },
    [load, showToast],
  );

  return {
    jobs,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createJob,
    updateStatus,
    deleteJob,
    pendingIds,
  };
}
