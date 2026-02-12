import React from 'react';

const PlaceholderPage = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
            <h2 className="text-3xl font-light mb-4">{title}</h2>
            <p className="text-lg opacity-60">This module is coming soon.</p>
        </div>
    );
};

export default PlaceholderPage;
