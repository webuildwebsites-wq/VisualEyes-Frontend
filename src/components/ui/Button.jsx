import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
    const baseStyles = "py-2 px-6 font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2";

    const variants = {
        primary: "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30",
        outlined: "border-2 border-amber-500 text-amber-500 hover:bg-amber-50",
        ghost: "text-amber-500 hover:bg-amber-50"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
