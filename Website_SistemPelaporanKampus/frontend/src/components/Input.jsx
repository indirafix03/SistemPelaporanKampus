import React from 'react';

function Input({ label, type = 'text', placeholder, value, onChange, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;
