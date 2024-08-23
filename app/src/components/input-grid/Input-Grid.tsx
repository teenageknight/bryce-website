import React, { ReactNode } from "react";

export interface RowProps {
    header?: boolean;
    children?: Array<ReactNode>;
}

interface InputGridProps {
    columns: number;
    children?: ReactNode;
}

// TODO: Add in types for the props
const Row: React.FC<RowProps> = p => {
    const { children } = p;
    return (
        <div className="flex flex-row border p-3 " style={{ ...(p.header && { fontWeight: "bold" }) }}>
            {children?.map((child, index) => (
                <div className="flex-grow h-4" style={{ width: "33%" }}>
                    {child}
                </div>
            ))}
        </div>
    );
};

const InputGrid: React.FC<InputGridProps> & { Row: React.FC<RowProps> } = p => {
    const { children } = p;

    return (
        <>
            <div className="flex-col bg-[#282c34]">{Array.isArray(children) ? children : [children]}</div>
        </>
    );
};

InputGrid.Row = Row;

export { InputGrid };
