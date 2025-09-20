import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { UserCircleIcon, ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_transparent.png';

interface HeaderProps {}

export default function Header({}: HeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSettings = () => {
    navigate('/settings');
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm(t('common.confirmLogout'))) {
      logout();
    }
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={brandStyle}>
          <button onClick={() => navigate('/')} style={brandTitleStyle}>
            <img src={logo} style={{ height: 40, width: 'auto' }} className="block object-contain" />
          </button>
        </div>
        <span style={{marginLeft:"auto",marginRight: "20px"}}>
          {t('common.welcome')}, {user?.firstName || user?.username}
        </span>
        <div style={navItemsStyle}>
          {/* dropdown menu */}
          <div style={dropdownContainerStyle} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={userButtonStyle}
              title={t('common.welcome')}
            >
              <UserCircleIcon width={24} height={24} style={{ color: 'white' }} />
              <span style={userNameStyle}>
                {user?.firstName || user?.username}
              </span>
              <ChevronDownIcon 
                width={16} 
                height={16} 
                style={{ 
                  color: 'white',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </button>
            
            {isDropdownOpen && (
              <div style={dropdownMenuStyle}>
                <div style={dropdownHeaderStyle}>
                  <div style={userInfoStyle}>
                    <span style={userRoleStyle}>
                      ({user?.role})
                    </span>
                  </div>
                </div>
                <div style={dropdownDividerStyle}></div>
                <button
                  onClick={handleSettings}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Cog6ToothIcon width={16} height={16} style={{ marginRight: '8px' }} />
                  {t('common.settings')}
                </button>
                <button
                  onClick={handleLogout}
                  style={dropdownItemStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {t('common.logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Styles
const headerStyle: React.CSSProperties = {
  backgroundColor: '#1f2937',
  color: 'white',
  padding: '16px 0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  display: 'flex',
  justifyContent: 'space-between', 
  alignItems: 'center',
};

const brandStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const brandTitleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
  color: 'white',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
};

const navItemsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '2px',
};

const userNameStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '500',
};

const userRoleStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  textTransform: 'uppercase',
};


const dropdownContainerStyle: React.CSSProperties = {
  position: 'relative',
  display: 'inline-block',
  color: 'black',
};


const userButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  backgroundColor: 'transparent',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};


const dropdownMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  right: 0,
  marginTop: '8px',
  minWidth: '200px',
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  zIndex: 50,
  overflow: 'hidden',
};


const dropdownHeaderStyle: React.CSSProperties = {
  padding: '12px 16px',
  backgroundColor: '#f9fafb',
  borderBottom: '1px solid #e5e7eb',
};


const dropdownDividerStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: '#e5e7eb',
};


const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: 'transparent',
  color: '#374151',
  border: 'none',
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};
