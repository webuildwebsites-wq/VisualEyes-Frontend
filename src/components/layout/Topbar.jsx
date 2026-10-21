import React from 'react';
import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
    const user = useSelector((state) => state.auth.user)
    const navigate = useNavigate()

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/welcome');
        }
    };

    return (
        <div className="w-full bg-amber-500 text-white shadow-md p-3 md:p-4 md:px-8 rounded-b-2xl md:rounded-lg flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 bg-white text-amber-500 px-3 py-1.5 rounded-full hover:bg-amber-50 transition-all shadow-md font-bold text-xs md:text-sm active:scale-95"
                >
                    <Icon icon="mdi:arrow-left" className="w-5 h-5" />
                    <span>BACK</span>
                </button>
                
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm md:text-lg hidden sm:inline">
                        {user?.employeeName || 'User'}
                    </span>
                    <span className="hidden sm:inline opacity-60">|</span>
                    <span className="text-xs md:text-sm opacity-90 truncate max-w-[100px] md:max-w-none">
                        {user?.Department?.name || 'Department'}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer shrink-0">
                    <Icon icon="mdi:bell" className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="absolute top-0 right-0 block h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ring-2 ring-amber-500 bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                </div>
            </div>
        </div>
    );
};

export default Topbar;



