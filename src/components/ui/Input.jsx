import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, type = 'text', placeholder, value, onChange, icon, error, containerClassName = "mb-4", ...props }, ref) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>}
            <div className="relative h-12">
                <input
                    ref={ref}
                    type={type}
                    className={`w-full h-full bg-gray-200/80 text-gray-800 placeholder-gray-500 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-sm ${error ? 'border border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={placeholder}
                    defaultValue={value}
                    onChange={onChange}
                    {...props}
                />
                {icon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
                        {icon}
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-4">{error.message}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
