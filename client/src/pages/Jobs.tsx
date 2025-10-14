import { useEffect, useMemo, useState } from 'react'; 
import { SimpleConnectionIndicator, SimpleConnectionGuard } from '../components/SimpleConnectionStatus';
import PageShell from '../components/PageShell';
import JobForm from '../components/JobForm';
import type { Job } from '../types';
import Modal from '../components/Modal';
import { Drawer } from '../components/ui/Cards.tsx';
// @ts-ignore JS helper
import { getJobs, createJob, updateJob, deleteJob, publishJob } from '../api/helper.js';

export default function Jobs() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'CLOSED'>('ALL');
  const [detailsJob, setDetailsJob] = useState<Job | null>(null);
  const [shareJob, setShareJob] = useState<Job | null>(null);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

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

  async function handlePublish(job: Job) {
    try {
      if ((job.status as any) !== 'PUBLISHED' && job.id) {
        await publishJob(job.id);
        await load();
      }
      setShareJob(job);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to publish job');
    }
  }

  function getPublicLinks(jobId: number) {
    const origin = window.location.origin;
    return {
      details: `${origin}/jobs/${jobId}`,
      apply: `${origin}/jobs/${jobId}/apply`
    };
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMsg('Link copied');
      setTimeout(() => setCopyMsg(null), 1500);
    } catch (_e) {
      setCopyMsg('Copy failed');
      setTimeout(() => setCopyMsg(null), 1500);
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

  // status color helpers not used in current UI

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
      <PageShell
        title={<div className="flex items-center gap-2">Jobs <SimpleConnectionIndicator /></div>}
        right={(
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-xl shadow hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
          >
            New Job
          </button>
        )}
      >
        <main className="p-4 grid grid-cols-12 gap-4">
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
                    <div key={job.id} className="border rounded-2xl p-4 cursor-pointer hover:shadow-sm" onClick={() => setDetailsJob(job)}>
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
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePublish(job); }}
                          className={`px-2 py-1.5 rounded-lg border text-white ${ (job.status as any) === 'PUBLISHED' ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600'}`}
                          title={(job.status as any) === 'PUBLISHED' ? 'Share public link' : 'Publish and share'}
                        >
                          {(job.status as any) === 'PUBLISHED' ? 'Share' : 'Publish'}
                        </button>
                        {(job.status as any) === 'PUBLISHED' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`/jobs/${job.id}`, '_blank'); }}
                            className="px-2 py-1.5 rounded-lg border hover:bg-zinc-50"
                          >
                            View
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(job); }} className="px-2 py-1.5 rounded-lg border hover:bg-zinc-50">Edit</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(job.id!); }} className="px-2 py-1.5 rounded-lg border hover:bg-red-50 text-red-600 border-red-300">Delete</button>
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

        <Drawer
          open={!!detailsJob}
          title={detailsJob?.title ?? ''}
          onClose={() => setDetailsJob(null)}
          footer={detailsJob ? (
            <>
              <button onClick={() => { setDetailsJob(null); handleEdit(detailsJob); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">Edit</button>
              <button onClick={() => { if (detailsJob?.id) handlePublish(detailsJob); }} className="rounded-lg border px-3 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700">{(detailsJob.status as any) === 'PUBLISHED' ? 'Share' : 'Publish'}</button>
              {(detailsJob?.status as any) === 'PUBLISHED' && (
                <button onClick={() => { if (detailsJob?.id) window.open(`/jobs/${detailsJob.id}`, '_blank'); }} className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">View</button>
              )}
              {detailsJob?.id && (
                <button onClick={() => { const id = detailsJob.id!; setDetailsJob(null); handleDelete(id); }} className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50">Delete</button>
              )}
            </>
          ) : undefined}
        >
          {detailsJob && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 flex flex-wrap items-center gap-3">
                {detailsJob.location && <span>📍 {detailsJob.location}</span>}
                {detailsJob.salary && <span>💰 {detailsJob.salary}</span>}
                {detailsJob.status && <span className="ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs">{detailsJob.status as any}</span>}
              </div>

              {detailsJob.description && (
                <section className="rounded-xl border p-4">
                  <h3 className="font-medium mb-1">Job Description</h3>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{detailsJob.description}</p>
                </section>
              )}

              {detailsJob.requirements && (
                <section className="rounded-xl border p-4">
                  <h3 className="font-medium mb-1">Requirements</h3>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{detailsJob.requirements}</p>
                </section>
              )}

              {(detailsJob.company || detailsJob.department) && (
                <section className="rounded-xl border p-4">
                  <h3 className="font-medium mb-1">Company</h3>
                  <div className="text-sm text-gray-800">{detailsJob.company ?? '—'} {detailsJob.department ? `· ${detailsJob.department}` : ''}</div>
                </section>
              )}
            </div>
          )}
        </Drawer>

        {shareJob && shareJob.id && (
          <Modal open={!!shareJob} onClose={() => setShareJob(null)}>
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Share your job</h3>
              <p style={{ margin: '8px 0 16px 0', color: '#4b5563', fontSize: '14px' }}>Send candidates a public link to view details or apply.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="text-sm text-zinc-500 w-24">Details</div>
                  <input readOnly value={getPublicLinks(shareJob.id).details} className="flex-1 px-3 py-2 rounded-lg border bg-zinc-50" />
                  <button onClick={() => copyToClipboard(getPublicLinks(shareJob.id!).details)} className="px-3 py-2 rounded-lg border text-sm hover:bg-zinc-50">Copy</button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-zinc-500 w-24">Apply</div>
                  <input readOnly value={getPublicLinks(shareJob.id).apply} className="flex-1 px-3 py-2 rounded-lg border bg-zinc-50" />
                  <button onClick={() => copyToClipboard(getPublicLinks(shareJob.id!).apply)} className="px-3 py-2 rounded-lg border text-sm hover:bg-zinc-50">Copy</button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-emerald-600 h-5">{copyMsg || ''}</div>
                <div className="flex gap-2">
                  <button onClick={() => { window.open(getPublicLinks(shareJob.id!).details, '_blank'); }} className="px-3 py-2 rounded-lg border text-sm hover:bg-zinc-50">Open details</button>
                  <button onClick={() => { window.open(getPublicLinks(shareJob.id!).apply, '_blank'); }} className="px-3 py-2 rounded-lg border text-sm hover:bg-zinc-50">Open apply</button>
                  <button onClick={() => setShareJob(null)} className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Done</button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </PageShell>
    </SimpleConnectionGuard>
  );
}
