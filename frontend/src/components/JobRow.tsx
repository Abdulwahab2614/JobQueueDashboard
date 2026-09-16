import { Loader2, Play, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import type { Job } from '../types/job';
import { StatusBadge } from './StatusBadge';
import { relativeTime, fullTimestamp } from '../utils/date';

interface JobRowProps {
  job: Job;
  isPending: boolean;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onDelete: (job: Job) => void;
}

export function JobRow({ job, isPending, onStart, onComplete, onFail, onDelete }: JobRowProps) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3.5">
        <span className="text-sm font-medium text-slate-900">{job.title}</span>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-500">{job.type}</span>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={job.status} />
      </td>
      <td className="px-4 py-3.5">
        <span className="text-sm text-slate-500" title={fullTimestamp(job.createdAt)}>
          {relativeTime(job.createdAt)}
        </span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          {isPending ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            </span>
          ) : (
            <>
              {job.status === 'pending' && (
                <button
                  onClick={() => onStart(job.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Play className="h-3 w-3" /> Start
                </button>
              )}
              {job.status === 'running' && (
                <>
                  <button
                    onClick={() => onComplete(job.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <CheckCircle className="h-3 w-3" /> Complete
                  </button>
                  <button
                    onClick={() => onFail(job.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="h-3 w-3" /> Fail
                  </button>
                </>
              )}
              <button
                onClick={() => onDelete(job)}
                aria-label={`Delete ${job.title}`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
