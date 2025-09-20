import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ConditionalRouteProps {
  children: React.ReactNode;
}

export default function ConditionalRoute({ children }: ConditionalRouteProps) {
  const { isAuthenticated } = useAuth();

  // 如果用户已登录，重定向到dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // 如果用户未登录，显示子组件（通常是Home页面）
  return <>{children}</>;
}
