import { Inbox, SearchX } from 'lucide-react';

interface EmptyStateProps {
  variant: 'no-jobs' | 'no-matches';
  onCreateJob?: () => void;
}

export function EmptyState({ variant, onCreateJob }: EmptyStateProps) {
  if (variant === 'no-matches') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <SearchX className="h-8 w-8 text-slate-300" />
        <p className="text-sm font-medium text-slate-700">No matching jobs</p>
        <p className="text-sm text-slate-500">
          Try changing your search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Inbox className="h-8 w-8 text-slate-300" />
      <p className="text-sm font-medium text-slate-700">No jobs yet</p>
      <p className="text-sm text-slate-500">
        Create your first job to start managing your queue.
      </p>
      {onCreateJob && (
        <button
          onClick={onCreateJob}
          className="mt-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          + Create Job
        </button>
      )}
    </div>
  );
}
