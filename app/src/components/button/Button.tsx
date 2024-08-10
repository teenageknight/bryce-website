import React from "react";

type ButtonProps = {
    label?: string;
    onClick: (value: any) => void;
    disabled?: boolean;
    className?: string;
    variant?: any;
    children: any;
};

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false, className, children }) => {
    return (
        <button onClick={onClick} disabled={disabled} className={className}>
            {...children}
        </button>
    );
};

export { Button };
