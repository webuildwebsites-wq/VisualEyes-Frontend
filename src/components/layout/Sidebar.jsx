import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.svg';
import { useDispatch } from 'react-redux';
import { logOut } from '../../store/slices/authSlice';
import { logoutUser } from '../../services/authService';

const navItems = [
    { label: 'Dashboard', icon: 'mdi:view-dashboard-outline', path: '/' },
    { label: 'Register User', icon: 'mdi:person-add', path: '/register' },
    {
        label: 'Customer Care',
        icon: 'mdi:face-agent',
        // path: '/customer-care', // Removed path for parent
        subItems: [
            { label: 'Register Customer', path: '/customer-care/register' },
            { label: 'All Customers', path: '/customer-care/list' }
        ]
    },
    { label: 'Stores', icon: 'mdi:store', path: '/stores' },
    { label: 'Surfacing', icon: 'mdi:texture-box', path: '/surfacing' },
    { label: 'Tint', icon: 'mdi:water-opacity', path: '/tint' },
    { label: 'Hard Coat', icon: 'simple-icons:nanostores', path: '/hard-coat' },
    { label: 'ARC', icon: 'file-icons:arc', path: '/arc' },
    { label: 'QC', icon: 'mdi:clipboard-check-outline', path: '/qc' },
    { label: 'Fitting', icon: 'mdi:ruler-square', path: '/fitting' },
    { label: 'Dispatch', icon: 'mdi:truck-delivery-outline', path: '/dispatch' },
    { label: 'DMS', icon: 'mdi:file-document-outline', path: '/dms' },
    { label: 'F&A', icon: 'mdi:finance', path: '/finance' },
    { label: 'Reports', icon: 'mdi:chart-bar', path: '/reports' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const dispatch = useDispatch();
    const [openSubmenus, setOpenSubmenus] = useState({});

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

    return (
        <>
            <aside
                className={`fixed top-0 left-0 h-screen bg-white shadow-2xl z-50 flex flex-col justify-between transition-transform duration-300
        ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        `}
            >
                {/* Logo */}
                <div className="py-6 flex justify-center ">
                    <img src={logo} alt="Visual Eyes" className="w-full h-[85px] object-cover" />
                </div>

                {/* Menu */}
                <nav className="mt-4 px-3 space-y-1 flex-1 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <div key={item.label}>
                            {item.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleSubmenu(item.label)}
                                        className={`w-full flex items-center justify-between px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer
                                            ${openSubmenus[item.label] ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'}
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
                className={`fixed top-1/2 z-50 bg-amber-400 text-white w-8 h-12 rounded-r-xl shadow-md flex items-center justify-center -translate-y-1/2 transition-all duration-300
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
