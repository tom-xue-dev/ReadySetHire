import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
// @ts-ignore JS helper
import { getJobs } from "../api/helper.js";
import type { Job, Interview } from "../types";

export default function InterviewForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Interview>;
  onSubmit: (values: Interview) => void;
  onCancel: () => void;
}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const valuesRef = { ...defaultInterview(), ...initial } as Interview;

  function defaultInterview(): Interview {
    return { title: "", jobRole: "", description: "", status: "draft", username: "", jobId: undefined };
  }

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const data = await getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: Interview = {
      id: valuesRef.id,
      title: String(formData.get('title') || ''),
      jobRole: String(formData.get('jobRole') || ''),
      description: String(formData.get('description') || ''),
      status: String(formData.get('status') || 'draft'),
      username: String(formData.get('username') || ''),
      jobId: formData.get('jobId') ? parseInt(String(formData.get('jobId'))) : undefined,
    };
    onSubmit(payload);
  }

  const fieldStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const labelStyle: CSSProperties = { fontSize: 13, color: '#374151' };
  const inputStyle: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="title">Title *</label>
        <input id="title" name="title" defaultValue={valuesRef.title} style={inputStyle} maxLength={255} required />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="jobId">Select Job *</label>
        <select 
          id="jobId" 
          name="jobId" 
          defaultValue={valuesRef.jobId || ''} 
          style={inputStyle} 
          required
        >
          <option value="">Choose a job...</option>
          {loadingJobs ? (
            <option disabled>Loading jobs...</option>
          ) : (
            jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} {job.company ? `(${job.company})` : ''}
              </option>
            ))
          )}
        </select>
        {jobs.length === 0 && !loadingJobs && (
          <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>
            No jobs available. Please create a job first.
          </div>
        )}
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="jobRole">Job Role *</label>
        <input id="jobRole" name="jobRole" defaultValue={valuesRef.jobRole} style={inputStyle} maxLength={255} required />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={valuesRef.description} style={{ ...inputStyle, minHeight: 100 }} maxLength={2000} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="status">Status *</label>
          <select id="status" name="status" defaultValue={valuesRef.status} style={inputStyle} required>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="username">Username *</label>
          <input id="username" name="username" defaultValue={valuesRef.username} style={inputStyle} maxLength={255} required />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}

