import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-idecide-primary shadow-sm
        hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}