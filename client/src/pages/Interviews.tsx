import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import InterviewForm from "../components/InterviewForm";
import type { Interview as FormInterview } from "../types";
import { TrashIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { SimpleConnectionIndicator, SimpleConnectionGuard } from "../components/SimpleConnectionStatus";


// Use helper.js API functions (JS module without types)
// @ts-ignore
import { getInterviews, createInterview, updateInterview, deleteInterview, getQuestions, getApplicantsByInterview } from "../api/helper.js";

type Interview = Required<FormInterview> & { id: number };
type Counts = Record<number, { questions: number; applicants: number; completed: number; notStarted: number }>;

function Interviews() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Interview[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Interview | null>(null);
  const [counts, setCounts] = useState<Counts>({});

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getInterviews();
      setItems(Array.isArray(data) ? (data as Interview[]) : []);
      // fetch counts per interview
      const list: Interview[] = Array.isArray(data) ? (data as Interview[]) : [];
      const entries = await Promise.all(
        list.map(async (iv) => {
          try {
            const [qs, apps] = await Promise.all([
              getQuestions(iv.id),
              getApplicantsByInterview(iv.id),
            ]);
            const qCount = Array.isArray(qs) ? qs.length : 0;
            const aList = Array.isArray(apps) ? apps : [];
            const total = aList.length;
            const completed = aList.filter((a: any) => (a.status ?? a.interview_status ?? a.state) === 'Completed').length;
            const notStarted = aList.filter((a: any) => (a.status ?? a.interview_status ?? a.state) === 'Not Started').length;
            return [iv.id, { questions: qCount, applicants: total, completed, notStarted }] as const;
          } catch {
            return [iv.id, { questions: 0, applicants: 0, completed: 0, notStarted: 0 }] as const;
          }
        })
      );
      const map: Counts = {};
      entries.forEach(([id, val]) => { map[id] = val; });
      setCounts(map);
    } catch (e: any) {
      setError(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const columns: Column<Interview>[] = useMemo(() => [
    { header: "ID", accessor: "id", width: 70 },
    { header: "Title", accessor: "title" },
    { header: "Job Role", accessor: "jobRole" },
    { header: "Status", accessor: "status", width: 120 },
    { header: "Owner", accessor: "username", width: 140 },
    {
      header: "Questions", width: 140,
      render: (row: Interview) => (
        <button onClick={() => navigate(`/interviews/${row.id}/questions`)} style={linkBtn}>
          {counts[row.id]?.questions ?? '...'} question(s)
        </button>
      ),
    },
    {
      header: "Applicants", width: 220,
      render: (row: Interview) => (
        <button onClick={() => navigate(`/interviews/${row.id}/applicants`)} style={linkBtn}>
          {counts[row.id]?.applicants ?? '...'} total ·
          {' '}{counts[row.id]?.notStarted ?? 0} Not Started · {counts[row.id]?.completed ?? 0} Completed
        </button>
      ),
    },
    {
      header: "Actions",
      render: (row: Interview) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate(`/interviews/${row.id}`)} aria-label="View" style={iconBtn}>
            <EyeIcon width={18} height={18} />
          </button>
          <button onClick={() => setEditOpen(row)} aria-label="Edit" style={iconBtn}>
            <PencilIcon width={18} height={18} style={{ color: '#2563eb' }} />
          </button>
          <button onClick={() => handleDelete(row)} aria-label="Delete" style={iconBtn}>
            <TrashIcon width={18} height={18} style={{ color: '#ef4444' }} />
          </button>
        </div>
      ),
      width: 140,
    },
  ], [counts]);

  async function handleCreate(values: FormInterview) {
    try {
      const res = await createInterview(values);
      // PostgREST with Prefer=return=representation returns array; ignore and reload
      void res;
      setCreateOpen(false);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Create failed');
    }
  }

  async function handleUpdate(values: FormInterview) {
    if (!editOpen?.id) return;
    try {
      const res = await updateInterview(editOpen.id, values);
      void res;
      setEditOpen(null);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Update failed');
    }
  }

  async function handleDelete(row: Interview) {
    if (!confirm(`Delete interview #${row.id}?`)) return;
    try {
      await deleteInterview(row.id);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Delete failed');
    }
  }

  return (
    <SimpleConnectionGuard>
      <section>
        <div className="flex justify-between items-center p-[20px]">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ margin: 0 }}>Interviews</h1>
            <SimpleConnectionIndicator />
          </div>
          <button onClick={() => setCreateOpen(true)} style={btnPrimary}>New Interview</button>
        </div>

        {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DataTable columns={columns} data={items} rowKey={(r: Interview) => r.id} emptyText="No interviews" />
        )}

      <Modal open={createOpen} title="Create Interview" onClose={() => setCreateOpen(false)}>
        <InterviewForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editOpen} title={`Edit Interview #${editOpen?.id ?? ''}`} onClose={() => setEditOpen(null)}>
        {editOpen && (
          <InterviewForm initial={editOpen} onSubmit={handleUpdate} onCancel={() => setEditOpen(null)} />
        )}
      </Modal>
      </section>
    </SimpleConnectionGuard>
  );
}

// Export the component directly - connection management is now handled by SimpleConnectionGuard
export default Interviews;

const btnPrimary: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' };
const iconBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 };
const linkBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', color: '#2563eb', textDecoration: 'underline' };
