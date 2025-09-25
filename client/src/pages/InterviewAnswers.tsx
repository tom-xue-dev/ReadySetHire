import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// @ts-ignore JS helper
import { getQuestions, getInterview, getAnswersByInterviewAndApplicant } from "../api/helper.js";

type QA = { id: number; question: string; answer: string };

export default function InterviewAnswers() {
  const { interviewId: interviewIdParam, applicantId: applicantIdParam } = useParams();
  const interviewId = Number(interviewIdParam);
  const applicantId = Number(applicantIdParam);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [qas, setQas] = useState<QA[]>([]);

  useEffect(() => {
    async function load() {
      if (!interviewId || !applicantId) return;
      setLoading(true);
      setError(null);
      try {
        const [qs, ivRaw, answers] = await Promise.all([
          getQuestions(interviewId),
          getInterview(interviewId),
          getAnswersByInterviewAndApplicant(interviewId, applicantId),
        ]);
        const iv = Array.isArray(ivRaw) ? ivRaw[0] : ivRaw;
        setTitle(iv?.title ?? `Interview #${interviewId}`);
        const qMap = new Map<number, string>();
        (Array.isArray(qs) ? qs : []).forEach((q: any) => qMap.set(Number(q.id), String(q.question ?? '')));
        const list: QA[] = (Array.isArray(answers) ? answers : [])
          .map((a: any) => ({ id: Number(a.question_id), question: qMap.get(Number(a.question_id)) || '', answer: String(a.answer ?? '') }))
          .sort((a, b) => a.id - b.id);
        setQas(list);
      } catch (e: any) {
        setError(e?.message ?? 'Load failed');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [interviewId, applicantId]);

  return (
    <section className="max-w-3xl mx-auto p-4">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>{title} · Answers</h1>
        <button onClick={() => navigate(-1)} style={{ border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: 8 }}>Back</button>
      </div>
      {error && <div style={{ color: '#dc2626', marginBottom: 8 }}>Error: {error}</div>}
      {loading ? (
        <div>Loading…</div>
      ) : qas.length === 0 ? (
        <div>No answers.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {qas.map((qa) => (
            <div key={qa.id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: 'white' }}>
              <div style={{ fontSize: 14, color: '#4b5563', marginBottom: 6 }}>Q{qa.id}</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{qa.question}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{qa.answer || <span style={{ color: '#9ca3af' }}>No answer</span>}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


