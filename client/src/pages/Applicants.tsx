import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import ApplicantForm from "../components/ApplicantForm";
import type { Applicant as FormApplicant } from "../components/ApplicantForm";
import { PencilIcon, TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { SimpleConnectionIndicator, SimpleConnectionGuard } from "../components/SimpleConnectionStatus";
// @ts-ignore JS helper
import { getApplicantsByInterview, createApplicant, updateApplicant, deleteApplicant } from "../api/helper.js";

type Applicant = Required<FormApplicant> & { id: number };

export default function Applicants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const interviewId = Number(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Applicant[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Applicant | null>(null);

  async function load() {
    if (!interviewId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getApplicantsByInterview(interviewId);
      setItems(Array.isArray(data) ? (data as Applicant[]) : []);
    } catch (e: any) {
      setError(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [interviewId]);

  const columns: Column<Applicant>[] = useMemo(() => [
    { header: "ID", accessor: "id", width: 70 },
    { header: "Title", accessor: "title", width: 90 },
    { header: "First Name", accessor: "firstname" },
    { header: "Surname", accessor: "surname" },
    { header: "Phone", accessor: "phone_number", width: 160 },
    { header: "Email", accessor: "email_address", width: 220 },
    { header: "Status", accessor: "interview_status", width: 140 },
    { header: "Owner", accessor: "username", width: 140 },
    {
      header: "Actions", width: 120,
      render: (row: Applicant) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditOpen(row)} aria-label="Edit" style={iconBtn}>
            <PencilIcon width={18} height={18} style={{ color: '#2563eb' }} />
          </button>
          <button onClick={() => handleDelete(row)} aria-label="Delete" style={iconBtn}>
            <TrashIcon width={18} height={18} style={{ color: '#ef4444' }} />
          </button>
        </div>
      )
    }
  ], []);

  async function handleCreate(values: FormApplicant) {
    try {
      const payload = { ...values, interview_id: interviewId } as FormApplicant;
      await createApplicant(payload);
      setCreateOpen(false);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Create failed');
    }
  }

  async function handleUpdate(values: FormApplicant) {
    if (!editOpen?.id) return;
    try {
      const payload = { ...values, interview_id: interviewId } as FormApplicant;
      await updateApplicant(editOpen.id, payload);
      setEditOpen(null);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Update failed');
    }
  }

  async function handleDelete(row: Applicant) {
    if (!confirm(`Delete applicant #${row.id}?`)) return;
    try {
      await deleteApplicant(row.id);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Delete failed');
    }
  }

  return (
    <SimpleConnectionGuard>
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <button onClick={() => navigate('/interviews')} aria-label="Back" style={iconBtn}>
            <ArrowUturnLeftIcon width={18} height={18} />
          </button>
          <h2 style={{ margin: 0 }}>Applicants for Interview #{interviewId || '-'}</h2>
          <SimpleConnectionIndicator />
          <div style={{ flex: 1 }} />
          <button onClick={() => setCreateOpen(true)} style={btnPrimary}>New Applicant</button>
        </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={items} rowKey={(r) => r.id} emptyText="No applicants" />
      )}

      <Modal open={createOpen} title="Create Applicant" onClose={() => setCreateOpen(false)}>
        <ApplicantForm interviewId={interviewId} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editOpen} title={`Edit Applicant #${editOpen?.id ?? ''}`} onClose={() => setEditOpen(null)}>
        {editOpen && (
          <ApplicantForm interviewId={interviewId} initial={editOpen} onSubmit={handleUpdate} onCancel={() => setEditOpen(null)} />
        )}
      </Modal>
      </section>
    </SimpleConnectionGuard>
  );
}

const iconBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 };
const btnPrimary: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' };
