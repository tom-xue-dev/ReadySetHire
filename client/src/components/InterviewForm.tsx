import type { CSSProperties } from "react";

export type Interview = {
  id?: number;
  title: string;
  job_role: string;
  description?: string;
  status: "Published" | "Draft" | "Archived" | string;
  username: string;
};

export default function InterviewForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Interview>;
  onSubmit: (values: Interview) => void;
  onCancel: () => void;
}) {
  const valuesRef = { ...defaultInterview(), ...initial } as Interview;

  function defaultInterview(): Interview {
    return { title: "", job_role: "", description: "", status: "Draft", username: "s10000" };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload: Interview = {
      id: valuesRef.id,
      title: String(formData.get('title') || ''),
      job_role: String(formData.get('job_role') || ''),
      description: String(formData.get('description') || ''),
      status: String(formData.get('status') || 'Draft'),
      username: String(formData.get('username') || 's10000'),
    };
    onSubmit(payload);
  }

  const fieldStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const labelStyle: CSSProperties = { fontSize: 13, color: '#374151' };
  const inputStyle: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="title">Title *</label>
        <input id="title" name="title" defaultValue={valuesRef.title} style={inputStyle} maxLength={255} required />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="job_role">Job Role *</label>
        <input id="job_role" name="job_role" defaultValue={valuesRef.job_role} style={inputStyle} maxLength={255} required />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle} htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={valuesRef.description} style={{ ...inputStyle, minHeight: 100 }} maxLength={2000} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="status">Status *</label>
          <select id="status" name="status" defaultValue={valuesRef.status} style={inputStyle} required>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle} htmlFor="username">Username *</label>
          <input id="username" name="username" defaultValue={valuesRef.username} style={inputStyle} maxLength={255} required />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}

