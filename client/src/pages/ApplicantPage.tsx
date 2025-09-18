import { useEffect, useMemo, useState } from "react";
import DataTable from "../components/DataTable";
import type { Column } from "../components/DataTable";
import { useNavigate } from "react-router-dom";
// @ts-ignore JS helper
import { getInterviews, getApplicantsByInterview } from "../api/helper.js";

type Interview = { id: number; title: string };
type Applicant = {
  id: number;
  title: string;
  firstname: string;
  surname: string;
  phone_number: string;
  email_address: string;
  interview_status: string;
  interview_id: number;
};

type Row = {
  id: number;
  name: string;
  email: string;
  phone: string;
  interviewTitle: string;
  status: string;
  interviewId: number;
};

export default function ApplicantPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const interviews: Interview[] = await getInterviews();
        const titleById = new Map<number, string>(interviews.map(i => [i.id, i.title]));
        const results = await Promise.all(
          interviews.map(i => getApplicantsByInterview(i.id).catch(() => []))
        );
        const flat: Applicant[] = results.flat();
        const mapped: Row[] = flat.map(a => ({
          id: a.id,
          name: `${a.firstname ?? ''} ${a.surname ?? ''}`.trim(),
          email: a.email_address ?? '',
          phone: a.phone_number ?? '',
          interviewTitle: titleById.get(a.interview_id) ?? `Interview #${a.interview_id}`,
          status: a.interview_status ?? '',
          interviewId: a.interview_id,
        }));
        setRows(mapped);
      } catch (e: any) {
        setError(e?.message ?? 'Load failed');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const columns: Column<Row>[] = useMemo(() => [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email', width: 220 },
    { header: 'Phone', accessor: 'phone', width: 160 },
    { header: 'Interview', accessor: 'interviewTitle' },
    { header: 'Status', accessor: 'status', width: 140 },
    {
      header: 'Action', width: 220,
      render: (row: Row) => (
        <div style={{ display: 'flex', gap: 8 }}>
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
            style={btn}
          >
            CopyLink
          </button>
          <button onClick={() => navigate(`/interview-welcome/${row.interviewId}/${row.id}`)} style={btnPrimary}>
            Take Interview
          </button>
        </div>
      )
    }
  ], [navigate]);

  return (
    <section>
      <h2 style={{ marginTop: 0 }}>Applicant Page</h2>
      {error && <div style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable columns={columns} data={rows} rowKey={(r) => r.id} emptyText="No applicants" />
      )}
    </section>
  );
}

const btn: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' };
const btnPrimary: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff', cursor: 'pointer' };
