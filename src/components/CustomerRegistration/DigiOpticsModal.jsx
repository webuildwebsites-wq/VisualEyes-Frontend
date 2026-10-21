import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import { sendDigiOpticsOtp, verifyDigiOpticsOtp } from '../../services/customerService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import digiOpticsLogo from '../../assets/DigiOptics-logo.png';
// ff6300,1c1e24

export default function DigiOpticsModal({ isOpen, onClose, onDataReceived }) {
    const [step, setStep] = useState('initial'); // 'initial', 'email', 'otp', 'loading'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loadingMsg, setLoadingMsg] = useState('');

    if (!isOpen) return null;

    const handleSkip = () => {
        onClose();
    };

    const handleConnectClick = () => {
        setStep('email');
    };

    const handleSendOtp = async () => {
        if (!email) {
            toast.warning('Please enter an email address');
            return;
        }
        setStep('loading');
        setLoadingMsg('Connecting to DigiOptics...');
        try {
            const res = await sendDigiOpticsOtp(email);
            if (res.success || res.message?.toLowerCase().includes('otp sent')) {
                toast.success('OTP sent successfully');
                setStep('otp');
            } else {
                toast.error(res.message || 'Account not found in DigiOptics');
                setStep('email');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to connect. Please try again.');
            setStep('email');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            toast.warning('Please enter the OTP');
            return;
        }
        setStep('loading');
        setLoadingMsg('Verifying and fetching data from DigiOptics...');
        try {
            const res = await verifyDigiOpticsOtp({ email, otp });
            if (res.success && res.data?.customer) {
                toast.success('Successfully connected to DigiOptics!');
                onDataReceived(res.data.customer);
                onClose();
            } else {
                toast.error(res.message || 'Failed to verify OTP');
                setStep('otp');
            }
        } catch (error) {
            toast.error(error.message || 'Invalid OTP');
            setStep('otp');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-100">
                {/* Header */}
                <div className="p-8 pb-6 text-center border-b border-[#1c1e24]/5 bg-[#1c1e24]/[0.02]">
                    <div className="h-14 mb-4 flex items-center justify-center">
                        <img src={digiOpticsLogo} alt="DigiOptics" className="h-full object-contain drop-shadow-sm" />
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-widest text-[#1c1e24]">Connect Account</h2>
                    <p className="text-xs text-[#1c1e24]/60 mt-1.5 font-bold uppercase tracking-wider">Import your existing customer data</p>
                </div>

                {/* Body */}
                <div className="p-8 bg-white">
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="relative mb-10 w-28 h-28 flex items-center justify-center">
                                {/* Outer spinning rings */}
                                <div className="absolute inset-0 border-4 border-gray-100 border-t-[#ff6300] border-r-[#ff6300] rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-4 border-gray-100 border-b-[#1c1e24] border-l-[#1c1e24] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                {/* Center Logo */}
                                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                                    <img src={digiOpticsLogo} alt="DigiOptics Loading" className="w-14 h-14 object-contain animate-pulse" />
                                </div>
                            </div>
                            <p className="text-[#1c1e24] font-bold animate-pulse text-center tracking-wide">{loadingMsg}</p>
                        </div>
                    )}

                    {step === 'initial' && (
                        <div className="space-y-8 text-center py-2">
                            <p className="text-gray-600 font-medium leading-relaxed">
                                Does the customer have an existing account with DigiOptics? Connect now to automatically fill out the registration form.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Button type="button" className="w-full bg-[#ff6300] hover:bg-[#ff6300]/90 text-white border-0 flex items-center justify-center h-12 shadow-lg shadow-[#ff6300]/20 transition-all hover:-translate-y-0.5" onClick={handleConnectClick}>
                                    <Icon icon="mdi:link" className="mr-2 text-xl" /> Connect with DigiOptics
                                </Button>
                                <Button type="button" variant="outlined" className="w-full h-12 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold" onClick={handleSkip}>
                                    Skip & Fill Manually
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 'email' && (
                        <div className="space-y-6">
                            <p className="text-gray-600 font-medium text-center text-sm leading-relaxed">
                                Enter their DigiOptics registered email address to receive a secure OTP.
                            </p>
                            <div className="py-2">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="e.g. hello@digioptics.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button type="button" className="w-full bg-[#ff6300] hover:bg-[#ff6300]/90 text-white border-0 h-12 shadow-lg shadow-[#ff6300]/20 transition-all hover:-translate-y-0.5" onClick={handleSendOtp}>
                                    Send Verification Code
                                </Button>
                                <button type="button" className="text-xs text-gray-400 hover:text-gray-700 font-black uppercase tracking-widest transition-colors" onClick={() => setStep('initial')}>
                                    <Icon icon="mdi:arrow-left" className="inline mr-1 text-sm align-text-bottom" /> Back to options
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="space-y-6">
                            <p className="text-gray-600 font-medium text-center text-sm leading-relaxed">
                                Enter the verification code sent to <br /><span className="font-bold text-[#ff6300]">{email}</span>
                            </p>
                            <div className="py-2">
                                <Input
                                    label="One-Time Password"
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="text-center text-2xl tracking-widest font-black"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button type="button" className="w-full bg-[#ff6300] hover:bg-[#ff6300]/90 text-white border-0 h-12 shadow-lg shadow-[#ff6300]/20 transition-all hover:-translate-y-0.5" onClick={handleVerifyOtp}>
                                    Verify & Import Data
                                </Button>
                                <button type="button" className="text-xs text-gray-400 hover:text-gray-700 font-black uppercase tracking-widest transition-colors" onClick={() => setStep('email')}>
                                    <Icon icon="mdi:pencil" className="inline mr-1 text-sm align-text-bottom" /> Change Email
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
