import React, { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import logo from '../assets/visual-eyes-logo.png';
import { useNavigate, useLocation } from 'react-router-dom';

const Welcome = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [message] = useState(() => {
        if (location.state?.from === 'register') {
            return 'User Registered Successfully!';
        } else if (location.state?.from === 'login') {
            return 'Login Successful!';
        }
        return 'Welcome Back!';
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [navigate, location]);

    return (
        <div className="min-h-screen  flex items-center justify-center p-4">
            <div className="bg-[#ffffffad] rounded-[32px] shadow-xl p-16 max-w-3xl w-full text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">

                {/* Background decorative circles could go here */}

                <div className=" relative z-10">
                    <div className="flex items-center gap-2 justify-center mb-6">
                        <img src={logo} alt="VisualEyes" className="h-48 object-contain" />
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl text-gray-500 font-semibold relative z-10 mb-4">
                    {message}
                </h1>

                <h2 className="text-xl md:text-2xl text-gray-500 font-medium relative z-10">
                    Wishing You A <span className="text-amber-500 font-semibold">Productive</span> Day!
                </h2>

                <button
                    onClick={() => navigate('/')}
                    className="mt-12 text-gray-400 hover:text-amber-500 transition-colors text-sm font-medium flex items-center gap-1 relative z-10"
                >
                    Skip <Icon icon="mdi:chevron-double-right" />
                </button>

            </div>
        </div>
    );
};


export default Welcome;
