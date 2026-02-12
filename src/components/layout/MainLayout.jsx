import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';
import mainBg from '../../assets/main-bg.svg';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default closed on mobile

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
                className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 relative z-10     ${isSidebarOpen ? 'md:ml-64' : 'md:ml-0'}        `}            >
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                    <Topbar />
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
