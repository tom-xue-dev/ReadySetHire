import { useEffect, useMemo, useState } from 'react'; 
import { SimpleConnectionIndicator, SimpleConnectionGuard } from '../components/SimpleConnectionStatus';
import JobForm from '../components/JobForm';
import type { Job } from '../types';
import Modal from '../components/Modal';
// @ts-ignore JS helper
import { getJobs, createJob, updateJob, deleteJob } from '../api/helper.js';

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'CLOSED'>('ALL');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(jobData: Job) {
    setFormError(null);
    try {
      if (editingJob?.id) {
        await updateJob(editingJob.id, jobData);
      } else {
        await createJob(jobData);
      }
      setShowForm(false);
      setEditingJob(null);
      await load(); // Reload the list
    } catch (err: any) {
      setFormError(err?.message ?? 'Failed to save job');
    }
  }

  async function handleDelete(jobId: number) {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }
    
    try {
      await deleteJob(jobId);
      await load(); // Reload the list
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete job');
    }
  }

  function handleEdit(job: Job) {
    setEditingJob(job);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingJob(null);
    setFormError(null);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return '#10b981';
      case 'DRAFT': return '#f59e0b';
      case 'ARCHIVED': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return '#dcfce7';
      case 'DRAFT': return '#fef3c7';
      case 'ARCHIVED': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return jobs.filter(j => {
      const byText = !ql || `${j.title} ${j.description ?? ''} ${j.location ?? ''}`.toLowerCase().includes(ql);
      const byStatus = status === 'ALL' || (j.status as any) === status;
      return byText && byStatus;
    });
  }, [jobs, q, status]);

  return (
    <SimpleConnectionGuard>
      <div className="min-h-screen bg-zinc-50">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-zinc-900">Jobs</h1>
              <SimpleConnectionIndicator />
            </div>
            <div className="flex-1" />
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl shadow hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
            >
              New Job
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-zinc-600 mb-2">Filters</div>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search title, description, location…"
                    className="w-full pl-3 pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:ring"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Status</div>
                  <div className="flex flex-wrap gap-2">
                    {(['ALL','PUBLISHED','DRAFT','ARCHIVED','CLOSED'] as const).map(s => (
                      <button key={s} onClick={() => setStatus(s)} className={`px-2 py-1 rounded-full border text-xs transition ${status===s? 'bg-black text-white border-black':'bg-white hover:bg-zinc-50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <button onClick={() => { setQ(''); setStatus('ALL'); }} className="px-3 py-2 rounded-xl border text-sm">Reset</button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="text-sm text-zinc-600 mb-2">Totals</div>
              <div className="text-sm grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-zinc-50 border">
                  <div className="text-xs text-zinc-500">Published</div>
                  <div className="text-lg font-semibold">{jobs.filter(j => (j.status as any) === 'PUBLISHED').length}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border">
                  <div className="text-xs text-zinc-500">Draft</div>
                  <div className="text-lg font-semibold">{jobs.filter(j => (j.status as any) === 'DRAFT').length}</div>
                </div>
              </div>
            </div>
          </aside>

          <section className="col-span-12 md:col-span-9">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-3">Error: {error}</div>
            )}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-white text-sm text-zinc-500">{filtered.length} result(s)</div>
              <div className="p-4 grid gap-4 md:grid-cols-2">
                {loading ? (
                  <div className="text-sm text-zinc-500 p-4">Loading jobs…</div>
                ) : filtered.length === 0 ? (
                  <div className="text-sm text-zinc-500 p-4">No jobs</div>
                ) : (
                  filtered.map((job) => (
                    <div key={job.id} className="border rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-zinc-900">{job.title}</h3>
                        <span className="px-2 py-0.5 rounded-full text-xs border">{job.status as any}</span>
                      </div>
                      {job.location && <div className="text-sm text-zinc-600 mb-1">📍 {job.location}</div>}
                      {job.salary && <div className="text-sm text-zinc-600 mb-2">💰 {job.salary}</div>}
                      {job.description && (
                        <p className="text-sm text-zinc-700 line-clamp-3 mb-3">{job.description}</p>
                      )}
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(job)} className="px-2 py-1.5 rounded-lg border hover:bg-zinc-50">Edit</button>
                        <button onClick={() => handleDelete(job.id!)} className="px-2 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-300">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>

        {showForm && (
          <Modal open={showForm} onClose={handleCancel}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              {formError && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>
                  {formError}
                </div>
              )}
              <JobForm initial={editingJob || undefined} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          </Modal>
        )}
      </div>
    </SimpleConnectionGuard>
  );
}
