import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, X } from 'lucide-react';
import type { CreateJobPayload } from '../types/job';

interface CreateJobModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateJobPayload) => Promise<boolean>;
}

interface FormErrors {
  title?: string;
  type?: string;
}

function validate(title: string, type: string): FormErrors {
  const errors: FormErrors = {};
  if (!title.trim()) errors.title = 'Job title is required.';
  else if (title.trim().length < 3) errors.title = 'Title must be at least 3 characters.';

  if (!type.trim()) errors.type = 'Job type is required.';
  else if (type.trim().length < 2) errors.type = 'Type must be at least 2 characters.';

  return errors;
}

export function CreateJobModal({ open, onClose, onSubmit }: CreateJobModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setType('');
      setErrors({});
      setIsSubmitting(false);
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, isSubmitting, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // prevent duplicate submissions

    const validation = validate(title, type);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setIsSubmitting(true);
    const success = await onSubmit({ title: title.trim(), type: type.trim() });
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-[fade-in_0.15s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-job-title"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 sm:p-6 shadow-xl animate-[modal-in_0.15s_ease-out]">
        <div className="flex items-start justify-between">
          <h2 id="create-job-title" className="text-base font-semibold text-slate-900">
            Create New Job
          </h2>
          <button
            onClick={() => !isSubmitting && onClose()}
            aria-label="Close dialog"
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <div>
            <label htmlFor="job-title" className="block text-sm font-medium text-slate-700">
              Job title
            </label>
            <input
              ref={titleRef}
              id="job-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Generate Monthly Report"
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
                errors.title ? 'border-red-300' : 'border-slate-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="job-type" className="block text-sm font-medium text-slate-700">
              Job type
            </label>
            <input
              id="job-type"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="report, email, export…"
              className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
                errors.type ? 'border-red-300' : 'border-slate-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
          </div>

          <div className="mt-2 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => !isSubmitting && onClose()}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isSubmitting ? 'Creating…' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
