import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variants = {
  default: 'bg-idecide-primary text-idecide-dark',
  success: 'bg-idecide-success/20 text-green-800',
  warning: 'bg-idecide-warning/20 text-yellow-800',
  danger: 'bg-idecide-error/20 text-red-800',
  info: 'bg-idecide-info/20 text-blue-800',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: BadgeProps) {
  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}