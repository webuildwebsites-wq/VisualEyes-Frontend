import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, icon, ...props }) => {
    return (
        <div className="mb-4 w-full">
            {label && <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>}
            <div className="relative">
                <input
                    type={type}
                    className="w-full bg-gray-200 text-gray-800 placeholder-gray-500 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-colors"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {icon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Input;
