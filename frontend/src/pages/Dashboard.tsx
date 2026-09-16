import { useMemo, useState } from 'react';
import { ListChecks, Clock, Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { Navbar } from '../components/Navbar';
import { StatCard } from '../components/StatCard';
import { StatCardSkeleton } from '../components/LoadingSkeleton';
import { JobTable } from '../components/JobTable';
import { CreateJobModal } from '../components/CreateJobModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorState } from '../components/ErrorState';
import type { Job, JobStatus } from '../types/job';

export function Dashboard() {
  const {
    jobs,
    isLoading,
    isRefreshing,
    error,
    refresh,
    createJob,
    updateStatus,
    deleteJob,
    pendingIds,
  } = useJobs();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const counts = useMemo(() => {
    const base = { total: jobs.length, pending: 0, running: 0, completed: 0, failed: 0 };
    for (const job of jobs) base[job.status] += 1;
    return base;
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesSearch =
        !q || job.title.toLowerCase().includes(q) || job.type.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [jobs, search, statusFilter]);

  const isDeleting = jobToDelete ? pendingIds.has(jobToDelete.id) : false;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar apiOnline={!error} />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
              Job Queue Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor, manage, and track background jobs.
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Create Job
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Jobs"
                value={counts.total}
                helperText="All queued jobs"
                icon={ListChecks}
                accentClass="bg-indigo-50 text-indigo-600"
              />
              <StatCard
                label="Pending"
                value={counts.pending}
                helperText="Waiting to run"
                icon={Clock}
                accentClass="bg-amber-50 text-amber-600"
              />
              <StatCard
                label="Running"
                value={counts.running}
                helperText="Currently processing"
                icon={Loader2}
                accentClass="bg-blue-50 text-blue-600"
              />
              <StatCard
                label="Completed"
                value={counts.completed}
                helperText="Successfully finished"
                icon={CheckCircle2}
                accentClass="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                label="Failed"
                value={counts.failed}
                helperText="Requires attention"
                icon={AlertCircle}
                accentClass="bg-red-50 text-red-600"
              />
            </>
          )}
        </div>

        <div className="mt-6">
          {error && !isLoading && jobs.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <ErrorState message={error} onRetry={refresh} />
            </div>
          ) : (
            <JobTable
              jobs={filteredJobs}
              isLoading={isLoading}
              isRefreshing={isRefreshing}
              pendingIds={pendingIds}
              search={search}
              onSearchChange={setSearch}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onRefresh={refresh}
              onStart={(id) => updateStatus(id, 'running')}
              onComplete={(id) => updateStatus(id, 'completed')}
              onFail={(id) => updateStatus(id, 'failed')}
              onDelete={setJobToDelete}
              onCreateJob={() => setIsCreateOpen(true)}
              hasAnyJobs={jobs.length > 0}
            />
          )}
        </div>
      </main>

      <CreateJobModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createJob}
      />

      <ConfirmDialog
        open={!!jobToDelete}
        title="Delete this job?"
        description="This action cannot be undone."
        isConfirming={isDeleting}
        onConfirm={async () => {
          if (!jobToDelete) return;
          await deleteJob(jobToDelete.id);
          setJobToDelete(null);
        }}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
}
