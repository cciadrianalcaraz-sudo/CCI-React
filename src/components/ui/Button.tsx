import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    primary?: boolean;
    secondary?: boolean;
    outline?: boolean;
    full?: boolean;
    className?: string;
    onClick?: () => void;
}

export default function Button({ children, primary, secondary, outline, full, className = "", onClick }: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-2xl font-bold transition-all active:scale-[0.98] cursor-pointer";

    const variants = {
        primary: "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-[#a67d3d]",
        secondary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark",
        outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white"
    };

    const variantClass = primary ? variants.primary : secondary ? variants.secondary : outline ? variants.outline : "";
    const widthClass = full ? "w-full" : "";

    return (
        <button
            onClick={onClick}
            className={`${baseStyles} ${variantClass} ${widthClass} ${className}`}
        >
            {children}
        </button>
    );
}
