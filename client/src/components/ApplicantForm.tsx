import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

export type Applicant = {
  id?: number;
  firstname: string;
  surname: string;
  phone_number?: string;
  email_address: string;
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
      firstname: "",
      surname: "",
      phone_number: "",
      email_address: "",
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Applicant = {
      id: v.id,
      firstname: String(fd.get('firstname') || ''),
      surname: String(fd.get('surname') || ''),
      phone_number: String(fd.get('phone_number') || ''),
      email_address: String(fd.get('email_address') || ''),
    };
    onSubmit(payload);
  }

  const field: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 6 };
  const label: CSSProperties = { fontSize: 13, color: '#374151' };
  const input: CSSProperties = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6 };

  const isEdit = Boolean(initial?.id);

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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
          <input name="email_address" defaultValue={v.email_address} style={input} required maxLength={255} type="email" />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}