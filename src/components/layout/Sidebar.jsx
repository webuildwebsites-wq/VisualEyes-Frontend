import { PATHS } from '../../routes/paths';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import { NavLink } from 'react-router-dom';
import { logoutUser } from '../../services/authService';
import { logOut } from '../../store/slices/authSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { hasAccess } from '../../routes/permissions';
import logo from '../../assets/logo.svg';

const navItems = [
    { label: 'Dashboard', icon: 'mdi:view-dashboard-outline', path: PATHS.ROOT },
    {
        label: 'Registration',
        icon: 'mdi:person-add-outline',
        subItems: [
            { label: 'Register Customer', path: PATHS.CUSTOMER.REGISTER },
            { label: 'Register Staff', path: PATHS.STAFF.REGISTER }
        ]
    },
    {
        label: 'Staff',
        icon: 'mdi:account-group-outline',
        subItems: [
            { label: 'Staff List', path: PATHS.STAFF.LIST }
        ]
    },
    {
        label: 'Customer ',
        icon: 'mdi:face-agent',
        subItems: [
            { label: 'Customer List', path: PATHS.CUSTOMER.LIST },
            { label: 'Ship To', path: PATHS.CUSTOMER.SHIP_TO },
            { label: 'Pending Approvals', path: PATHS.APPROVALS }
        ]
    },
    { label: 'Drafts', icon: 'mdi:file-edit-outline', path: PATHS.DRAFTS },
    // { label: 'F&A', icon: 'mdi:finance', path: PATHS.OPERATIONS.FINANCE },
    { label: 'Stores', icon: 'mdi:store', path: PATHS.STORES },
    { label: 'Reports', icon: 'mdi:chart-bar', path: PATHS.OPERATIONS.REPORTS },
    { label: 'Lab', icon: 'mdi:flask-outline', path: PATHS.OPERATIONS.LAB },
    { label: 'Tint', icon: 'mdi:water-outline', path: PATHS.OPERATIONS.TINT },
    { label: 'Hard Coat', icon: 'mdi:shield-outline', path: PATHS.OPERATIONS.HARD_COAT },
    { label: 'ARC', icon: 'mdi:layers-outline', path: PATHS.OPERATIONS.ARC },
    { label: 'QC', icon: 'mdi:clipboard-check-outline', path: PATHS.OPERATIONS.QC },
    { label: 'Fitting', icon: 'mdi:ruler-square', path: PATHS.OPERATIONS.FITTING },
    { label: 'Dispatch', icon: 'mdi:truck-delivery-outline', path: PATHS.OPERATIONS.DISPATCH },
    { label: 'DMS', icon: 'mdi:file-document-outline', path: PATHS.OPERATIONS.DMS },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const [openSubmenus, setOpenSubmenus] = useState({});

    // Filtered nav items based on permissions
    const filteredNavItems = useMemo(() => {
        return navItems
            .map(item => {
                if (item.subItems) {
                    const filteredSubItems = item.subItems.filter(sub => hasAccess(sub.path, user));
                    if (filteredSubItems.length === 0) return null;
                    return { ...item, subItems: filteredSubItems };
                }
                return hasAccess(item.path, user) ? item : null;
            })
            .filter(Boolean);
    }, [user]);

    // Auto-open submenus on route change
    useEffect(() => {
        const newOpenSubmenus = {};
        filteredNavItems.forEach(item => {
            if (item.subItems?.some(sub => sub.path === location.pathname)) {
                newOpenSubmenus[item.label] = true;
            }
        });
        setOpenSubmenus(prev => ({ ...prev, ...newOpenSubmenus }));
    }, [location.pathname, filteredNavItems]);

    const toggleSubmenu = (label) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            dispatch(logOut());
        }
    };

    const isParentActive = (item) => {
        return item.subItems?.some(sub => sub.path === location.pathname);
    };

    return (
        <>
            <aside
                className={`fixed top-0 left-0 h-screen bg-white shadow-2xl z-50 flex flex-col justify-between transition-transform duration-300
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        `}
            >
                {/* Logo */}
                <div className="py-2 md:py-6 flex justify-center ">
                    <img src={logo} alt="Visual Eyes" className="w-full h-[60px] md:h-[85px] object-cover" />
                </div>

                {/* Menu */}
                <nav className="mt-4 px-3 space-y-1 flex-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    {filteredNavItems.map((item) => (
                        <div key={item.label}>
                            {item.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(item.label)}
                                        className={`w-full flex items-center justify-between px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer
                                            ${isParentActive(item)
                                                ? 'bg-amber-400 text-white shadow'
                                                : openSubmenus[item.label] ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}
                                        `}
                                    >
                                        <div className="flex items-center text-xl gap-3">
                                            <Icon icon={item.icon} className="w-5 h-5" />
                                            {item.label}
                                        </div>
                                        <Icon
                                            icon="ic:baseline-play-arrow"
                                            className={`w-4 h-4 transition-transform duration-200 ${openSubmenus[item.label] ? 'rotate-90' : ''}`}
                                        />
                                    </button>

                                    {/* Submenu */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openSubmenus[item.label] ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                        <div className="bg-gray-50 rounded-2xl py-2 px-2 ml-4 space-y-1 border-l-2 border-amber-200">
                                            {item.subItems.map((subItem) => (
                                                <NavLink
                                                    key={subItem.path}
                                                    to={subItem.path}
                                                    className={({ isActive }) =>
                                                        `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition
                                                        ${isActive
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                                        }`
                                                    }
                                                >
                                                    {subItem.label}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center justify-between px-4 py-2 rounded-full text-sm font-medium transition
                                        ${isActive
                                            ? 'bg-amber-400 text-white shadow'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <div className="flex items-center text-xl gap-3">
                                        <Icon icon={item.icon} className="w-5 h-5" />
                                        {item.label}
                                    </div>
                                    <Icon icon="ic:baseline-play-arrow" className="w-4 h-4 opacity-60" />
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="flex items-start justify-between w-full mt-auto px-4 space-y-2">
                    <button onClick={handleLogout} className="flex items-center gap-3 text-amber-500 font-semibold hover:text-amber-600 w-full">
                        <Icon icon="mdi:logout" className="w-5 text-black h-5" />
                        LogOut
                    </button>
                    <button className="flex items-center gap-3 text-amber-500 font-semibold hover:text-amber-600 w-full">
                        <Icon icon="mdi:help-circle-outline" className="w-5 text-black h-5" />
                        Help
                    </button>
                </div>
            </aside>

            {/* Edge Toggle Button (like Figma) */}
            <button
                onClick={toggleSidebar}
                className={`fixed top-20 md:top-1/2 z-50 bg-amber-400 text-white w-6 h-10 md:w-8 md:h-12 rounded-r-xl shadow-md flex items-center justify-center -translate-y-1/2 transition-all duration-300
                    ${isOpen ? 'left-64' : 'left-0'}
                `}
                aria-label="Toggle Sidebar"
            >
                <Icon icon={isOpen ? 'mdi:chevron-left' : 'mdi:chevron-right'} className="w-6 h-6" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
};

export default Sidebar;
