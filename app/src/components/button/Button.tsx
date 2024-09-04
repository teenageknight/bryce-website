import React from "react";

// enum ButtonVariant {
//     Primary = "primary",
//     Disabled = "disabled",
//     Warning = "warning",
// }

type ButtonProps = {
    onClick: (value: any) => void;
    disabled?: boolean;
    className?: string;
    variant?: "primary" | "disabled" | "warning";
    children: any;
};

const variantStyles = {
    default: "bg-green-700 p-2 rounded hover:bg-green-600 focus:ring focus:ring-green-700 focus:bg-green-800",
    disabled: "bg-slate-800 p-2 rounded",
    warning: "bg-red-700 p-2 rounded hover:bg-red-600 focus:ring focus:ring-red-700 focus:bg-red-800",
};

const Button: React.FC<ButtonProps> = p => {
    const { onClick, disabled, className, variant, children } = p;
    console.log(variant);

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={className + " " + (disabled ? variantStyles.disabled : variantStyles.default)}>
            {...children}
        </button>
    );
};

export { Button };
