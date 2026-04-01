import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logOut, selectCurrentUser, setCredentials } from '../../store/slices/authSlice';
import { Icon } from '@iconify/react';
import logo from '../../assets/logo.svg';
import { acceptTermsConditions } from '../../services/customerService';
import { toast } from 'react-toastify';

const CustomerLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const token = useSelector((state) => state.auth.token);

    const [showTermsModal, setShowTermsModal] = useState(false);
    const [termsAccepting, setTermsAccepting] = useState(false);

    // Check if T&C needs to be shown
    useEffect(() => {
        if (user && !user?.termsAndConditionsAccepted) {
            setShowTermsModal(true);
        }
    }, [user]);

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/customer-login', { replace: true });
    };

    const handleAcceptTerms = async () => {
        setTermsAccepting(true);
        try {
            const res = await acceptTermsConditions();
            if (res?.success) {
                toast.success('Terms & Conditions accepted successfully');
                // Update user in Redux so the modal won't show again
                dispatch(setCredentials({ user: { ...user, termsAndConditionsAccepted: true }, token }));
                setShowTermsModal(false);
            } else {
                toast.error(res?.message || 'Failed to accept terms');
            }
        } catch (err) {
            toast.error(err?.message || err?.error?.message || 'Something went wrong');
        } finally {
            setTermsAccepting(false);
        }
    };

    const handleDeclineTerms = () => {
        toast.info('You must accept the Terms & Conditions to continue.');
        handleLogout();
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans flex flex-col">
            {/* Navbar */}
            <header className="bg-white shadow-[0_4px_30px_rgb(0,0,0,0.03)] border-b border-gray-100 px-6 py-4 flex items-center justify-between z-20 sticky top-0 backdrop-blur-md bg-white/80">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="VisualEyes" className="h-10 object-contain" />
                    <span className="hidden md:inline-block text-lg font-black text-amber-600 tracking-widest uppercase border-l-2 border-amber-500/20 pl-4 py-1">Customer Portal</span>
                </div>

                <div className="flex items-center gap-6">
                    {/* User Info Badges */}
                    <div className="hidden lg:flex items-center gap-2 text-[10px]">
                        <span className="font-black bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full uppercase tracking-wider">{user?.SubRole?.name || user?.SubRole || '---'}</span>
                        <span className="font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">{user?.EmployeeType?.name || user?.EmployeeType || '---'}</span>
                        <span className="font-black bg-teal-50 text-teal-600 px-2.5 py-1 rounded-full uppercase tracking-wider">{user?.Department?.name || user?.Department || '---'}</span>
                    </div>

                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-sm font-bold text-gray-800">{user?.shopName || user?.ownerName}</span>
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{user?.customerCode || 'Customer'}</span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-red-500 hover:bg-red-50 font-black text-xs uppercase tracking-widest transition-all duration-300 border border-transparent hover:border-red-200 shadow-sm hover:shadow-md"
                    >
                        <Icon icon="mdi:logout" className="text-lg" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
                <div className="max-w-[1400px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>

            {/* Terms & Conditions Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6 text-white">
                            <div className="flex items-center justify-center  gap-3">
                                <Icon icon="mdi:file-document-check-outline" className="text-3xl" />
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">Terms & Conditions</h2>
                                    <p className="text-amber-100 text-sm font-medium">Please review and accept to continue</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 text-sm text-gray-600 leading-relaxed space-y-4 custom-scrollbar">
                            <h3 className="text-base font-black text-gray-800">VisualEyes Customer Agreement</h3>
                            <p>By accessing and using the VisualEyes Customer Portal, you agree to be bound by the following terms and conditions. Please read them carefully.</p>

                            <h4 className="font-black text-gray-700 pt-2">1. Account Responsibility</h4>
                            <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity performed under your account will be deemed as authorized by you. Notify us immediately of any unauthorized access.</p>

                            <h4 className="font-black text-gray-700 pt-2">2. Order & Payment Terms</h4>
                            <p>All orders placed through the portal are subject to acceptance and availability. Payment must be made within the agreed credit period. Failure to comply may result in account suspension or credit limit revision.</p>

                            <h4 className="font-black text-gray-700 pt-2">3. Pricing & Discount</h4>
                            <p>Prices are subject to change without prior notice. Discounts, if any, are applied as per the approved customer profile and cannot be combined with other offers unless explicitly stated.</p>

                            <h4 className="font-black text-gray-700 pt-2">4. Returns & Warranty</h4>
                            <p>Products may be returned only in accordance with our return policy. Warranty claims must be submitted within the stipulated period with proper documentation. Damaged goods during transit must be reported within 48 hours of delivery.</p>

                            <h4 className="font-black text-gray-700 pt-2">5. Intellectual Property</h4>
                            <p>All content, trademarks, and materials on the VisualEyes portal are the property of VisualEyes and its licensors. Unauthorized use, reproduction, or distribution is strictly prohibited.</p>

                            <h4 className="font-black text-gray-700 pt-2">6. Data Privacy</h4>
                            <p>We collect and process your data in accordance with applicable data protection laws. Your business information is kept confidential and will not be shared with third parties without consent, except as required by law.</p>

                            <h4 className="font-black text-gray-700 pt-2">7. Limitation of Liability</h4>
                            <p>VisualEyes shall not be liable for indirect, incidental, or consequential damages arising from the use of this portal. Our total liability shall not exceed the value of the transaction in question.</p>

                            <h4 className="font-black text-gray-700 pt-2">8. Amendments</h4>
                            <p>VisualEyes reserves the right to modify these terms at any time. Continued use of the portal after changes constitutes acceptance of the modified terms.</p>
                        </div>

                        {/* Footer Actions */}
                        <div className="border-t border-gray-100 px-8 py-5 flex items-center mx-auto justify-end gap-4 bg-gray-50/50">
                            <button
                                onClick={handleDeclineTerms}
                                className="px-6 py-2.5 rounded-full text-gray-500 hover:bg-gray-100 font-black text-xs uppercase tracking-widest transition-all duration-300 border border-gray-200"
                            >
                                Decline & Logout
                            </button>
                            <button
                                onClick={handleAcceptTerms}
                                disabled={termsAccepting}
                                className="px-8 py-2.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-amber-500/30 disabled:opacity-50"
                            >
                                {termsAccepting ? 'Accepting...' : 'I Accept'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerLayout;

