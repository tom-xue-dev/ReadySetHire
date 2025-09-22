import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import ApplicantForm from "../components/ApplicantForm";
import type { Applicant as FormApplicant } from "../components/ApplicantForm";
import { PencilIcon, TrashIcon, PlusIcon, LinkIcon } from "@heroicons/react/24/solid";
import { useAuth } from "../contexts/AuthContext";
// @ts-ignore JS helper
import { getAllApplicants, createApplicant, updateApplicant, deleteApplicant } from "../api/helper.js";

type Interview = { 
  id: number; 
  title: string;
  job?: {
    id: number;
    title: string;
  };
};

type Applicant = {
  id: number;
  firstname: string;
  surname: string;
  phoneNumber?: string;
  emailAddress: string;
  applicantInterviews?: Array<{
    id: number;
    interviewStatus: string;
    interview: Interview;
  }>;
};

type Row = {
  id: number;
  name: string;
  email: string;
  phone: string;
  interviewTitle: string;
  jobTitle: string;
  status: string;
  interviewId?: number;
};

export default function ApplicantPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Row | null>(null);

  useEffect(() => {
    async function load() {
      console.log("ApplicantPage: Starting load function");
      setLoading(true);
      setError(null);
      try {
        console.log("ApplicantPage: Calling getAllApplicants()");
        const applicants: Applicant[] = await getAllApplicants();
        console.log("ApplicantPage: Received applicants", applicants);
        
        // Flatten applicants with their interview data
        const rows: Row[] = [];
        
        applicants.forEach(applicant => {
          if (applicant.applicantInterviews && applicant.applicantInterviews.length > 0) {
            // If applicant has interviews, create a row for each interview
            applicant.applicantInterviews.forEach(ai => {
              rows.push({
                id: applicant.id,
                name: `${applicant.firstname ?? ''} ${applicant.surname ?? ''}`.trim(),
                email: applicant.emailAddress ?? '',
                phone: applicant.phoneNumber ?? '',
                interviewTitle: ai.interview.title,
                jobTitle: ai.interview.job?.title ?? 'N/A',
                status: ai.interviewStatus,
                interviewId: ai.interview.id,
              });
            });
          } else {
            // If applicant has no interviews, still show them
            rows.push({
              id: applicant.id,
              name: `${applicant.firstname ?? ''} ${applicant.surname ?? ''}`.trim(),
              email: applicant.emailAddress ?? '',
              phone: applicant.phoneNumber ?? '',
              interviewTitle: 'Not Bound',
              jobTitle: 'N/A',
              status: 'Not Bound',
              interviewId: undefined,
            });
          }
        });
        
        console.log("ApplicantPage: Processed rows", rows);
        setRows(rows);
      } catch (e: any) {
        console.error("ApplicantPage: Error occurred", e);
        setError(e?.message ?? 'Load failed');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreate(values: FormApplicant) {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    try {
      // Add ownerId to the applicant data
      const applicantData = {
        ...values,
        owner_id: user.id
      };
      
      await createApplicant(applicantData);
      setCreateOpen(false);
      // Reload data
      window.location.reload(); // Simple reload for now
    } catch (e) {
      alert((e as any)?.message ?? 'Create failed');
    }
  }

  async function handleUpdate(values: FormApplicant) {
    if (!editOpen?.id) return;
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    try {
      // Add ownerId to the applicant data
      const applicantData = {
        ...values,
        owner_id: user.id
      };
      
      await updateApplicant(editOpen.id, applicantData);
      setEditOpen(null);
      // Reload data
      window.location.reload(); // Simple reload for now
    } catch (e) {
      alert((e as any)?.message ?? 'Update failed');
    }
  }

  async function handleDelete(row: Row) {
    if (!confirm(`Delete applicant #${row.id}?`)) return;
    try {
      await deleteApplicant(row.id);
      // Reload data
      window.location.reload(); // Simple reload for now
    } catch (e) {
      alert((e as any)?.message ?? 'Delete failed');
    }
  }

  const columns: Column<Row>[] = useMemo(() => [
    { header: 'ID', accessor: 'id', width: 70 },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email', width: 220 },
    { header: 'Phone', accessor: 'phone', width: 160 },
    { header: 'Interview', accessor: 'interviewTitle' },
    { header: 'Job', accessor: 'jobTitle' },
    { header: 'Status', accessor: 'status', width: 140 },
    {
      header: 'Actions', width: 200,
      render: (row: Row) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditOpen(row)} aria-label="Edit" style={iconBtn}>
            <PencilIcon width={18} height={18} style={{ color: '#2563eb' }} />
          </button>
          <button onClick={() => handleDelete(row)} aria-label="Delete" style={iconBtn}>
            <TrashIcon width={18} height={18} style={{ color: '#ef4444' }} />
          </button>
          {row.interviewId && (
            <button
              onClick={async () => {
                const link = `${window.location.origin}/interviews/${row.interviewId}`;
                try {
                  await navigator.clipboard.writeText(link);
                  alert('Link copied');
                } catch {
                  alert('Link: ' + link);
                }
              }}
              style={iconBtn}
              aria-label="Copy Link"
            >
              <LinkIcon width={18} height={18} style={{ color: '#059669' }} />
            </button>
          )}
        </div>
      )
    }
  ], []);

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>All Applicants</h2>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCreateOpen(true)} style={btnPrimary}>
          <PlusIcon width={18} height={18} style={{ marginRight: 4 }} />
          New Applicant
        </button>
      </div>
      
      {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={rows} rowKey={(r) => r.id} emptyText="No applicants" />
      )}

      <Modal open={createOpen} title="Create Applicant" onClose={() => setCreateOpen(false)}>
        <ApplicantForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editOpen} title={`Edit Applicant #${editOpen?.id ?? ''}`} onClose={() => setEditOpen(null)}>
        {editOpen && (
          <ApplicantForm 
            initial={{
              id: editOpen.id,
              firstname: editOpen.name.split(' ')[0] || '',
              surname: editOpen.name.split(' ').slice(1).join(' ') || '',
              phone_number: editOpen.phone,
              email_address: editOpen.email
            }} 
            onSubmit={handleUpdate} 
            onCancel={() => setEditOpen(null)} 
          />
        )}
      </Modal>
    </section>
  );
}

const iconBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 };
const btnPrimary: React.CSSProperties = { 
  padding: '8px 12px', 
  borderRadius: 6, 
  border: '1px solid #2563eb', 
  background: '#2563eb', 
  color: '#fff', 
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 4
};
