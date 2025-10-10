import type { CSSProperties } from "react";

export type Applicant = {
  id?: number;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailAddress: string;
};

export default function ApplicantForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Applicant>;
  onSubmit: (values: Applicant) => void;
  onCancel: () => void;
}) {
  const v = { ...defaults(), ...initial } as Applicant;

  function defaults(): Applicant {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      emailAddress: "",
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Applicant = {
      id: v.id,
      firstName: String(fd.get('firstname') || ''),
      lastName: String(fd.get('lastname') || ''),
      phoneNumber: String(fd.get('phoneNumber') || ''),
      emailAddress: String(fd.get('emailAddress') || ''),
    };
    onSubmit(payload);
  }

  const field: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const label: CSSProperties = { fontSize: 13, color: '#374151' };
  const input: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 };

  // const isEdit = Boolean(initial?.id);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>First name *</label>
          <input name="firstname" defaultValue={v.firstName} style={input} required maxLength={255} />
        </div>
        <div style={field}>
          <label style={label}>Surname *</label>
          <input name="lastname" defaultValue={v.lastName} style={input} required maxLength={255} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={field}>
          <label style={label}>Phone</label>
          <input name="phoneNumber" defaultValue={v.phoneNumber} style={input} maxLength={50} />
        </div>
        <div style={field}>
          <label style={label}>Email *</label>
          <input name="emailAddress" defaultValue={v.emailAddress} style={input} required maxLength={255} type="email" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}