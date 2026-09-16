import type { JobStatus } from '../types/job';
import { STATUS_LABELS } from '../types/job';

const STYLES: Record<JobStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  running: 'bg-blue-50 text-blue-700 ring-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
};

const DOT_STYLES: Record<JobStatus, string> = {
  pending: 'bg-amber-500',
  running: 'bg-blue-500 animate-pulse',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
};

export function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
