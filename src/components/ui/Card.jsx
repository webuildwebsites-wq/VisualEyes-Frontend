import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
