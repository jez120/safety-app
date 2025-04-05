import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode; // The component to render if authenticated
  allowedRoles?: string[]; // Optional: Array of roles allowed to access
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation(); // Get current location to redirect back after login

  if (isLoading) {
    // Show a loading indicator while checking auth status
    // You can replace this with a more sophisticated loading spinner
    return <div>Loading...</div>;
  }

  if (!token || !user) {
    // User not logged in, redirect to login page
    // Pass the current location state so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific roles are required and if the user has one of them
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have the required role
    // Redirect to an unauthorized page or back to home/dashboard
    // For now, let's redirect to home page (or could be a dedicated 'Unauthorized' page)
    console.warn(`User role '${user.role}' not authorized for this route. Allowed: ${allowedRoles.join(', ')}`);
    // Consider creating a dedicated <Unauthorized /> page component
    return <Navigate to="/" replace />; // Redirect to landing page
  }

  // User is logged in and has the required role (if specified), render the child component
  return <>{children}</>;
};

export default ProtectedRoute;
