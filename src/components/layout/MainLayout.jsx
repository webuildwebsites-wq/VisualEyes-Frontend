import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mainBg from '../../assets/main-bg.svg';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default closed on mobile
    const navigate = useNavigate();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden relative">
            {/* Background Image Layer */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `url(${mainBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%)'
                }}
            ></div>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 relative z-10     ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}        `}            >
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
                    <Topbar />
                    <Outlet />

                    {/* Floating Action Button (New Order) */}
                    <button
                        onClick={() => navigate('/new-order')}
                        className="fixed bottom-8 right-8 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-4 shadow-lg shadow-amber-500/40 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 z-50 flex items-center justify-center"
                        title="Create New Order"
                    >
                        <Icon icon="mdi:plus" className="w-8 h-8" />
                    </button>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
