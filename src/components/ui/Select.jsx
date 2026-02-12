import { Icon } from '@iconify/react';
import React from 'react';

const Select = ({ label, options = [], value, onChange, placeholder = 'Select option', error, containerClassName = "", ...props }) => {
    return (
        <div className={`w-full ${containerClassName}`}>
            {label && <label className="block text-left text-gray-700 text-sm font-medium mb-2 ml-3">{label}</label>}
            <div className="relative h-12">
                <select
                    className={`w-full h-full bg-gray-200/80 text-gray-700 rounded-full px-6 focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer text-sm ${error ? 'border border-red-500 focus:ring-red-500' : ''}`}
                    value={value}
                    onChange={onChange}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-gray-800 bg-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black text-xs">
                    <Icon icon="mdi:menu-down" className="w-5 h-5" />
                </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1 ml-4">{error.message}</p>}
        </div>
    );
};

export default Select;
