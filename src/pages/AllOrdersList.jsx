import React, { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { getAllOrders, getOrderConfigs } from '../services/orderService';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { PATHS } from '../routes/paths';
import { useNavigate } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const datePickerStyles = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '9999px',
        backgroundColor: 'rgba(249, 250, 251, 0.8)',
        fontSize: '0.75rem',
        fontWeight: 700,
        height: '42px',
        '& fieldset': {
            borderColor: '#f3f4f6',
        },
        '&:hover fieldset': {
            borderColor: '#f59e0b80',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#f59e0b80',
        },
    },
    '& .MuiInputBase-input': {
        padding: '0 16px',
        color: '#4b5563',
        '&::placeholder': {
            opacity: 1,
            color: '#d1d5db',
        }
    },
    '& .MuiInputAdornment-root': {
        marginRight: '8px'
    }
};

const AllOrdersList = () => {
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [configs, setConfigs] = useState({ brands: [], categories: [] });
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [activeActionMenu, setActiveActionMenu] = useState(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        orderType: '',
        fromDate: '',
        toDate: ''
    });

    const fetchConfigs = async () => {
        try {
            const data = await getOrderConfigs();
            setConfigs(data);
        } catch (error) {
            console.error('Error fetching order configs:', error);
        }
    };

    const fetchOrders = async (page = 1, currentFilters = filters) => {
        setLoading(true);
        try {
            const activeFilters = Object.fromEntries(
                Object.entries(currentFilters).filter(([_, v]) => v !== '')
            );
            const response = await getAllOrders(page, 10, activeFilters);
            if (response.success) {
                setOrders(response.data.orders || []);
                setPagination(response.data.pagination || { currentPage: 1, totalPages: 1 });
            }
        } catch (error) {
            // Error handling with a fallback to empty data for demo/initial purposes
            console.error('Fetch error:', error);
            // toast.error('Failed to load orders - ensure order API is available');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchOrders(1, filters);
    }, [filters]);

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setFilters({
            search: '',
            status: '',
            orderType: '',
            fromDate: '',
            toDate: ''
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDING': 'bg-amber-100 text-amber-700 border-amber-200',
            'CONFIRMED': 'bg-blue-100 text-blue-700 border-blue-200',
            'PROCESSING': 'bg-purple-100 text-purple-700 border-purple-200',
            'SHIPPED': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'DELIVERED': 'bg-green-100 text-green-700 border-green-200',
            'CANCELLED': 'bg-red-100 text-red-700 border-red-200'
        };
        const style = statusMap[status?.toUpperCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
        return `px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${style}`;
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto p-4 animate-in fade-in duration-500">
            {/* Filter Bar */}
            <div className="bg-white p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-gray-100/80 flex flex-col gap-4 md:gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap items-end gap-3 md:gap-6">
                    {/* Search */}
                    <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 lg:min-w-[300px] lg:flex-1">
                        <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2 md:ml-5">Search By Order ID, Shop Name, or Customer</span>
                        <div className="relative group">
                            <Icon icon="mdi:magnify" className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-hover:text-amber-500 transition-colors" />
                            <input
                                placeholder="Order #65432..."
                                className="w-full pl-14 pr-6 py-2.5 rounded-full bg-gray-50/80 border border-gray-100/50 text-[11px] font-black uppercase tracking-widest text-gray-700 focus:bg-white focus:ring-4 focus:ring-amber-50 focus:border-amber-100 transition-all outline-none placeholder:text-gray-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-col gap-1.5 w-full lg:w-auto lg:min-w-[200px]">
                        <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2 md:ml-5">Order Status</span>
                        <div className="relative">
                            <Icon icon="mdi:checkbox-blank-circle-outline" className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <select
                                className="w-full pl-14 pr-10 py-2.5 rounded-full bg-gray-50/80 border border-gray-100/50 text-[11px] font-black uppercase tracking-widest text-gray-700 appearance-none focus:bg-white focus:ring-4 focus:ring-amber-50 transition-all outline-none"
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            >
                                <option value="">All Statuses</option>
                                <option value="PENDING">Pending</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="SHIPPED">Shipped</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Order Period */}
                    <div className="flex flex-col gap-1.5 col-span-1 md:col-span-2 lg:min-w-[380px]">
                        <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] ml-2 md:ml-5">Registration Period</span>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <DatePicker
                                value={filters.fromDate ? dayjs(filters.fromDate) : null}
                                onChange={(newValue) => setFilters({ ...filters, fromDate: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        placeholder: 'From Date',
                                        sx: { ...datePickerStyles, width: '100%' }
                                    }
                                }}
                            />
                            <span className="text-gray-300 text-[10px] font-black uppercase">to</span>
                            <DatePicker
                                value={filters.toDate ? dayjs(filters.toDate) : null}
                                onChange={(newValue) => setFilters({ ...filters, toDate: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        placeholder: 'To Date',
                                        sx: { ...datePickerStyles, width: '100%' }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-end self-end w-full md:w-auto mb-1">
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-amber-600 px-5 py-2.5 rounded-full hover:bg-amber-50 transition-all duration-300 font-black text-[10px] uppercase tracking-widest group border border-transparent hover:border-amber-100 shadow-sm hover:shadow-md w-full md:w-auto"
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
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Order Code</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Customer / Shop</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Date / Time</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Product Type</th>
                                    <th className="py-4 px-6 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Order Total</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Priority</th>
                                    <th className="py-4 px-4 font-semibold text-xs border-r border-amber-600/20 last:border-r-0 text-center uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-4 font-semibold text-xs text-center uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-600">
                                {orders.map((order) => (
                                    <React.Fragment key={order._id}>
                                        <tr
                                            className={`border-b border-gray-100 last:border-b-0 hover:bg-amber-50/20 transition-all h-16 cursor-pointer ${expandedRows.has(order._id) ? 'bg-amber-50/10' : ''}`}
                                            onClick={() => toggleRow(order._id)}
                                        >
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <span className="text-xs font-black text-amber-600 font-mono tracking-tighter uppercase">
                                                    #{order?.orderNumber || order?._id?.slice(-6) || '---'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 text-center border-r border-gray-50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-gray-800 tracking-tight">{order?.customerId?.shopName || '---'}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{order?.customerId?.customerCode || '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-xs font-bold text-gray-700">{dayjs(order?.createdAt).format('DD MMM YYYY')}</span>
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tighter">{dayjs(order?.createdAt).format('hh:mm A')}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                                    {order?.productMode?.toUpperCase() || '---'} {order?.powerMode?.toUpperCase() || ''}
                                                </span>
                                            </td>
                                            <td className="px-6 py-2 text-center border-r border-gray-50">
                                                <span className="text-sm font-black text-gray-800 tracking-tight italic">
                                                    ₹{order?.totalAmount || '0.00'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50">
                                                <div className="flex justify-center gap-1">
                                                    <Icon
                                                        icon="mdi:fire"
                                                        className={`text-lg ${order?.isUrgent ? 'text-red-500 animate-pulse' : 'text-gray-200'}`}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-center border-r border-gray-50 uppercase">
                                                <span className={getStatusBadge(order?.status)}>
                                                    {order?.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-center relative" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => setActiveActionMenu(activeActionMenu === order._id ? null : order._id)}
                                                    className={`p-2 rounded-xl transition-all ${activeActionMenu === order._id ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                                >
                                                    <Icon icon="mdi:dots-vertical" className="w-6 h-6" />
                                                </button>

                                                {/* Absolute Action Dropdown */}
                                                {activeActionMenu === order._id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-[60]"
                                                            onClick={() => setActiveActionMenu(null)}
                                                        />
                                                        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 z-[70] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-right-4 duration-200">
                                                            <button
                                                                className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                                                            >
                                                                <Icon icon="mdi:eye" className="text-lg" />
                                                                View Items
                                                            </button>
                                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-y border-gray-50">
                                                                <Icon icon="mdi:printer" className="text-lg" />
                                                                Print Invoice
                                                            </button>
                                                            <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
                                                                <Icon icon="mdi:truck-delivery" className="text-lg" />
                                                                Track
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Collapsible Details Row */}
                                        {expandedRows.has(order._id) && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan="8" className="p-0 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="p-10 border-x-4 border-amber-500/20 bg-gradient-to-br from-white to-amber-50/30">
                                                        <div className="grid grid-cols-4 gap-8 mb-8">
                                                            <DetailSection title="Patient Info">
                                                                <DetailItem label="Card Name" value={order.consumerCardName} />
                                                                <DetailItem label="Optician" value={order.opticianName} />
                                                                <DetailSection title="Reference" value={order.orderReference} />
                                                            </DetailSection>
                                                            <DetailSection title="Centration Data (R)">
                                                                <DetailItem label="PD" value={order.centrationData?.R?.pd} />
                                                                <DetailItem label="Corridor" value={order.centrationData?.R?.corridor} />
                                                                <DetailItem label="Fitting Ht" value={order.centrationData?.R?.fittingHeight} />
                                                            </DetailSection>
                                                            <DetailSection title="Centration Data (L)">
                                                                <DetailItem label="PD" value={order.centrationData?.L?.pd} />
                                                                <DetailItem label="Corridor" value={order.centrationData?.L?.corridor} />
                                                                <DetailItem label="Fitting Ht" value={order.centrationData?.L?.fittingHeight} />
                                                            </DetailSection>
                                                            <DetailSection title="Technical Details">
                                                                <DetailItem label="Frame Type" value={order.frameType} />
                                                                <DetailItem label="Lens Type" value={order.lensTypeId} />
                                                                <DetailItem label="Coating" value={order.coatingId} />
                                                            </DetailSection>
                                                        </div>

                                                        {/* Product Power Table */}
                                                        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                                            <div className="grid grid-cols-6 bg-gray-50/80 px-6 py-3 border-b border-gray-100">
                                                                <span className="text-[10px] font-black uppercase text-gray-400">Eye</span>
                                                                <span className="text-[10px] font-black uppercase text-gray-400">SPH</span>
                                                                <span className="text-[10px] font-black uppercase text-gray-400">CYL</span>
                                                                <span className="text-[10px] font-black uppercase text-gray-400">AXIS</span>
                                                                <span className="text-[10px] font-black uppercase text-gray-400">ADD</span>
                                                                <span className="text-[10px] font-black uppercase text-gray-400">PRISM</span>
                                                            </div>
                                                            {['R', 'L'].map((side) => (
                                                                <div key={side} className="grid grid-cols-6 px-6 py-4 border-b border-gray-50 last:border-b-0">
                                                                    <span className="text-xs font-black text-amber-500">{side}</span>
                                                                    <span className="text-xs font-bold text-gray-800">{order.powerTable?.[side]?.sph || '0.00'}</span>
                                                                    <span className="text-xs font-bold text-gray-800">{order.powerTable?.[side]?.cyl || '0.00'}</span>
                                                                    <span className="text-xs font-bold text-gray-800">{order.powerTable?.[side]?.axis || '0.00'}</span>
                                                                    <span className="text-xs font-bold text-gray-800">{order.powerTable?.[side]?.add || '0.00'}</span>
                                                                    <span className="text-xs font-bold text-gray-800">{order.prismTable?.[side]?.prism ? `${order.prismTable[side].prism} / ${order.prismTable[side].base}` : '---'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 py-6 border-t border-gray-100 bg-gray-50/30">
                        <button
                            disabled={pagination.currentPage === 1}
                            onClick={() => fetchOrders(pagination.currentPage - 1)}
                            className="p-2.5 rounded-2xl border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-md transition-all h-10 w-10 flex items-center justify-center bg-white"
                        >
                            <Icon icon="mdi:chevron-left" className="text-xl" />
                        </button>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Page {pagination.currentPage} of {pagination.totalPages}</span>
                        <button
                            disabled={pagination.currentPage === pagination.totalPages}
                            onClick={() => fetchOrders(pagination.currentPage + 1)}
                            className="p-2.5 rounded-2xl border border-gray-200 disabled:opacity-30 hover:bg-white hover:shadow-md transition-all h-10 w-10 flex items-center justify-center bg-white"
                        >
                            <Icon icon="mdi:chevron-right" className="text-xl" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailSection = ({ title, children }) => (
    <div className="space-y-4">
        <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest border-b border-amber-100 pb-2">{title}</h4>
        <div className="space-y-3">{children}</div>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-bold text-gray-700">{value || '---'}</span>
    </div>
);

export default AllOrdersList;
