import React, { ReactNode } from "react";

export interface RowProps {
    header?: boolean;
    children?: Array<ReactNode>;
}

interface InputGridProps {
    columns: number;
    children?: ReactNode;
}

const Row: React.FC<RowProps> = p => {
    const { children } = p;
    return (
        <div className="flex flex-row h-10" style={{ ...(p.header && { fontWeight: "bold" }) }}>
            {children?.map((child, i) => (
                <div
                    key={i}
                    className="px-2 flex-grow h-full flex justify-center items-center"
                    style={{
                        width: "33%",
                        borderLeftWidth: i == 0 ? "0px" : "1px",
                        borderBottomWidth: "2px",
                        borderColor: "#8D96A0",
                    }}>
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
            <div className="flex-col border rounded bg-[#282c34] py-3">
                {Array.isArray(children) ? children : [children]}
            </div>
        </>
    );
};

InputGrid.Row = Row;

export { InputGrid };
