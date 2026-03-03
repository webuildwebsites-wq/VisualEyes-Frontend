/**
 * PATHS constant for easy access and single source of truth
 * Separated into its own file to prevent circular dependencies
 */
export const PATHS = {
    ROOT: '/',
    LOGIN: '/login',
    WELCOME: '/welcome',

    // STAFF MODULE
    STAFF: {
        REGISTER: '/staff/register',
        LIST: '/staff/list',
    },

    // CUSTOMER MODULE
    CUSTOMER: {
        REGISTER: '/customer/register',
        LIST: '/customer/list',
        SHIP_TO: '/customer/ship-to',
    },

    STORES: '/stores',
    NEW_ORDER: '/new-order',
    DRAFTS: '/drafts',

    // OPERATIONS MODULE
    OPERATIONS: {
        LAB: '/lab',
        SURFACING: '/surfacing',
        TINT: '/tint',
        HARD_COAT: '/hard-coat',
        ARC: '/arc',
        QC: '/qc',
        FITTING: '/fitting',
        DISPATCH: '/dispatch',
        DMS: '/dms',
        FINANCE: '/finance',
        REPORTS: '/reports',
    }
};
