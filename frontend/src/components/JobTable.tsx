import { RefreshCw, Search } from 'lucide-react';
import type { Job, JobStatus } from '../types/job';
import { STATUS_FILTERS, STATUS_LABELS } from '../types/job';
import { JobRow } from './JobRow';
import { TableRowSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface JobTableProps {
  jobs: Job[];
  isLoading: boolean;
  isRefreshing: boolean;
  pendingIds: Set<string>;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: JobStatus | 'all';
  onStatusFilterChange: (v: JobStatus | 'all') => void;
  onRefresh: () => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onDelete: (job: Job) => void;
  onCreateJob: () => void;
  hasAnyJobs: boolean;
}

export function JobTable({
  jobs,
  isLoading,
  isRefreshing,
  pendingIds,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  onStart,
  onComplete,
  onFail,
  onDelete,
  onCreateJob,
  hasAnyJobs,
}: JobTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Jobs</h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title or type…"
              className="w-full sm:w-56 rounded-lg border border-slate-300 py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as JobStatus | 'all')}
            className="rounded-lg border border-slate-300 py-1.5 px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All statuses' : STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={onRefresh}
            aria-label="Refresh jobs"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">Job</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">Type</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">Created</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
            {!isLoading &&
              jobs.map((job) => (
                <JobRow
                  key={job.id}
                  job={job}
                  isPending={pendingIds.has(job.id)}
                  onStart={onStart}
                  onComplete={onComplete}
                  onFail={onFail}
                  onDelete={onDelete}
                />
              ))}
          </tbody>
        </table>
        {!isLoading && jobs.length === 0 && (
          <EmptyState
            variant={hasAnyJobs ? 'no-matches' : 'no-jobs'}
            onCreateJob={hasAnyJobs ? undefined : onCreateJob}
          />
        )}
      </div>
    </div>
  );
}
