import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <div style={brandStyle}>
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              style={menuButtonStyle}
              title="Open Menu"
            >
              ☰
            </button>
          )}
          <h1 style={brandTitleStyle}>ReadySetHire</h1>
        </div>

        <div style={navItemsStyle}>
          <div style={userInfoStyle}>
            <span style={userNameStyle}>
              Welcome, {user?.firstName || user?.username}
            </span>
            <span style={userRoleStyle}>
              ({user?.role})
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            style={logoutButtonStyle}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

// Styles
const navbarStyle: React.CSSProperties = {
  backgroundColor: '#1f2937',
  color: 'white',
  padding: '16px 0',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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

const menuButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'white',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '8px',
  borderRadius: '4px',
  transition: 'background-color 0.2s',
};

const menuButtonHoverStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
};

const brandTitleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
  color: 'white',
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

const logoutButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#dc2626',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};
