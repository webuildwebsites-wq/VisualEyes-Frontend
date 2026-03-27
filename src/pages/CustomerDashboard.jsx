import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { Icon } from '@iconify/react';

const CustomerDashboard = () => {
    const user = useSelector(selectCurrentUser);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/2"></div>
                
                <div className="relative z-10 max-w-3xl">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Welcome back, {user?.shopName || user?.ownerName || 'Valued Partner'}! 👋</h1>
                    <p className="text-amber-100 text-lg font-medium opacity-90 max-w-xl">
                        Manage your orders, view account details, and track your recent activity from your dedicated Customer Portal.
                    </p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100 shadow-inner">
                        <Icon icon="mdi:package-variant-closed" className="text-3xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Orders</p>
                        <p className="text-2xl font-black text-gray-800 tracking-tighter mt-1">0</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 shadow-inner">
                        <Icon icon="mdi:finance" className="text-3xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Limit</p>
                        <p className="text-2xl font-black text-gray-800 tracking-tighter mt-1">₹{user?.creditLimit?.toLocaleString() || '0'}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-500 flex items-center justify-center border border-gray-200 shadow-inner">
                        <Icon icon="mdi:account-cash" className="text-3xl" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Credit Used</p>
                        <p className="text-2xl font-black text-gray-800 tracking-tighter mt-1">₹{user?.creditUsed?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>
            
            {/* Account Information Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight mb-6 flex items-center gap-2">
                        <Icon icon="mdi:card-account-details-outline" className="text-amber-500 text-2xl" />
                        Account Details
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Customer Code</span>
                            <span className="text-sm font-black text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">{user?.customerCode || '---'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Business Email</span>
                            <span className="text-sm font-semibold text-gray-800">{user?.businessEmail || '---'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Contact Phone</span>
                            <span className="text-sm font-semibold text-gray-800">{user?.mobileNo1 || '---'}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Zone / Region</span>
                            <span className="text-sm font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">{user?.zone?.name || '---'}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-800 tracking-tight mb-6 flex items-center gap-2">
                        <Icon icon="mdi:map-marker-radius-outline" className="text-blue-500 text-2xl" />
                        Primary Billing Address
                    </h3>
                    {user?.billToAddress ? (
                        <div className="bg-blue-50/50 p-6 rounded-[1.5rem] border border-blue-100/50">
                            <p className="font-bold text-gray-800 text-sm mb-3">{user.billToAddress.branchName || user.firmName}</p>
                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">{user.billToAddress.address}</p>
                            <p className="text-sm text-gray-600 font-medium">{user.billToAddress.city}, {user.billToAddress.state}</p>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">{user.billToAddress.country} - {user.billToAddress.zipCode}</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-[1.5rem] border border-dashed border-gray-200">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">No address found</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
