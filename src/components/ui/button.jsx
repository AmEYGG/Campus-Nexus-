import React from 'react';

const Button = ({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    warning: 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200',
    destructive: 'bg-red-100 text-red-900 hover:bg-red-200'
  };

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-8',
    icon: 'h-10 w-10'
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button }; 