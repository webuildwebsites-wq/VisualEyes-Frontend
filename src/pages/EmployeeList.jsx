import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAllEmployees, getEmployeeById } from '../services/employeeService';
import { toast } from 'react-toastify';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    console.log(employees, 'employees')
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.info("Username copied to clipboard", {
            position: "bottom-center",
            autoClose: 1500,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "colored",
        });
    };

    const fetchEmployees = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getAllEmployees(page);
            if (response.success) {
                setEmployees(response.data.users);
                setPagination(response.data.pagination);
            }
        } catch {
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (id) => {
        toggleRow(id);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Helper for empty rows to maintain grid structure
    const emptyRowsCount = Math.max(0, 10 - employees.length);

    return (
        <div className="flex flex-col items-center">
            {/* Table Container */}
            <div className="w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 min-h-[500px]">
                {loading ? (
                    <div className="flex justify-center items-center h-[500px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-amber-500 text-white">
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">S.No</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Name</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Department</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Type</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Phone</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-4 font-semibold text-xs text-center uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {employees.map((emp) => (
                                    <React.Fragment key={emp._id}>
                                        <tr
                                            className={`border-b border-gray-100 last:border-b-0 hover:bg-amber-50/20 transition-all h-16 cursor-pointer ${expandedRows.has(emp._id) ? 'bg-amber-50/10' : ''}`}
                                            onClick={() => toggleRow(emp._id)}
                                        >
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <span className="text-xs font-black text-amber-600 font-mono tracking-tighter">
                                                    #{emp.serialNumber || '---'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 text-center border-r border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-800 tracking-tight">{emp?.employeeName || '---'}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{emp?.username || '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                                    {emp?.Department?.name || emp?.Department || '---'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50 uppercase text-[10px] font-black tracking-widest text-gray-500">
                                                {emp.EmployeeType?.name || emp.EmployeeType || '---'}
                                            </td>
                                            <td className="px-6 py-2 text-center border-r border-gray-50 text-xs font-semibold text-gray-600">
                                                {emp.phone || '---'}
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${emp.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                                    {emp.isActive ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center relative" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setActiveActionMenu(activeActionMenu === emp._id ? null : emp._id)}
                                                    className={`p-2 rounded-xl transition-all ${activeActionMenu === emp._id ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                                >
                                                    <Icon icon="mdi:dots-vertical" className="w-6 h-6" />
                                                </button>

                                                {/* Absolute Action Dropdown */}
                                                {activeActionMenu === emp._id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-[60]"
                                                            onClick={() => setActiveActionMenu(null)}
                                                        />
                                                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-[70] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-right-4 duration-200">
                                                            <button
                                                                onClick={() => { handleViewDetails(emp._id); setActiveActionMenu(null); }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                                            >
                                                                <Icon icon="mdi:eye" className="text-lg" />
                                                                View
                                                            </button>
                                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-y border-gray-50">
                                                                <Icon icon="mdi:pencil" className="text-lg" />
                                                                Edit
                                                            </button>
                                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors">
                                                                <Icon icon="mdi:trash-can" className="text-lg" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Collapsible Details Row */}
                                        {expandedRows.has(emp._id) && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan="7" className="p-0 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="p-10 border-x-4 border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30">
                                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                                                            {/* Detailed Columns */}
                                                            <div className="space-y-6">
                                                                <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2">Profile Info</h4>
                                                                <DetailItem label="Full Name" value={emp.employeeName} />
                                                                <div className="flex items-center gap-2 group/id cursor-pointer" onClick={(e) => { e.stopPropagation(); copyToClipboard(emp.username); }}>
                                                                    <DetailItem label="Username (Copy)" value={emp.username} />
                                                                    <Icon icon="mdi:content-copy" className="text-amber-400 opacity-0 group-hover/id:opacity-100 transition-opacity mt-4" />
                                                                </div>
                                                                <DetailItem label="Employee Type" value={emp.EmployeeType?.name || emp.EmployeeType} />
                                                                <DetailItem label="Serial No." value={`#${emp.serialNumber}`} />
                                                            </div>

                                                            <div className="space-y-6">
                                                                <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2">Contact</h4>
                                                                <DetailItem label="Email ID" value={emp.email} />
                                                                <DetailItem label="Phone Number" value={emp.phone} />
                                                                <DetailItem label="Account Created" value={new Date(emp.createdAt).toLocaleDateString()} />
                                                            </div>

                                                            <div className="space-y-6">
                                                                <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2">Work & Dep.</h4>
                                                                <DetailItem label="Department" value={emp.Department?.name || emp.Department} />
                                                                <DetailItem label="Sub Roles" value={emp.subRoles?.map(r => r.name).join(', ') || 'None'} />
                                                                <DetailItem label="Lab Access" value={emp.lab?.name || 'All'} />
                                                                <DetailItem label="Access Expiry" value={emp.expiry ? new Date(emp.expiry).toLocaleDateString() : 'Never'} />
                                                            </div>

                                                            <div className="space-y-6 md:col-span-1">
                                                                <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2">Address</h4>
                                                                <DetailItem label="Registered Address" value={emp.address} />
                                                                <DetailItem label="Country" value={emp.country} />
                                                                <DetailItem label="Pincode" value={emp.pincode} />
                                                            </div>

                                                            {/* Documents */}
                                                            <div className="md:col-span-4 mt-6">
                                                                <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2 mb-6">Staff Documents</h4>
                                                                <div className="flex flex-wrap gap-8">
                                                                    <a href={emp.aadharCard} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-4 bg-white border border-amber-100 rounded-2xl hover:shadow-md transition-shadow ${!emp.aadharCard && 'opacity-30 grayscale pointer-events-none'}`}>
                                                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                                                            <Icon icon="mdi:card-account-details-outline" className="text-xl" />
                                                                        </div>
                                                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Aadhar Card</span>
                                                                    </a>
                                                                    <a href={emp.panCard} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-4 bg-white border border-amber-100 rounded-2xl hover:shadow-md transition-shadow ${!emp.panCard && 'opacity-30 grayscale pointer-events-none'}`}>
                                                                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                                                            <Icon icon="mdi:card-text-outline" className="text-xl" />
                                                                        </div>
                                                                        <span className="text-xs font-black text-gray-500 uppercase tracking-widest">PAN Card</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                {Array(emptyRowsCount).fill(0).map((_, i) => (
                                    <tr key={`empty-${i}`} className="border-b border-gray-100 last:border-b-0 h-14">
                                        <td className="border-r border-gray-50 last:border-r-0"></td>
                                        <td className="border-r border-gray-50 last:border-r-0"></td>
                                        <td className="border-r border-gray-50 last:border-r-0"></td>
                                        <td className="border-r border-gray-50 last:border-r-0"></td>
                                        <td className="border-r border-gray-50 last:border-r-0"></td>
                                        <td className="border-r border-gray-50 last:border-r-0"></td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Simple Pagination Controls */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-100">
                        <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => fetchEmployees(pagination.currentPage - 1)}
                            className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-amber-50 transition-colors"
                        >
                            <Icon icon="mdi:chevron-left" className="text-xl" />
                        </button>
                        <span className="text-sm font-medium">Page {pagination.currentPage} of {pagination.totalPages}</span>
                        <button
                            disabled={!pagination.hasNext}
                            onClick={() => fetchEmployees(pagination.currentPage + 1)}
                            className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-amber-50 transition-colors"
                        >
                            <Icon icon="mdi:chevron-right" className="text-xl" />
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

const DetailItem = ({ label, value, status }) => (
    <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
        <p className={`text-sm font-semibold ${status ? (value === 'Active' ? 'text-green-600' : 'text-red-500') : 'text-gray-700'}`}>
            {value || '---'}
        </p>
    </div>
);

export default EmployeeList;
