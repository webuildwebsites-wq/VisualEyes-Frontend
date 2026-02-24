import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAllEmployees, getEmployeeById } from '../services/employeeService';
import { toast } from 'react-toastify';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    console.log(employees, 'employees')
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

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

    const handleViewDetails = async (id) => {
        setViewLoading(true);
        try {
            const response = await getEmployeeById(id);
            if (response.success) {
                setSelectedEmployee(response.data.user);
            }
        } catch {
            toast.error('Failed to fetch employee details');
        } finally {
            setViewLoading(false);
        }
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
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Employee Name</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Department</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Type</th>
                                    <th className="py-4 px-6 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Email</th>
                                    <th className="py-4 px-6 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Phone</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Lab</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0">Region</th>
                                    <th className="py-4 px-4 font-semibold text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {employees.map((emp) => (
                                    <tr className="border-b border-gray-100 last:border-b-0 hover:bg-amber-50/30 transition-colors h-14">
                                        <td className="px-4 py-2 text-center text-xs font-medium border-r border-gray-100">{emp?.employeeName || '---'}</td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">{emp?.Department?.name || '---'}</td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">{emp.EmployeeType?.name || '---'}</td>
                                        <td className="px-6 py-2 text-center text-xs border-r border-gray-100">{emp.email || '---'}</td>
                                        <td className="px-6 py-2 text-center text-xs border-r border-gray-100">{emp.phone || '---'}</td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${emp.isActive ? 'text-green-600 bg-green-100' : 'text-red-500 bg-red-100'}`}>
                                                {emp.isActive ? (emp.lab?.name || 'ACTIVE') : 'INACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">{emp?.region?.name || '---'}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button className="text-gray-400 hover:text-amber-500 transition-colors">
                                                    <Icon icon="mdi:content-copy" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-amber-500 transition-colors"
                                                    onClick={() => handleViewDetails(emp._id)}
                                                >
                                                    <Icon icon="mdi:eye-outline" className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {Array(emptyRowsCount).fill(0).map((_, i) => (
                                    <tr key={`empty-${i}`} className="border-b border-gray-100 last:border-b-0 h-14">
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
                                        <td className="border-r border-gray-100 last:border-r-0"></td>
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

            {/* Employee Detail Modal */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
                        {/* Modal Header */}
                        <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold">Employee Details</h2>
                            <button onClick={() => setSelectedEmployee(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <Icon icon="mdi:close" className="text-2xl" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Employee Name" value={selectedEmployee.employeeName} />
                                <DetailItem label="Email" value={selectedEmployee.email} />
                                <DetailItem label="Phone" value={selectedEmployee.phone} />
                                <DetailItem label="User Type" value={selectedEmployee.EmployeeType} />
                                <DetailItem label="Role" value={selectedEmployee.Role} />
                                <DetailItem label="Department" value={selectedEmployee.Department || '---'} />
                                <DetailItem label="Lab" value={selectedEmployee.lab || '---'} />
                                <DetailItem label="Region" value={selectedEmployee.region || '---'} />
                                <DetailItem label="Country" value={selectedEmployee.country} />
                                <DetailItem label="Pincode" value={selectedEmployee.pincode} />
                                <div className="md:col-span-2">
                                    <DetailItem label="Address" value={selectedEmployee.address} />
                                </div>
                                <DetailItem label="Status" value={selectedEmployee.isActive ? 'Active' : 'Inactive'} status />
                                <DetailItem label="Joined On" value={new Date(selectedEmployee.profile?.dateOfJoining).toLocaleDateString()} />
                            </div>

                            {/* Verification Documents */}
                            {(selectedEmployee.aadharCard || selectedEmployee.panCard) && (
                                <div className="mt-8 pt-8 border-t border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 italic underline decoration-amber-500 underline-offset-8">Verification Documents</h3>
                                    <div className="flex gap-6">
                                        {selectedEmployee.aadharCard && (
                                            <a href={selectedEmployee.aadharCard} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                                                <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                                    <Icon icon="mdi:card-account-details-outline" className="text-3xl text-amber-500" />
                                                </div>
                                                <span className="text-xs font-bold text-amber-600">Aadhar Card</span>
                                            </a>
                                        )}
                                        {selectedEmployee.panCard && (
                                            <a href={selectedEmployee.panCard} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                                                <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
                                                    <Icon icon="mdi:card-text-outline" className="text-3xl text-amber-500" />
                                                </div>
                                                <span className="text-xs font-bold text-amber-600">PAN Card</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* View Loading Overlay */}
            {viewLoading && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/10 backdrop-blur-[2px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            )}
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
