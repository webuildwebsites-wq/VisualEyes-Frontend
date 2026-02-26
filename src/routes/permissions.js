import { PATHS } from './paths';

/**
 * Centrally defined permission rules for each path.
 * rules can be:
 * - permission: a specific flag in user.permissions (e.g., 'CanCreateCustomers')
 * - allowedRoles: specific employee types that have override access (e.g., 'SUPERADMIN')
 * - allowedDepartments: department names (optional fallback)
 */
export const PERMISSIONS_CONFIG = {
    // CUSTOMER MODULE
    [PATHS.CUSTOMER.REGISTER]: {
        permission: 'CanCreateCustomers',
        allowedRoles: ['SUPERADMIN']
    },
    [PATHS.CUSTOMER.LIST]: {
        permission: 'CanManageCustomers',
        allowedRoles: ['SUPERADMIN']
    },

    // STAFF MODULE
    [PATHS.STAFF.REGISTER]: {
        permission: 'CanCreateEmployee',
        allowedRoles: ['SUPERADMIN']
    },
    [PATHS.STAFF.LIST]: {
        permission: 'CanManageEmployee',
        allowedRoles: ['SUPERADMIN']
    },

    // OPERATIONS / FINANCE
    [PATHS.OPERATIONS.FINANCE]: {
        permission: 'CanViewFinancials',
        allowedRoles: ['SUPERADMIN']
    },

    // REPORTS
    [PATHS.OPERATIONS.REPORTS]: {
        permission: 'CanViewReports',
        allowedRoles: ['SUPERADMIN']
    },

    // SETUP / SETTINGS (Assuming these paths might exist or be added)
    [PATHS.STORES]: {
        permission: 'CanManageSettings',
        allowedRoles: ['SUPERADMIN']
    }
};

/**
 * Helper to check if a user has access to a specific path
 */
export const hasAccess = (path, user) => {
    if (!user) return false;

    // Role override
    if (user.EmployeeType === 'SUPERADMIN') return true;

    const config = PERMISSIONS_CONFIG[path];
    if (!config) return true; // Default to public if no config (internal routes like Dashboard)

    // Check specific permission flag
    if (config.permission && user.permissions?.[config.permission]) {
        return true;
    }

    // Check department fallback if needed
    if (config.allowedDepartments && config.allowedDepartments.includes(user.Department?.name)) {
        return true;
    }

    // Check specific role override defined in config
    if (config.allowedRoles && config.allowedRoles.includes(user.EmployeeType)) {
        return true;
    }

    return false;
};
