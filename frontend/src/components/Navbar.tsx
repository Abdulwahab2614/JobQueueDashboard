import { Boxes } from 'lucide-react';

interface NavbarProps {
  apiOnline: boolean;
}

export function Navbar({ apiOnline }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <Boxes className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-slate-900">Job Queue</span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              apiOnline ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          />
          {apiOnline ? 'API connected' : 'API unreachable'}
        </div>
      </div>
    </header>
  );
}
