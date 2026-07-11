import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // e.g., ROLE_PATIENT, ROLE_DOCTOR, ROLE_ADMIN

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Role not authorized, redirect to appropriate default dashboard
    if (role === 'ROLE_ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'ROLE_DOCTOR') {
      return <Navigate to="/doctor" replace />;
    } else if (role === 'ROLE_PATIENT') {
      return <Navigate to="/patient" replace />;
    } else {
      localStorage.clear();
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
