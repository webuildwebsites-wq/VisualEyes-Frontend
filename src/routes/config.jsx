import Login from '../pages/Login';
import Welcome from '../pages/Welcome';
import Registration from '../pages/Registration';
import RegisterCustomer from '../pages/RegisterCustomer';
import CustomerList from '../pages/CustomerList';
import ShipTo from '../pages/ShipTo';
import EmployeeList from '../pages/EmployeeList';
import DashboardWizard from '../pages/AddStore';
import OrderWizard from '../pages/OrderWizard';
import PlaceholderPage from '../pages/PlaceholderPage';
import AuthWrapper from '../components/AuthWrapper';
import MainLayout from '../components/layout/MainLayout';

import { PATHS } from './paths';

export { PATHS };

/**
 * Route Modules - Grouped for clear editability
 */

const STAFF_MODULE = [
    {
        path: 'staff/register',
        element: Registration,
        props: { title: 'Register Employee' },
        requiredPermission: 'CanCreateEmployee'
    },
    {
        path: 'staff/list',
        element: EmployeeList,
        requiredPermission: 'CanManageEmployee'
    }
];

const CUSTOMER_MODULE = [
    {
        path: 'customer/register',
        element: RegisterCustomer,
        requiredPermission: 'CanCreateCustomers'
    },
    {
        path: 'customer/list',
        element: CustomerList,
        requiredPermission: 'CanManageCustomers'
    },
    {
        path: 'customer/ship-to',
        element: ShipTo,
        requiredPermission: 'CanManageCustomers'
    }
];

const OPERATIONS_MODULE = [
    { path: 'lab', element: PlaceholderPage, props: { title: 'Lab' } },
    { path: 'surfacing', element: PlaceholderPage, props: { title: 'Surfacing' } },
    { path: 'tint', element: PlaceholderPage, props: { title: 'Tint' } },
    { path: 'hard-coat', element: PlaceholderPage, props: { title: 'Hard Coat' } },
    { path: 'arc', element: PlaceholderPage, props: { title: 'ARC' } },
    { path: 'qc', element: PlaceholderPage, props: { title: 'QC' } },
    { path: 'fitting', element: PlaceholderPage, props: { title: 'Fitting' } },
    { path: 'dispatch', element: PlaceholderPage, props: { title: 'Dispatch' } },
    { path: 'dms', element: PlaceholderPage, props: { title: 'DMS' } },
    { path: 'finance', element: PlaceholderPage, props: { title: 'F&A' }, requiredPermission: 'CanViewFinancials' },
    { path: 'reports', element: PlaceholderPage, props: { title: 'Reports' }, requiredPermission: 'CanViewReports' },
    { path: 'stores', element: DashboardWizard, requiredPermission: 'CanManageProducts' },
    { path: 'new-order', element: OrderWizard },
];

/**
 * Combined Routes Configuration
 */
export const routesConfig = [
    {
        path: PATHS.LOGIN,
        element: Login,
        isPublic: true
    },
    {
        element: AuthWrapper,
        isProtected: true,
        children: [
            {
                path: PATHS.WELCOME,
                element: Welcome
            },
            {
                path: PATHS.ROOT,
                element: MainLayout,
                children: [
                    {
                        index: true,
                        element: PlaceholderPage,
                        props: { title: 'Dashboard' }
                    },
                    ...STAFF_MODULE,
                    ...CUSTOMER_MODULE,
                    ...OPERATIONS_MODULE
                ]
            }
        ]
    }
];
