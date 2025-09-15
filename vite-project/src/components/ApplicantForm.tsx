import type { CSSProperties } from "react";

export type Applicant = {
  id?: number;
  interview_id: number;
  title: string;
  firstname: string;
  surname: string;
  phone_number?: string;
  email_address: string;
  interview_status: "Not Started" | "Completed" | string;
  username: string;
};

export default function ApplicantForm({
  interviewId,
  initial,
  onSubmit,
  onCancel,
}: {
  interviewId: number;
  initial?: Partial<Applicant>;
  onSubmit: (values: Applicant) => void;
  onCancel: () => void;
}) {
  const v = { ...defaults(interviewId), ...initial } as Applicant;

  function defaults(interview_id: number): Applicant {
    return {
      interview_id,
      title: "Mr",
      firstname: "",
      surname: "",
      phone_number: "",
      email_address: "",
      interview_status: "Not Started",
      username: "",
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Applicant = {
      id: v.id,
      interview_id: v.interview_id,
      title: String(fd.get('title') || ''),
      firstname: String(fd.get('firstname') || ''),
      surname: String(fd.get('surname') || ''),
      phone_number: String(fd.get('phone_number') || ''),
      email_address: String(fd.get('email_address') || ''),
      interview_status: String(fd.get('interview_status') || 'Not Started'),
      username: String(fd.get('username') || ''),
    };
    onSubmit(payload);
  }

  const field: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const label: CSSProperties = { fontSize: 13, color: '#374151' };
  const input: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>Title *</label>
          <select name="title" defaultValue={v.title} style={input} required>
            <option>Mr</option>
            <option>Ms</option>
            <option>Dr</option>
          </select>
        </div>
        <div style={field}>
          <label style={label}>First name *</label>
          <input name="firstname" defaultValue={v.firstname} style={input} required maxLength={255} />
        </div>
        <div style={field}>
          <label style={label}>Surname *</label>
          <input name="surname" defaultValue={v.surname} style={input} required maxLength={255} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>Phone</label>
          <input name="phone_number" defaultValue={v.phone_number} style={input} maxLength={50} />
        </div>
        <div style={field}>
          <label style={label}>Email *</label>
          <input name="email_address" defaultValue={v.email_address} style={input} required maxLength={255} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>Interview Status *</label>
          <select name="interview_status" defaultValue={v.interview_status} style={input} required>
            <option>Not Started</option>
            <option>Completed</option>
          </select>
        </div>
        <div style={field}>
          <label style={label}>Username *</label>
          <input name="username" defaultValue={v.username} style={input} required maxLength={255} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}

