import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import QuestionForm from "../components/QuestionForm";
import type { Question as FormQuestion } from "../components/QuestionForm";
import { PencilIcon, TrashIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
// @ts-ignore JS module
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from "../api/helper.js";

type Question = Required<FormQuestion> & { id: number };

export default function Questions() {
  const params = useParams();
  const navigate = useNavigate();
  const interviewId = Number(params.id ?? params.interviewId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Question[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Question | null>(null);

  async function load() {
    if (!interviewId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestions(interviewId);
      setItems(Array.isArray(data) ? (data as Question[]) : []);
    } catch (e: any) {
      setError(e?.message ?? "Load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [interviewId]);

  const columns: Column<Question>[] = useMemo(() => [
    { header: "ID", accessor: "id", width: 70 },
    { header: "Question", accessor: "question" },
    { header: "Difficulty", accessor: "difficulty", width: 140 },
    { header: "Owner", accessor: "username", width: 140 },
    {
      header: "Actions", width: 120,
      render: (row: Question) => (
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

  async function handleCreate(values: FormQuestion) {
    try {
      await createQuestion(values);
      setCreateOpen(false);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Create failed');
    }
  }

  async function handleUpdate(values: FormQuestion) {
    if (!editOpen?.id) return;
    try {
      await updateQuestion(editOpen.id, values);
      setEditOpen(null);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Update failed');
    }
  }

  async function handleDelete(row: Question) {
    if (!confirm(`Delete question #${row.id}?`)) return;
    try {
      await deleteQuestion(row.id);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Delete failed');
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={() => navigate('/interviews')} aria-label="Back" style={iconBtn}>
          <ArrowUturnLeftIcon width={18} height={18} />
        </button>
        <h2 style={{ margin: 0 }}>Questions for Interview #{interviewId || '-'}</h2>
        <div style={{ flex: 1 }} />
        <button onClick={() => setCreateOpen(true)} style={btnPrimary}>New Question</button>
      </div>

      {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={items} rowKey={(r) => r.id} emptyText="No questions" />
      )}

      <Modal open={createOpen} title="Create Question" onClose={() => setCreateOpen(false)}>
        <QuestionForm interviewId={interviewId} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editOpen} title={`Edit Question #${editOpen?.id ?? ''}`} onClose={() => setEditOpen(null)}>
        {editOpen && (
          <QuestionForm interviewId={interviewId} initial={editOpen} onSubmit={handleUpdate} onCancel={() => setEditOpen(null)} />
        )}
      </Modal>
    </section>
  );
}

const iconBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 };
const btnPrimary: React.CSSProperties = { padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' };

