export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  title: string;
  type: string;
  status: JobStatus;
  createdAt: string;
}

export interface CreateJobPayload {
  title: string;
  type: string;
}

export const STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

export const STATUS_FILTERS: Array<JobStatus | 'all'> = [
  'all',
  'pending',
  'running',
  'completed',
  'failed',
];
