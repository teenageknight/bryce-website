import React from "react";

type ButtonProps = {
    label?: string;
    onClick: (value: any) => void;
    disabled?: boolean;
    className?: string;
    variant?: any;
    children: any;
};

const variantStyles = {
    default: "bg-green-700 p-2 rounded hover:bg-green-600 focus:ring focus:ring-green-700 focus:bg-green-800",
    disabled: "",
};

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false, className, children }) => {
    return (
        <button onClick={onClick} disabled={disabled} className={className + " " + variantStyles.default}>
            {...children}
        </button>
    );
};

export { Button };
