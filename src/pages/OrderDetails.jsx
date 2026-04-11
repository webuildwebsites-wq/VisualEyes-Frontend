import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { getOrderById } from '../services/orderService';
import { PATHS } from '../routes/paths';
import Button from '../components/ui/Button';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const res = await getOrderById(id);
                if (res.success) {
                    setOrder(res.data);
                }
            } catch (error) {
                toast.error('Failed to load order details');
                navigate(PATHS.CUSTOMER_CARE.ALL_ORDERS);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Loading Order Details...</p>
            </div>
        );
    }

    if (!order) return null;

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase() || 'PENDING';
        switch (s) {
            case 'SUBMITTED':
            case 'PROCESSING': return 'bg-blue-50 text-blue-600 border-blue-200 shadow-blue-500/10';
            case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-200 shadow-green-500/10';
            case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-200 shadow-red-500/10';
            case 'DRAFT': return 'bg-amber-50 text-amber-600 border-amber-200 shadow-amber-500/10';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const InfoCard = ({ title, icon, children, className = "" }) => (
        <div className={`bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
                    <Icon icon={icon} className="text-xl" />
                </div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em]">{title}</h3>
            </div>
            {children}
        </div>
    );

    const PowerValue = ({ label, value, unit = "" }) => (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{label}</span>
            <span className="text-sm font-bold text-gray-800">{value || '---'}{unit && value ? unit : ''}</span>
        </div>
    );

    const EyeDetailCard = ({ side, data, prism, centration }) => (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:border-amber-200 transition-colors duration-300">
            <div className={`py-4 px-8 border-b border-gray-50 flex items-center justify-between ${side === 'R' ? 'bg-orange-50/30' : 'bg-blue-50/30'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg ${side === 'R' ? 'bg-[#fe9a00] rotate-3' : 'bg-blue-500 -rotate-3'}`}>
                        {side}
                    </div>
                    <div>
                        <h4 className="font-black text-gray-800 text-sm uppercase tracking-widest">{side === 'R' ? 'Right Eye' : 'Left Eye'}</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Ocular Configuration</p>
                    </div>
                </div>
                {data?.diameter && (
                    <div className="text-right">
                        <span className="text-[9px] font-black text-gray-400 uppercase block tracking-tighter">Diameter</span>
                        <span className="text-xs font-black text-amber-600">{data.diameter}mm</span>
                    </div>
                )}
            </div>

            <div className="p-8 space-y-8">
                {/* Power Set */}
                <div className="grid grid-cols-4 gap-4">
                    <PowerValue label="SPH" value={data?.sph} />
                    <PowerValue label="CYL" value={data?.cyl} />
                    <PowerValue label="AXIS" value={data?.axis} />
                    <PowerValue label="ADD" value={data?.add} />
                </div>

                <div className="h-px bg-gray-50" />

                {/* Prism & Centration */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h5 className="text-[9px] font-black text-[#fe9a00] uppercase tracking-[0.2em] mb-3">Prism Matrix</h5>
                        <div className="grid grid-cols-2 gap-4">
                            <PowerValue label="Prism" value={prism?.prism} />
                            <PowerValue label="Base" value={prism?.base} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h5 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Centration</h5>
                        <div className="grid grid-cols-3 gap-2">
                            <PowerValue label="PD" value={centration?.pd} unit="mm" />
                            <PowerValue label="Dist." value={centration?.corridor} />
                            <PowerValue label="Height" value={centration?.fittingHeight} unit="mm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 pb-24">
            <div className="max-w-7xl mx-auto space-y-10">
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(PATHS.CUSTOMER_CARE.ALL_ORDERS)}
                                className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-amber-500 hover:border-amber-200 transition-all active:scale-95 shadow-sm"
                            >
                                <Icon icon="mdi:arrow-left" className="text-xl" />
                            </button>
                            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Order Details</h1>
                        </div>
                        <div className="flex items-center gap-3 ml-13">

                            <span className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] shadow-sm animate-in fade-in slide-in-from-left-4 duration-500" >
                                {order.status || 'PENDING'}
                            </span>
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2 border-l border-gray-200 pl-3">
                                <Icon icon="mdi:calendar" className="text-amber-500" />
                                {dayjs(order.createdAt).format('DD MMMM YYYY | hh:mm A')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* <Button 
                            variant="outlined"
                            className="rounded-2xl border-gray-200 bg-white"
                            onClick={() => window.print()}
                        >
                            <Icon icon="mdi:printer" className="mr-2 text-xl" />
                            Print Summary
                        </Button> */}
                        {order.status === 'DRAFT' && (
                            <Button
                                className="rounded-2xl shadow-amber-500/20"
                                onClick={() => navigate(PATHS.CUSTOMER_CARE.EDIT_ORDER.replace(':id', order._id))}
                            >
                                <Icon icon="mdi:pencil-outline" className="mr-2 text-xl" />
                                Modify Order
                            </Button>
                        )}
                    </div>
                </div>

                {/* Primary Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Customer Spotlight */}
                    <InfoCard title="Customer Profile" icon="mdi:account-details-outline">
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-2xl font-black text-gray-800 tracking-tight leading-none mb-1">{order.customer?.shopName}</h4>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-black rounded uppercase tracking-widest leading-none">ID: {order.customer?.customerCode || '---'}</span>
                                    {order.opticianName && (
                                        <span className="text-[10px] text-amber-600 font-bold uppercase border-l border-gray-200 pl-2">Ordered by: {order.opticianName}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                <div className="p-2 rounded-xl bg-amber-100/50 text-amber-600">
                                    <Icon icon="mdi:map-marker-radius" className="text-lg" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Ship-To Address</p>
                                    <p className="text-xs font-bold text-gray-700 leading-relaxed">{order.customer?.address || 'Shipping branch details missing'}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-xl">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Running Balance</span>
                                <span className="text-sm font-black text-gray-800 tracking-tight">₹{order.customer?.customerBalance || '0.00'}</span>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Product Master */}
                    <InfoCard title="Product Architecture" icon="mdi:package-variant-closed">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-[0.2em] rounded-md border border-amber-200">{order.brand?.name}</span>
                                <span className="px-2.5 py-1 bg-amber-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-md">{order.category?.name}</span>
                                <span className="px-2.5 py-1 border border-gray-200 text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-md">{order.productMode}</span>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-gray-800 tracking-tight leading-7 line-clamp-2">{order.productName?.name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Index: {order.index || 'N/A'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Treatment</span>
                                    <p className="text-xs font-bold text-gray-700">{order.treatment?.name || '---'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Coating</span>
                                    <p className="text-xs font-bold text-gray-700">{order.coating?.name || '---'}</p>
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Technical Lens Config */}
                    <InfoCard title="Lens Customization" icon="mdi:palette-swatch-variant">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tint Detail</span>
                                    <p className="text-sm font-black text-gray-800 italic">"{order.tint?.name || 'No Tint'}"</p>
                                    <p className="text-[10px] text-gray-400 leading-tight">{order.tintDetails || 'Standard treatment application'}</p>
                                </div>
                                <div className={`w-14 h-14 rounded-full border-4 ${order.tint?.name && order.tint?.name !== 'No Tint' ? 'bg-amber-100/50 border-amber-200' : 'bg-gray-50 border-gray-100'} flex items-center justify-center font-black text-[10px] text-amber-600 flex-shrink-0`}>
                                    {order.tint?.name && order.tint?.name !== 'No Tint' ? 'ACTIVE' : 'N/A'}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-5 bg-gradient-to-r from-[#fe9a00] to-[#ffb74d] rounded-2xl shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02]">
                                <Icon icon="mdi:currency-inr" className="text-white text-2xl" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Product Value</span>
                                    <span className="text-2xl font-black text-white tracking-tighter leading-none">₹{order.totalAmount || '0.00'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {order.hasMirror && <span className="flex-1 py-1.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest text-center border border-blue-100 rounded-lg">Mirror Coat</span>}
                                <span className="flex-1 py-1.5 bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest text-center border border-orange-100 rounded-lg">Anti-Reflective</span>
                            </div>
                        </div>
                    </InfoCard>
                </div>

                {/* Prescription Matrix */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-[#fe9a00] rounded-full" />
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Ocular Prescription Matrix</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <EyeDetailCard
                            side="R"
                            data={order.powers?.find(p => p.side === 'R')}
                            prism={order.prisms?.find(p => p.side === 'R')}
                            centration={order.centrations?.find(c => c.side === 'R')}
                        />
                        <EyeDetailCard
                            side="L"
                            data={order.powers?.find(p => p.side === 'L')}
                            prism={order.prisms?.find(p => p.side === 'L')}
                            centration={order.centrations?.find(c => c.side === 'L')}
                        />
                    </div>
                </div>

                {/* Technical Engineering Data */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-blue-500 rounded-full" />
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Anatomical Fitting Data</h2>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-10 shadow-sm">
                            <PowerValue label="Frame Type" value={order.fittingData?.frameType} />
                            <PowerValue label="DBL" value={order.frameData?.dbl} unit="mm" />
                            <PowerValue label="Frame Length" value={order.frameData?.frameLength} unit="mm" />
                            <PowerValue label="Frame Height" value={order.frameData?.frameHeight} unit="mm" />

                            <PowerValue label="Pantoscopic" value={order.lensData?.pantoscopeAngle} unit="°" />
                            <PowerValue label="Bow Angle" value={order.lensData?.bowAngle} unit="°" />
                            <PowerValue label="BVD" value={order.lensData?.bvd} unit="mm" />
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Flat Fitting</span>
                                <span className={`text-xs font-black uppercase tracking-widest ${order.fittingData?.hasFlatFitting ? 'text-green-500' : 'text-gray-300'}`}>
                                    {order.fittingData?.hasFlatFitting ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-amber-200 rounded-full" />
                            <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Final Directives</h2>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 h-[220px] shadow-sm relative overflow-hidden group">
                            <div className="relative z-10">
                                <h5 className="text-[9px] font-black text-[#fe9a00] uppercase tracking-[0.2em] mb-4">Internal Remarks</h5>
                                <p className="text-sm font-bold text-gray-600 leading-relaxed max-h-[140px] overflow-y-auto">
                                    {order.remarks || 'No additional directives provided for this order sequence.'}
                                </p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 text-gray-50 group-hover:text-orange-50 transition-colors">
                                <Icon icon="mdi:comment-quote" className="text-9xl opacity-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Attribution */}
                <div className="pt-10 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-px bg-gray-200" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">
                        VisualEyes Order Management System Protocol v2.0
                    </p>
                    <div className="flex items-center gap-4 text-gray-300">
                        <Icon icon="mdi:shield-check" className="text-xl" />
                        <Icon icon="mdi:database-check" className="text-xl" />
                        <Icon icon="mdi:printer-check" className="text-xl" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
