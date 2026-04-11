
export const PATHS = {
    ROOT: '/',
    LOGIN: '/login',
    WELCOME: '/welcome',

    // PASSWORD RESET
    FORGOT_PASSWORD: '/forgot-password',
    CUSTOMER_FORGOT_PASSWORD: '/customer-forgot-password',
    RESET_PASSWORD_CONFIRM: '/reset-password/confirm',

    // CUSTOMER PORTAL
    CUSTOMER_LOGIN: '/customer-login',
    CUSTOMER_PORTAL: '/customer-portal',

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

    // CUSTOMER CARE / ORDERS
    CUSTOMER_CARE: {
        NEW_ORDER: '/new-order',
        ALL_ORDERS: '/orders/all',
        PENDING_ORDERS: '/orders/pending',
        ORDER_STATUS: '/orders/status',
        SERVICE_GOODS: '/orders/service-goods',
        VIEW_ORDERS: '/orders/view',
        UPGRADE_ORDERS: '/orders/upgrade',
        UPDATE_CUSTOMERS: '/customer/list',
        EDIT_ORDER: '/order/edit/:id',
        ORDER_DETAILS: '/order/view/:id',
    },

    STORES: '/stores',
    NEW_ORDER: '/new-order',
    DRAFTS: '/drafts',
    APPROVALS: '/approvals',
    CORRECTIONS: '/corrections',

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
