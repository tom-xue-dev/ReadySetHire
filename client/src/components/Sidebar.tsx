import { useNavigate, useLocation } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'fixed',
        top: '16px',
        left: '16px',
        zIndex: 60,
        background: '#1f2937',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#374151';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1f2937';
      }}
      title={isOpen ? 'Close Menu' : 'Open Menu'}
    >
      {isOpen ? (
        <XMarkIcon width={20} height={20} />
      ) : (
        <Bars3Icon width={20} height={20} />
      )}
    </button>
  );
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const menuItems = [
    { path: '/dashboard', label: t('navigation.dashboard'), icon: '📊' },
    { path: '/interviews', label: t('navigation.interviews'), icon: '🎯' },
    { path: '/jobs', label: t('navigation.jobs'), icon: '💼' },
    { path: '/applicants', label: t('navigation.applicants'), icon: '👥' },
    { path: '/questions', label: t('navigation.questions'), icon: '❓' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>

      <SidebarToggle isOpen={isOpen} onToggle={onToggle} />
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

        {isOpen && (
          <div style={{
            padding: '20px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <button
              onClick={onToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '10px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title={t('common.closeMenu')}
            >
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px' }}>
          <ul style={{ listStyle: 'none', margin: "5px", padding: 0 }}>
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
      </div>
    </>
  );
}

