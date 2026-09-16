import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </span>
      <p className="text-sm font-medium text-slate-800">Unable to load jobs</p>
      <p className="max-w-sm text-sm text-slate-500">
        {message || 'Something went wrong while fetching your jobs.'}
      </p>
      <button
        onClick={onRetry}
        className="mt-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
