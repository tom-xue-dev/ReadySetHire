import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import ApplicantForm from "../components/ApplicantForm";
import type { Applicant as FormApplicant } from "../components/ApplicantForm";
import { PencilIcon, TrashIcon, ArrowUturnLeftIcon, PlayIcon, PlusIcon, EyeIcon } from "@heroicons/react/24/solid";
import { SimpleConnectionIndicator, SimpleConnectionGuard } from "../components/SimpleConnectionStatus";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Chip from "../components/ui/Chip";
// @ts-ignore JS helper
import { getApplicantsByInterview, getAllApplicants, bindApplicantToInterviewV2, unbindApplicantFromInterview, createApplicant, updateApplicant, deleteApplicant } from "../api/helper.js";

type Applicant = {
  id: number;
  firstname: string;
  surname: string;
  // Prefer camelCase (from Prisma), keep snake_case optional for compatibility in some views
  phoneNumber?: string;
  emailAddress?: string;
  phone_number?: string;
  email_address?: string;
  applicantInterviews?: Array<{
    id: number;
    interviewStatus: string;
    interview: {
      id: number;
      title: string;
      jobRole: string;
      job?: {
        id: number;
        title: string;
      };
    };
  }>;
};

export default function Applicant() {
  const { interviewId: interviewIdParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const interviewId = interviewIdParam ? Number(interviewIdParam) : undefined;
  const urlParams = new URLSearchParams(location.search);
  const filterParam = (urlParams.get('filter') || '').toLowerCase();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Applicant[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<Applicant | null>(null);
  const [existingOpen, setExistingOpen] = useState(false);
  const [existing, setExisting] = useState<Applicant[]>([]);
  const [existingQ, setExistingQ] = useState("");
  const [existingLoading, setExistingLoading] = useState(false);

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
  async function openExistingModal() {
    if (!interviewId) return;
    setExistingLoading(true);
    setExistingQ("");
    try {
      const all = await getAllApplicants();
      const list: Applicant[] = Array.isArray(all) ? all as Applicant[] : [];
      // Exclude already bound to this interview
      const unbound = list.filter((a) => !a.applicantInterviews?.some(ai => ai.interview.id === interviewId));
      setExisting(unbound);
      setExistingOpen(true);
    } catch (e) {
      setError((e as any)?.message ?? 'Load existing failed');
    } finally {
      setExistingLoading(false);
    }
  }

  const filteredExisting = useMemo(() => {
    const q = existingQ.trim().toLowerCase();
    if (!q) return existing;
    return existing.filter(a => `${a.firstname} ${a.surname} ${(a as any).emailAddress || (a as any).email_address || ''}`.toLowerCase().includes(q));
  }, [existing, existingQ]);

  async function handleBindExisting(applicantId: number) {
    if (!interviewId) return;
    try {
      await bindApplicantToInterviewV2(interviewId, applicantId, 'NOT_STARTED');
      setExistingOpen(false);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Bind failed');
    }
  }


  useEffect(() => { load(); }, [interviewId]);

  const tableItems = useMemo(() => {
    if (!interviewId) return items;
    if (filterParam === 'completed') {
      return items.filter(a => a.applicantInterviews?.some(ai => ai.interview.id === interviewId && ai.interviewStatus === 'COMPLETED'));
    }
    if (filterParam === 'not-started') {
      return items.filter(a => a.applicantInterviews?.some(ai => ai.interview.id === interviewId && ai.interviewStatus === 'NOT_STARTED'));
    }
    return items;
  }, [items, interviewId, filterParam]);

  const columns: Column<Applicant>[] = useMemo(() => [
    { header: "ID", accessor: "id", width: 70 },
    { header: "First Name", accessor: "firstname" },
    { header: "Surname", accessor: "surname" },
    { header: "Phone", accessor: "phoneNumber", width: 160 },
    { header: "Email", accessor: "emailAddress", width: 220 },
    { 
      header: "Interview Status", 
      width: 140,
      render: (row: Applicant) => {
        const interview = row.applicantInterviews?.find(ai => ai.interview.id === interviewId);
        return interview ? interview.interviewStatus : 'Not Bound';
      }
    },
    { 
      header: "Interview", 
      width: 200,
      render: (row: Applicant) => {
        const interview = row.applicantInterviews?.find(ai => ai.interview.id === interviewId);
        return interview ? interview.interview.title : 'Not Bound';
      }
    },
    { 
      header: "Job", 
      width: 200,
      render: (row: Applicant) => {
        const interview = row.applicantInterviews?.find(ai => ai.interview.id === interviewId);
        return interview?.interview.job?.title || 'N/A';
      }
    },
    {
      header: "Actions", width: 200,
      render: (row: Applicant) => {
        const status = row.applicantInterviews?.find(ai => ai.interview.id === interviewId)?.interviewStatus;
        const isCompletedView = filterParam === 'completed';
        return (
          <div style={{ display: 'flex', gap: 8 }}>
            {isCompletedView ? (
              <button 
                onClick={() => navigate(`/interview-answers/${interviewId}/${row.id}`)} 
                aria-label="View Answers" 
                style={iconBtn}
                title="View Answers"
              >
                <EyeIcon width={18} height={18} style={{ color: '#0f766e' }} />
              </button>
            ) : (
              <button 
                onClick={() => navigate(`/interview-welcome/${interviewId}/${row.id}`)} 
                aria-label="Start Interview" 
                style={iconBtn}
                title="Start Interview"
                disabled={status === 'COMPLETED'}
              >
                <PlayIcon width={18} height={18} style={{ color: status === 'COMPLETED' ? '#9ca3af' : '#059669' }} />
              </button>
            )}
            <button onClick={() => setEditOpen(row)} aria-label="Edit" style={iconBtn}>
              <PencilIcon width={18} height={18} style={{ color: '#2563eb' }} />
            </button>
            <button onClick={() => handleDelete(row)} aria-label="Delete" style={iconBtn}>
              <TrashIcon width={18} height={18} style={{ color: '#ef4444' }} />
            </button>
          </div>
        );
      }
    }
  ], [interviewId, filterParam]);

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
      await load();
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
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Update failed');
    }
  }

  async function handleDelete(row: Applicant) {
    if (!interviewId) return;
    if (!confirm(`Unbind applicant #${row.id} from interview #${interviewId}?`)) return;
    try {
      await unbindApplicantFromInterview(row.id, interviewId);
      await load();
    } catch (e) {
      alert((e as any)?.message ?? 'Unbind failed');
    }
  }

  return (
    <SimpleConnectionGuard>
      <section className="min-h-screen bg-zinc-50">
        {/* Page header */}
        <div className="sticky" style={{ top: 'var(--app-header-height, 0px)' }}>
          <div className="bg-white/80 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/interviews')} className="inline-flex items-center gap-2">
                <ArrowUturnLeftIcon className="w-4 h-4" /> Back
              </Button>
              <h2 className="text-lg font-semibold text-zinc-900 m-0">Applicants for Interview #{interviewId || '-'}</h2>
              <SimpleConnectionIndicator />
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <Button className="bg-indigo-600 hover:bg-indigo-700 inline-flex items-center gap-2" onClick={() => setCreateOpen(true)}>
                  <PlusIcon className="w-4 h-4" /> New Applicant
                </Button>
                <Button variant="outline" onClick={openExistingModal}>Add Existing</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="max-w-7xl mx-auto p-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-3">Error: {error}</div>}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <Card className="p-4"><div className="text-xs text-zinc-500">Total</div><div className="text-xl font-semibold">{items.length}</div></Card>
            <Card className="p-4"><div className="text-xs text-zinc-500">Bound</div><div className="text-xl font-semibold">{items.filter(a => a.applicantInterviews?.length).length}</div></Card>
            <Card className="p-4"><div className="text-xs text-zinc-500">Unbound</div><div className="text-xl font-semibold">{items.filter(a => !a.applicantInterviews?.length).length}</div></Card>
            <Card className="p-4"><div className="text-xs text-zinc-500">Completed</div><div className="text-xl font-semibold">{items.filter(a => a.applicantInterviews?.some(ai => ai.interviewStatus === 'COMPLETED')).length}</div></Card>
          </div>

          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b bg-white text-sm text-zinc-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Chip>Interview #{interviewId || '-'}</Chip>
              </div>
              <div>{items.length} result(s)</div>
            </div>
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-6 text-sm text-zinc-500">Loading…</div>
              ) : (
                <DataTable columns={columns} data={tableItems} rowKey={(r) => r.id} emptyText="No applicants" />
              )}
            </div>
          </Card>
        </main>

        {/* Modals */}
        <Modal open={createOpen} title="Create Applicant" onClose={() => setCreateOpen(false)}>
          <ApplicantForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
        </Modal>

        <Modal open={!!editOpen} title={`Edit Applicant #${editOpen?.id ?? ''}`} onClose={() => setEditOpen(null)}>
          {editOpen && (
            <ApplicantForm initial={editOpen} onSubmit={handleUpdate} onCancel={() => setEditOpen(null)} />
          )}
        </Modal>

        <Modal open={existingOpen} title="Add Existing Applicant" onClose={() => setExistingOpen(false)}>
          <div className="p-2">
            <input
              value={existingQ}
              onChange={(e) => setExistingQ(e.target.value)}
              placeholder="Search name or email…"
              className="w-full mb-3 px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring"
            />
            {existingLoading ? (
              <div className="text-sm text-zinc-500">Loading…</div>
            ) : filteredExisting.length === 0 ? (
              <div className="text-sm text-zinc-500">No candidates</div>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y">
                {filteredExisting.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-900 truncate">{a.firstname} {a.surname}</div>
                      <div className="text-xs text-zinc-500 truncate">{(a as any).emailAddress || (a as any).email_address}</div>
                    </div>
                    <Button onClick={() => handleBindExisting(a.id)} className="bg-indigo-600 hover:bg-indigo-700">Add</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      </section>
    </SimpleConnectionGuard>
  );
}

const iconBtn: React.CSSProperties = { border: 'none', background: 'transparent', cursor: 'pointer', padding: 2 };
