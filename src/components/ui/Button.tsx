import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    primary?: boolean;
    secondary?: boolean;
    outline?: boolean;
    full?: boolean;
}

export default function Button({ children, primary, secondary, outline, full }: ButtonProps) {
    const baseStyles = "px-6 py-3 rounded-full font-semibold transition shadow hover:-translate-y-0.5 inline-block cursor-pointer select-none";
    let styles = baseStyles;

    if (primary) styles += " bg-neutral-800 text-white";
    else if (secondary) styles += " bg-[#b28a45] text-[#2c2210]";
    else if (outline) styles += " border border-neutral-800 text-neutral-800";

    // Default fallback if no variant specified (optional)
    if (!primary && !secondary && !outline) styles += " bg-neutral-200 text-neutral-800";

    if (full) styles += " w-full text-center block";

    return <a className={styles}>{children}</a>;
}
