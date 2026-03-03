import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAllCustomers, getCustomerById, getCustomerConfigs } from '../services/customerService';
import { toast } from 'react-toastify';
import { PATHS } from '../routes/paths';
import { useNavigate } from 'react-router-dom';

const CustomerList = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState({ customerTypes: [] });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        shopName: '',
        customerType: '',
        status: '',
        createdByDepartment: '',
        fromDate: '',
        toDate: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    const fetchConfigs = async () => {
        try {
            const data = await getCustomerConfigs();
            setConfigs(data);
        } catch (error) {
            console.error('Error fetching configs:', error);
        }
    };

    const fetchCustomers = async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            // Remove empty filters
            const activeFilters = Object.fromEntries(
                Object.entries(currentFilters).filter(([_, v]) => v !== '')
            );
            const response = await getAllCustomers(page, 10, activeFilters);
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
        fetchConfigs();
    }, []);

    // Debounce Search for Shop Name
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, shopName: searchTerm }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch customers when any filter changes
    useEffect(() => {
        fetchCustomers(1, filters);
    }, [filters]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            shopName: '',
            customerType: '',
            status: '',
            createdByDepartment: '',
            fromDate: '',
            toDate: ''
        });
    };

    const emptyRowsCount = Math.max(0, 10 - customers.length);

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-4">
            {/* Filter Bar */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100/80 flex flex-col gap-6 ">
                <div className="flex flex-wrap items-center justify-between gap-y-8 gap-x-6 items-start justify-start">
                    <div className="flex flex-wrap items-center gap-6 flex-1 ">
                        {/* Search */}
                        <div className="flex flex-col gap-2 min-w-[240px] flex-1 lg:flex-none">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-5">Search Shop</span>
                            <FilterInput
                                placeholder="Start typing shop name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon="mdi:store-search"
                            />
                        </div>

                        {/* Customer Type */}
                        <div className="flex flex-col gap-2 min-w-[180px] flex-1 lg:flex-none">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-5">Customer Type</span>
                            <FilterSelect
                                placeholder="All Types"
                                value={filters.customerType}
                                onChange={(e) => setFilters({ ...filters, customerType: e.target.value })}
                                options={configs.customerTypes.map(c => ({ label: c.name, value: c._id }))}
                                icon="mdi:account-group"
                            />
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-2 min-w-[160px] flex-1 lg:flex-none">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-5">Status</span>
                            <FilterSelect
                                placeholder="All Status"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' }
                                ]}
                                icon="mdi:checkbox-blank-circle-outline"
                            />
                        </div>

                        {/* Done By */}
                        <div className="flex flex-col gap-2 min-w-[180px] flex-1 lg:flex-none">
                            <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-5">Handled By</span>
                            <FilterSelect
                                placeholder="By Department"
                                value={filters.createdByDepartment}
                                onChange={(e) => setFilters({ ...filters, createdByDepartment: e.target.value })}
                                options={[
                                    { label: 'Superadmin', value: 'SUPERADMIN' },
                                    { label: 'Sales', value: 'SALES' },
                                    { label: 'Finance', value: 'FINANCE' }
                                ]}
                                icon="mdi:account-tie"
                            />
                        </div>
                    </div>

                    {/* Date Picker Section */}
                    <div className="flex flex-col gap-2 min-w-[320px] ">
                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-5">Registration Period</span>
                        <div className="relative flex items-center bg-gray-50/80 rounded-full border border-gray-100 px-6 py-2.5 shadow-inner group focus-within:bg-white focus-within:border-amber-500/50 transition-all duration-300">
                            <Icon icon="mdi:calendar-range" className="text-gray-400 text-lg mr-3 group-focus-within:text-amber-500" />
                            <div className="flex items-center gap-3 w-full">
                                <input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                                    className="text-xs text-gray-600 outline-none bg-transparent cursor-pointer font-bold w-full hover:text-amber-600 transition-colors"
                                />
                                <span className="text-gray-300 text-[10px] font-black uppercase">to</span>
                                <input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                                    className="text-xs text-gray-600 outline-none bg-transparent cursor-pointer font-bold w-full hover:text-amber-600 transition-colors"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Reset Button */}

                </div>
                <div className="flex items-end self-end mb-1">
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 text-gray-400 hover:text-amber-600 px-5 py-2.5 rounded-full hover:bg-amber-50 transition-all duration-300 font-black text-[10px] uppercase tracking-widest group border border-transparent hover:border-amber-100 shadow-sm hover:shadow-md"
                    >
                        <Icon icon="mdi:refresh" className="text-lg group-hover:rotate-180 transition-transform duration-700" />
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100 min-h-[500px]">
                {loading ? (
                    <div className="flex justify-center items-center h-[500px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-y-auto max-h-[1000px] custom-scrollbar">
                        <table className="w-full border-collapse min-w-[1240px]">
                            <thead>
                                <tr className="bg-amber-500 text-white">
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Cust. ID</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Shop Name</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Type</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Email</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Phone</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Done By</th>
                                    <th className="py-4 px-4 font-semibold text-xs text-center uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {customers.map((cust) => (
                                    <tr key={cust._id} className="border-b border-gray-100 last:border-b-0 hover:bg-amber-50/10 transition-colors h-14">
                                        <td className="px-4 py-2 text-center text-[11px] font-bold border-r border-gray-50 text-amber-600">{cust?.username || cust?._id?.slice(-8) || '---'}</td>
                                        <td className="px-6 py-2 text-center text-xs font-medium border-r border-gray-50 text-gray-800">{cust?.shopName || '---'}</td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-50">{cust?.CustomerType?.name || cust?.CustomerType || '---'}</td>
                                        <td className="px-6 py-2 text-center text-xs border-r border-gray-50">{cust.emailId || '---'}</td>
                                        <td className="px-6 py-2 text-center text-xs border-r border-gray-50">{cust.mobileNo1 || '---'}</td>
                                        <td className="px-4 py-2 text-center border-r border-gray-50">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${cust.status?.toLowerCase() === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {cust.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-center text-xs border-r border-gray-50 font-semibold">{cust?.createdByDepartment || 'John Doe'}</td>
                                        <td className="px-4 py-2 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                                                    onClick={() => handleViewDetails(cust._id)}
                                                    title="View Details"
                                                >
                                                    <Icon icon="mdi:eye" className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                                                    title="Edit"
                                                >
                                                    <Icon icon="mdi:pencil" className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete"
                                                >
                                                    <Icon icon="mdi:trash-can" className="w-5 h-5" />
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

const FilterSelect = ({ placeholder, value, onChange, options = [], icon }) => (
    <div className="relative flex items-center bg-gray-50/80 rounded-full border border-gray-100 px-5 py-2.5 focus-within:border-amber-500/50 focus-within:bg-white focus-within:shadow-md transition-all duration-300 min-w-[170px] group shadow-inner">
        {icon && <Icon icon={icon} className="text-gray-400 text-lg mr-3 group-focus-within:text-amber-500 transition-colors" />}
        <select
            value={value}
            onChange={onChange}
            className="text-xs text-gray-600 outline-none w-full bg-transparent appearance-none cursor-pointer pr-6 font-bold"
        >
            <option value="">{placeholder}</option>
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="absolute right-5 pointer-events-none text-gray-300 group-hover:text-amber-500 transition-colors">
            <Icon icon="mdi:chevron-down" className="text-base" />
        </div>
    </div>
);

const FilterInput = ({ placeholder, value, onChange, icon }) => (
    <div className="relative flex items-center bg-gray-50/80 rounded-full border border-gray-100 px-5 py-2.5 focus-within:border-amber-500/50 focus-within:bg-white focus-within:shadow-md transition-all duration-300 min-w-[220px] group shadow-inner">
        {icon && <Icon icon={icon} className="text-gray-400 text-lg mr-3 group-focus-within:text-amber-500 transition-colors" />}
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="text-xs text-gray-600 outline-none w-full bg-transparent font-bold placeholder:text-gray-300 placeholder:font-medium"
        />
    </div>
);

export default CustomerList;
