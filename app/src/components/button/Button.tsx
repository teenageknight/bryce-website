import React from "react";

type ButtonProps = {
    onClick: (value: any) => void;
    disabled?: boolean;
    className?: string;
    variant?: any;
    children: any;
};

const variantStyles = {
    default: "bg-green-700 p-2 rounded hover:bg-green-600 focus:ring focus:ring-green-700 focus:bg-green-800",
    disabled: "bg-slate-800 p-2 rounded",
};

const Button: React.FC<ButtonProps> = ({ onClick, disabled = false, className, children }) => {
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
