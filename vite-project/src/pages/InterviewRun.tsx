import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// @ts-ignore JS helper
import { getQuestions, getInterview, getAnswersByApplicant, createApplicantAnswer, updateApplicantAnswer } from "../api/helper.js";
import "./InterviewRun.css";
import AudioCapture from "../components/AudioCapture";
import { transcribeWavBlob } from "../api/asr";

type Question = { id: number; question: string; difficulty?: string };

export default function InterviewRun() {
  const { interviewId: interviewIdParam, applicantId: applicantIdParam } = useParams();
  const interviewId = Number(interviewIdParam);
  const applicantId = Number(applicantIdParam);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerIds, setAnswerIds] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingDone, setRecordingDone] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function load() {
      if (!interviewId) return;
      setLoading(true);
      setError(null);
      try {
        const [qs, ivRaw, existing] = await Promise.all([
          getQuestions(interviewId),
          getInterview(interviewId),
          applicantId ? getAnswersByApplicant(applicantId) : Promise.resolve([]),
        ]);
        const list: Question[] = (Array.isArray(qs) ? qs : [])
          .map((q: any) => ({ id: Number(q.id), question: String(q.question ?? ''), difficulty: q.difficulty }))
          .sort((a, b) => a.id - b.id);
        setQuestions(list);
        const iv = Array.isArray(ivRaw) ? ivRaw[0] : ivRaw;
        setTitle(iv?.title ?? `Interview #${interviewId}`);
        setIndex(0);
        // Pre-fill answers if they exist for this applicant
        const ansMap: Record<number, string> = {};
        const idMap: Record<number, number> = {};
        if (Array.isArray(existing)) {
          for (const a of existing as any[]) {
            const qid = Number(a.question_id);
            if (qid) {
              ansMap[qid] = String(a.answer ?? '');
              if (a.id) idMap[qid] = Number(a.id);
            }
          }
        }
        setAnswers(ansMap);
        setAnswerIds(idMap);
      } catch (e: any) {
        setError(e?.message ?? 'Load failed');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [interviewId]);

  const current = useMemo(() => questions[index], [questions, index]);
  const progress = questions.length ? Math.min(index + 1, questions.length) / questions.length : 0;

  function handleChange(val: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  }

  async function handleAudioStop(blob: Blob) {
    if (!current) return;
    setTranscribing(true);
    setSaveErr(null);
    try {
      // Transformers.js returns text from audio buffer
      const text = await transcribeWavBlob(blob);
      setAnswers((prev) => ({ ...prev, [current.id]: text }));
      setRecordingDone((m) => ({ ...m, [current!.id]: true }));
    } catch (e: any) {
      setSaveErr(e?.message ?? "Transcription failed");
    } finally {
      setTranscribing(false);
    }
  }

  async function saveCurrentIfNeeded() {
    setSaveErr(null);
    const q = current;
    if (!q || !applicantId || !interviewId) return;
    const val = answers[q.id] ?? '';
    try {
      setSaving(true);
      const existingId = answerIds[q.id];
      if (existingId) {
        await updateApplicantAnswer(existingId, { answer: val });
      } else {
        const created = await createApplicantAnswer({
          interview_id: interviewId,
          question_id: q.id,
          applicant_id: applicantId,
          answer: val,
        });
        const rec = Array.isArray(created) ? created[0] : created;
        if (rec?.id) setAnswerIds((m) => ({ ...m, [q.id]: Number(rec.id) }));
      }
    } catch (e: any) {
      setSaveErr(e?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    await saveCurrentIfNeeded();
    if (index < questions.length - 1) setIndex((i) => i + 1);
  }

  function handleFinish() {
    // Save last answer then navigate
    saveCurrentIfNeeded().finally(() => {
      navigate(`/interview-thanks/${interviewId}/${applicantId}`);
    });
  }

  return (
    <section className="ir-root">
      <div className="ir-card">
        <div className="ir-header">
          <div className="ir-title">{title}</div>
          <div className="ir-sub">Applicant ID: {applicantId || '-'}</div>
        </div>

        {error && <div className="ir-error">{error}</div>}
        {loading ? (
          <div className="ir-spinner" />
        ) : questions.length === 0 ? (
          <div className="ir-empty">No questions for this interview.</div>
        ) : (
          <>
            <div className="ir-progress">
              <div className="ir-bar" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="ir-qindex">Question {index + 1} of {questions.length}</div>

            <div className="ir-question">
              {current?.question}
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              <AudioCapture onStop={handleAudioStop} disabled={!!recordingDone[current?.id ?? -1]} />
              <textarea
                className="ir-textarea"
                placeholder="Transcript will appear here..."
                value={current ? (answers[current.id] ?? '') : ''}
                onChange={(e) => handleChange(e.target.value)}
                readOnly
              />
              {transcribing && <div className="ir-saving">Transcribing...</div>}
            </div>

            <div className="ir-actions">
              {index < questions.length - 1 ? (
                <button className="ir-btn primary" onClick={handleNext}>Next</button>
              ) : (
                <button className="ir-btn primary" onClick={handleFinish}>Finish</button>
              )}
            </div>
            {saving && <div className="ir-saving">Saving...</div>}
            {saveErr && <div className="ir-error" style={{ marginTop: 8 }}>{saveErr}</div>}
          </>
        )}
      </div>
    </section>
  );
}
