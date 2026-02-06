import React from 'react';
import { Icon } from '@iconify/react';
import logo from '../assets/visual-eyes-logo.png';

const Welcome = () => {
    return (
        <div className="min-h-screen  flex items-center justify-center p-4">
            <div className="bg-[#ffffffad] rounded-[32px] shadow-xl p-16 max-w-3xl w-full text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">

                {/* Background decorative circles could go here */}

                <div className=" relative z-10">
                    <div className="flex items-center gap-2 justify-center mb-6">
                        <img src={logo} alt="VisualEyes" className="h-48 object-contain" />
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl text-gray-500 font-semibold relative z-10">
                    Wishing You A <span className="text-amber-500 font-semibold">Productive</span> Day!
                </h1>

            </div>
        </div>
    );
};

export default Welcome;
