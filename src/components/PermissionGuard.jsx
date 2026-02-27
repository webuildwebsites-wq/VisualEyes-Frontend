import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser } from '../store/slices/authSlice';
import { PATHS } from '../routes/paths';

/**
 * PermissionGuard Component
 * 
 * Protects routes by checking if the user has the required permission.
 * If user is SUPERADMIN, access is always granted.
 * If user lacks permission, redirects to Welcome or a generic Unauthorized page.
 */
const PermissionGuard = ({ children, requiredPermission }) => {
    const user = useSelector(selectCurrentUser);

    if (!user) {
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    // SUPERADMIN override
    if (user.EmployeeType === 'SUPERADMIN') {
        return children;
    }

    // Check specific permission
    const hasPermission = !!user.permissions?.[requiredPermission];

    if (!hasPermission) {
        // Redirect to Welcome page if unauthorized
        return <Navigate to={PATHS.WELCOME} replace />;
    }

    return children;
};

export default PermissionGuard;
