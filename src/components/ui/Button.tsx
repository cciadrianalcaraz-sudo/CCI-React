import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    primary?: boolean;
    secondary?: boolean;
    outline?: boolean;
    full?: boolean;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export default function Button({ children, primary, secondary, outline, full, className = "", onClick, disabled, loading, type = "button" }: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-2xl font-bold transition-all active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-accent text-white shadow-lg shadow-accent/20 hover:bg-[#a67d3d]",
        secondary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark",
        outline: "bg-transparent text-primary border-2 border-primary hover:bg-primary hover:text-white"
    };

    const variantClass = primary ? variants.primary : secondary ? variants.secondary : outline ? variants.outline : "";
    const widthClass = full ? "w-full" : "";

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantClass} ${widthClass} ${className}`}
        >
            {loading && (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
