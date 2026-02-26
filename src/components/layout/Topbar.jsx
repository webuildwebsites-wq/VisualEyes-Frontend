import React from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';

const Topbar = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    console.log('user', user)
    return (
        <div className="w-full bg-amber-500 text-white shadow-md p-4 px-8 rounded-b-lg md:rounded-lg flex justify-between items-center">
            <div className="font-semibold text-lg flex items-center gap-2">
                <span className=" decoration-2 underline-offset-4">{user?.employeeName} | {user?.Department?.name}</span>
            </div>
            <div className="relative cursor-pointer">
                <Icon icon="mdi:bell" className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-amber-500 bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
            </div>
        </div>
    );
};

export default Topbar;
