import React from 'react';

function Button({ children, onClick, type = 'button', className = '', ...props }) {
  return (
    <button 
      type={type}
      onClick={onClick}
      className={`px-4 py-2 rounded font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
