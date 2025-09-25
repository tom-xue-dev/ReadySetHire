import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
// @ts-ignore JS helper
import { updateInterview, updateApplicantInterviewStatus } from "../api/helper.js";
import "./InterviewThanks.css";

export default function InterviewThanks() {
  const navigate = useNavigate();
  const { interviewId, applicantId } = useParams();

  useEffect(() => {
    async function finalize() {
      if (interviewId && applicantId) {
        try {
          await updateApplicantInterviewStatus(Number(applicantId), Number(interviewId), 'COMPLETED');
        } catch (e) {
          console.error('Failed to mark applicant interview as COMPLETED:', e);
        }
      }
      if (interviewId) {
        try {
          await updateInterview(Number(interviewId), { status: "ARCHIVED" });
        } catch (e) {
          // Non-blocking
          console.error("Failed to archive interview:", e);
        }
      }
    }
    finalize();
  }, [interviewId, applicantId]);

  return (
    <section className="it-root">
      <div className="it-card">
        <div className="it-icon-wrap">
          <svg className="it-icon" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r="56" fill="#22c55e" />
            <path d="M36 62 L54 78 L86 44" fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="it-title">Thank you for completing the Interview!</h1>
        <p className="it-subtitle">We appreciate your time and effort.</p>
        <div className="it-actions">
          <button className="it-button" onClick={() => navigate('/')}>Back to Home</button>
          {interviewId && (
            <button className="it-button ghost" onClick={() => navigate(`/interviews/${interviewId}`)}>View Interview</button>
          )}
        </div>
      </div>
    </section>
  );
}

