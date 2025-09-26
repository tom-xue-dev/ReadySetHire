import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./InterviewWelcome.css";
// @ts-ignore JS helper
import { getInterview, getApplicantsByInterview } from "../api/helper.js";

type Interview = { id: number; title?: string };
type Applicant = {
  id: number;
  firstname?: string;
  surname?: string;
  emailAddress?: string;
  phone_number?: string;
};

export default function InterviewWelcome() {
  const { interviewId: interviewIdParam, applicantId: applicantIdParam } = useParams();
  const interviewId = Number(interviewIdParam);
  const applicantId = Number(applicantIdParam);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interview, setInterview] = useState<Interview | null>(null);
  const [applicant, setApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    async function load() {
      if (!interviewId || !applicantId) return;
      setLoading(true);
      setError(null);
      try {
        const [ivRaw, applicants] = await Promise.all([
          getInterview(interviewId),
          getApplicantsByInterview(interviewId),
        ]);
        const iv = Array.isArray(ivRaw) ? (ivRaw[0] ?? null) : ivRaw;
        setInterview(iv);
        const list: Applicant[] = Array.isArray(applicants) ? applicants : [];
        const app = list.find(a => Number(a.id) === applicantId) ?? null;
        setApplicant(app);
      } catch (e: any) {
        setError(e?.message ?? 'Load failed');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [interviewId, applicantId]);

  return (
    <section className="iw-root">
      <div className="iw-card">
        <h1 className="iw-title">Welcome to Your Interview</h1>
        <p className="iw-subtitle">Please review your details before starting.</p>

        {error && <div className="iw-error">{error}</div>}
        {loading ? (
          <div className="iw-spinner" />
        ) : (
          <div className="iw-details">
            <div className="iw-label">Name</div>
            <div className="iw-value">{applicant ? `${applicant.firstname ?? ''} ${applicant.surname ?? ''}`.trim() : '-'}</div>
            <div className="iw-label">Email</div>
            <div className="iw-value">{applicant?.emailAddress ?? '-'}</div>
            <div className="iw-label">Interview</div>
            <div className="iw-value">{interview?.title ?? `Interview #${interviewId}`}</div>

            <div className="iw-actions">
              <button className="iw-button" onClick={() => navigate(`/interview-run/${interviewId}/${applicantId}`)}>
                Start Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
