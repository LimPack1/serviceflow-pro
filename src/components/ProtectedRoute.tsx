import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAgent?: boolean;
  requireAdmin?: boolean;
  requireITStaff?: boolean;
  requireFrontOffice?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAgent = false, 
  requireAdmin = false,
  requireITStaff = false,
  requireFrontOffice = false
}: ProtectedRouteProps) {
  const { user, loading, isAgent, isAdmin, isITStaff, isFrontOffice, primaryRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requireAdmin && !isAdmin) {
    return <Navigate to={getHomeRoute(primaryRole)} replace />;
  }

  if (requireAgent && !isAgent) {
    return <Navigate to={getHomeRoute(primaryRole)} replace />;
  }

  if (requireITStaff && !isITStaff) {
    return <Navigate to="/portal" replace />;
  }

  if (requireFrontOffice && !isFrontOffice) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Helper function to get home route based on role
export function getHomeRoute(primaryRole: 'admin' | 'manager' | 'agent' | 'user'): string {
  switch (primaryRole) {
    case 'admin':
      return '/';
    case 'manager':
      return '/';
    case 'agent':
      return '/portal';
    case 'user':
    default:
      return '/portal';
  }
}
