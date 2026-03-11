import React from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';

const Topbar = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    console.log('user', user)
    return (
        <div className="w-full bg-amber-500 text-white shadow-md p-3 md:p-4 md:px-8 rounded-b-2xl md:rounded-lg flex justify-between items-center transition-all">
            <div className="font-semibold text-sm md:text-lg flex items-center gap-2">
                <span className="truncate max-w-[200px] md:max-w-none">{user?.employeeName} | {user?.Department?.name}</span>
            </div>
            <div className="relative cursor-pointer shrink-0">
                <Icon icon="mdi:bell" className="w-5 h-5 md:w-6 md:h-6" />
                <span className="absolute top-0 right-0 block h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ring-2 ring-amber-500 bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
            </div>
        </div>
    );
};

export default Topbar;
