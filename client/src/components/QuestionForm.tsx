import type { CSSProperties } from "react";
import { useAuth } from "../contexts/AuthContext";

export type Question = {
  id?: number;
  interview_id: number;
  question: string;
  difficulty: "Easy" | "Intermediate" | "Advanced" | string;
  username: string;
};

export default function QuestionForm({
  interviewId,
  initial,
  onSubmit,
  onCancel,
}: {
  interviewId: number;
  initial?: Partial<Question>;
  onSubmit: (values: Question) => void;
  onCancel: () => void;
}) {
  const { user } = useAuth();
  const valuesRef = { ...defaults(interviewId, user?.username), ...initial } as Question;

  function defaults(interview_id: number, username: string = "unknown"): Question {
    return { id: undefined, interview_id, question: "", difficulty: "Easy", username };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Question = {
      id: valuesRef.id,
      interview_id: valuesRef.interview_id,
      question: String(formData.get('question') || ''),
      difficulty: String(formData.get('difficulty') || 'Easy'),
      username: valuesRef.username, // Use current user's username
    };
    onSubmit(payload);
  } 

  const field: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const label: CSSProperties = { fontSize: 13, color: '#374151' };
  const input: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={field}>
        <label style={label}>Question *</label>
        <textarea name="question" defaultValue={valuesRef.question} style={{ ...input, minHeight: 100 }} required />
      </div>
      <div style={field}>
        <label style={label}>Difficulty *</label>
        <select name="difficulty" defaultValue={valuesRef.difficulty} style={input} required>
          <option value="Easy">Easy</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}

