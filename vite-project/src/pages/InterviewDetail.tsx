import { NavLink, Outlet, useNavigate, useParams } from "react-router-dom";

export default function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const sidebarLinkStyle: React.CSSProperties = {
    display: 'block',
    padding: '10px 12px',
    borderRadius: 6,
    color: '#1f2937',
    textDecoration: 'none',
  };

  const activeStyle: React.CSSProperties = {
    background: '#e5e7eb',
    fontWeight: 600,
  };

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
      <aside style={{ borderRight: '1px solid #eee', paddingRight: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Interview #{id}</h3>
          <button onClick={() => navigate('/interviews')} style={{ border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Back</button>
        </div>
        <nav style={{ display: 'grid', gap: 6 }}>
          <NavLink to={`questions`} style={({ isActive }) => ({ ...sidebarLinkStyle, ...(isActive ? activeStyle : {}) })}>
            Questions
          </NavLink>
          <NavLink to={`applicants`} style={({ isActive }) => ({ ...sidebarLinkStyle, ...(isActive ? activeStyle : {}) })}>
            Applicants
          </NavLink>
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </section>
  );
}

