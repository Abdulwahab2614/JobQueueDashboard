export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
      <div className="mt-3 h-7 w-10 rounded bg-slate-100 animate-pulse" />
      <div className="mt-2 h-3 w-24 rounded bg-slate-100 animate-pulse" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-40 rounded bg-slate-100 animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-16 rounded bg-slate-100 animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-5 w-20 rounded-full bg-slate-100 animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-3.5 w-24 rounded bg-slate-100 animate-pulse" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-7 w-20 rounded bg-slate-100 animate-pulse" />
      </td>
    </tr>
  );
}
