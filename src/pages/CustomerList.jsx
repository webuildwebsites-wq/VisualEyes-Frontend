import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAllCustomers, getCustomerById } from '../services/customerService';
import { toast } from 'react-toastify';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    console.log(customers, 'customers')
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    const fetchCustomers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getAllCustomers(page);
            if (response.success) {
                setCustomers(response.data.customers || []);
                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1 });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        setViewLoading(true);
        try {
            const response = await getCustomerById(id);
            if (response.success) {
                setSelectedCustomer(response.data.customer);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch customer details');
        } finally {
            setViewLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const emptyRowsCount = Math.max(0, 10 - customers.length);

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
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">Shop Name</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">Owner Name</th>
                                    {/* <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">Type</th> */}
                                    <th className="py-4 px-6 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">Email</th>
                                    <th className="py-4 px-6 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">Phone</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">City</th>
                                    <th className="py-4 px-4 font-semibold text-sm border-r border-amber-600/20 last:border-r-0 text-center">Order Mode</th>
                                    <th className="py-4 px-4 font-semibold text-sm text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {customers.map((cust) => (
                                    <tr key={cust._id} className="border-b border-gray-100 last:border-b-0 hover:bg-amber-50/30 transition-colors h-14">
                                        <td className="px-4 py-2 text-center text-xs font-medium border-r border-gray-100">{cust?.shopName || '---'}</td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">{cust?.ownerName || '---'}</td>
                                        {/* <td className="px-4 py-2 text-center text-xs border-r border-gray-100">{cust?.CustomerType?.name || '---'}</td> */}
                                        <td className="px-6 py-2 text-center text-xs border-r border-gray-100">{cust.emailId || '---'}</td>
                                        <td className="px-6 py-2 text-center text-xs border-r border-gray-100">{cust.mobileNo1 || '---'}</td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">
                                            {cust.address?.[0]?.city || '---'}
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-100">
                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                                                {cust.orderMode || '---'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-3">
                                                <button
                                                    className="text-gray-400 hover:text-amber-500 transition-colors"
                                                    onClick={() => handleViewDetails(cust._id)}
                                                >
                                                    <Icon icon="mdi:eye-outline" className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {Array(emptyRowsCount).fill(0).map((_, i) => (
                                    <tr key={`empty-${i}`} className="border-b border-gray-100 last:border-b-0 h-14">
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
                                        <td className="border-r border-gray-100"></td>
                                        <td></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-4 border-t border-gray-100">
                        <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => fetchCustomers(pagination.currentPage - 1)}
                            className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-amber-50 transition-colors"
                        >
                            <Icon icon="mdi:chevron-left" className="text-xl" />
                        </button>
                        <span className="text-sm font-medium">Page {pagination.currentPage} of {pagination.totalPages}</span>
                        <button
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => fetchCustomers(pagination.currentPage + 1)}
                            className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-amber-50 transition-colors"
                        >
                            <Icon icon="mdi:chevron-right" className="text-xl" />
                        </button>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col scale-in-center">
                        <div className="bg-amber-500 p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Icon icon="mdi:account-details" className="text-2xl" />
                                <h2 className="text-xl font-bold">Customer Details: {selectedCustomer.shopName}</h2>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                                <Icon icon="mdi:close" className="text-2xl" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 pb-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {/* Section: Basic Info */}
                                <div className="space-y-4 md:col-span-3">
                                    <h3 className="text-amber-500 font-bold uppercase text-xs tracking-widest border-b pb-2">Basic Information</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <DetailItem label="Shop Name" value={selectedCustomer.shopName} />
                                        <DetailItem label="Owner Name" value={selectedCustomer.ownerName} />
                                        <DetailItem label="Customer Type" value={selectedCustomer.CustomerType} />
                                        <DetailItem label="Order Mode" value={selectedCustomer.orderMode} />
                                        <DetailItem label="Email" value={selectedCustomer.emailId} />
                                        <DetailItem label="Mobile 1" value={selectedCustomer.mobileNo1} />
                                        <DetailItem label="Mobile 2" value={selectedCustomer.mobileNo2} />
                                        <DetailItem label="Landline" value={selectedCustomer.landlineNo} />
                                    </div>
                                </div>

                                {/* Section: Configuration */}
                                <div className="space-y-4 md:col-span-3">
                                    <h3 className="text-amber-500 font-bold uppercase text-xs tracking-widest border-b pb-2">Configuration & Logistics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <DetailItem label="Username" value={selectedCustomer.username} />
                                        <DetailItem label="Zone" value={selectedCustomer.zone} />
                                        <DetailItem label="Flat Fitting" value={selectedCustomer.hasFlatFitting ? 'YES' : 'NO'} />
                                        <DetailItem label="Sales Person" value={selectedCustomer.salesPerson} />
                                        <DetailItem label="Plant" value={selectedCustomer.plant} />
                                        <DetailItem label="Lab" value={selectedCustomer.lab} />
                                        <DetailItem label="Fitting Centre" value={selectedCustomer.fittingCenter} />
                                        <DetailItem label="Credit Limit" value={selectedCustomer.creditLimit} />
                                        <DetailItem label="Credit Days" value={selectedCustomer.creditDays} />
                                        <DetailItem label="Courier" value={selectedCustomer.courierName} />
                                        <DetailItem label="Courier Time" value={selectedCustomer.courierTime} />
                                    </div>
                                </div>

                                {/* Section: Addresses */}
                                <div className="space-y-4 md:col-span-3">
                                    <h3 className="text-amber-500 font-bold uppercase text-xs tracking-widest border-b pb-2">Registered Addresses</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedCustomer.address?.map((addr, idx) => (
                                            <div key={idx} className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                                <p className="font-bold text-gray-800 text-sm mb-2 italic">Address {idx + 1}</p>
                                                <p className="text-xs text-gray-600 mb-1">{addr.address1}</p>
                                                <p className="text-xs text-gray-600 mb-2">{addr.city}, {addr.state}, {addr.country} - {addr.zipCode}</p>
                                                <div className="flex justify-between text-[10px] font-bold text-amber-600">
                                                    <span>Contact: {addr.contactPerson}</span>
                                                    <span>{addr.billingCurrency}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Section: Documents */}
                                <div className="space-y-4 md:col-span-3">
                                    <h3 className="text-amber-500 font-bold uppercase text-xs tracking-widest border-b pb-2">Verification Documents</h3>
                                    <div className="flex flex-wrap gap-8">
                                        <DocumentChip label="GST Certificate" url={selectedCustomer.GSTCertificateImg} />
                                        <DocumentChip label="Aadhar Card" url={selectedCustomer.aadharImage} />
                                        <DocumentChip label="PAN Card" url={selectedCustomer.panImage} />
                                    </div>
                                </div>
                            </div>
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

const DetailItem = ({ label, value }) => (
    <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{label}</p>
        <p className="text-sm font-semibold text-gray-700">{value || '---'}</p>
    </div>
);

const DocumentChip = ({ label, url }) => (
    <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase font-bold text-gray-400">{label}</span>
        {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 hover:bg-amber-100 transition-colors">
                <Icon icon="mdi:file-document-outline" className="text-xl" />
                <span className="text-xs font-bold uppercase">View Document</span>
            </a>
        ) : (
            <div className="flex items-center gap-2 bg-gray-50 text-gray-400 px-4 py-2 rounded-xl border border-dashed border-gray-200">
                <Icon icon="mdi:file-document-outline" className="text-xl" />
                <span className="text-xs font-bold uppercase italic">Not Uploaded</span>
            </div>
        )}
    </div>
);

export default CustomerList;
