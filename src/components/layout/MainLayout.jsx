import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import mainBg from '../../assets/main-bg.svg';
import digiOpticsLogo from '../../assets/DigiOptics-logo.png';

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768); 
    const navigate = useNavigate();
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Auto-close sidebar on mobile when navigating
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 relative z-10     ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}        `}
            >
                <div className="p-2 md:p-8 pb-0">
                    <Topbar />
                </div>
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 md:p-8 pt-4 relative flex flex-col">
                    <div className="flex-1">
                        <Outlet />
                    </div>

                    {/* Footer */}
                    <footer className="mt-8 py-4 flex flex-col items-center justify-center opacity-60 hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-gray-400 tracking-wider uppercase">
                            Powered by 
                            <img src={digiOpticsLogo} alt="DigiOptics" className="h-5 md:h-6 object-contain filter grayscale hover:grayscale-0 transition-all duration-300" />
                        </div>
                    </footer>

                    {/* Floating Action Button (New Order) */}
                    <button
                        onClick={() => navigate('/new-order')}
                        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-3 md:p-4 shadow-lg shadow-amber-500/40 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-300 z-50 flex items-center justify-center transition-all duration-300"
                        title="Create New Order"
                    >
                        <Icon icon="mdi:plus" className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
