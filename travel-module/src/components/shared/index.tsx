import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => {
    return (
        <button {...props}>
            {children}
        </button>
    );
};

export const Header: React.FC<{ title: string }> = ({ title }) => {
    return (
        <h1>{title}</h1>
    );
};

// Additional shared components can be added here