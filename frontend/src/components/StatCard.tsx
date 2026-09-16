import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  helperText: string;
  icon: LucideIcon;
  accentClass: string;
}

export function StatCard({ label, value, helperText, icon: Icon, accentClass }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{helperText}</p>
    </div>
  );
}
