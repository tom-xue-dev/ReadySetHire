import { useEffect, useState } from 'react';
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

  return (
    <SimpleConnectionGuard>
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
              Job Postings
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <SimpleConnectionIndicator />
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                + Add Job
              </button>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>
            Manage your job postings and requirements.
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            Error: {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💼</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1f2937' }}>
              No jobs yet
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Create your first job posting to get started
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '20px'
          }}>
            {jobs.map((job) => (
              <div key={job.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.2s'
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937', flex: 1 }}>
                    {job.title}
                  </h3>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: getStatusBg(job.status),
                    color: getStatusColor(job.status),
                    marginLeft: '12px'
                  }}>
                    {job.status}
                  </span>
                </div>

                {/* Company and Department */}
                {(job.company || job.department) && (
                  <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {job.company && <span>{job.company}</span>}
                    {job.company && job.department && <span> • </span>}
                    {job.department && <span>{job.department}</span>}
                  </div>
                )}

                {/* Location and Salary */}
                {(job.location || job.salary) && (
                  <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
                    {job.location && <div>📍 {job.location}</div>}
                    {job.salary && <div>💰 {job.salary}</div>}
                  </div>
                )}

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#374151',
                    lineHeight: '1.5',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>
                </div>

                {/* Requirements */}
                {job.requirements && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ 
                      margin: '0 0 4px 0', 
                      fontSize: '12px', 
                      fontWeight: '500',
                      color: '#6b7280',
                      textTransform: 'uppercase'
                    }}>
                      Requirements
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '13px', 
                      color: '#374151',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job.requirements}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => handleEdit(job)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id!)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Job Form Modal */}
        {showForm && (
          <Modal open={showForm} onClose={handleCancel}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              
              {formError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {formError}
                </div>
              )}

              <JobForm
                initial={editingJob || undefined}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </Modal>
        )}
      </div>
    </SimpleConnectionGuard>
  );
}
