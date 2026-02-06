import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', ...props }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
