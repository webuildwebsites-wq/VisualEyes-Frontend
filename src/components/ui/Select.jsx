import React from 'react';

const Select = ({ label, options = [], value, onChange, placeholder = 'Select option', ...props }) => {
    return (
        <div className="mb-4 w-full">
            {label && <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>}
            <div className="relative">
                <select
                    className="w-full bg-amber-500 text-white placeholder-white/70 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-600 appearance-none cursor-pointer font-medium"
                    value={value}
                    onChange={onChange}
                    {...props}
                >
                    <option value="" disabled className="text-gray-500 bg-white">{placeholder}</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-gray-800 bg-white">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Select;
