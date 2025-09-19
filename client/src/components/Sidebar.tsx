import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/interviews', label: 'Interviews', icon: '🎯' },
    { path: '/jobs', label: 'Job Postings', icon: '💼' },
    { path: '/applicants', label: 'Applicants', icon: '👥' },
    { path: '/questions', label: 'Questions', icon: '❓' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: 'block'
          }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: isOpen ? '280px' : '0',
          backgroundColor: '#1f2937',
          color: 'white',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #374151' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
              ReadySetHire
            </h2>
            <button
              onClick={onToggle}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          </div>
          <div style={{ marginTop: '8px', fontSize: '14px', color: '#9ca3af' }}>
            Welcome, {user?.firstName || user?.username}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' }}>
            {user?.role}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {menuItems.map((item) => (
              <li key={item.path} style={{ marginBottom: '4px' }}>
                <button
                  onClick={() => {
                    navigate(item.path);
                    onToggle();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    background: isActive(item.path) ? '#374151' : 'transparent',
                    border: 'none',
                    color: 'white',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    transition: 'background-color 0.2s',
                    borderRadius: '0 25px 25px 0',
                    marginRight: '20px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid #374151' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
            ReadySetHire v1.0
          </div>
        </div>
      </div>
    </>
  );
}

