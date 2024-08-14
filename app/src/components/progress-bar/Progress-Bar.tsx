import React from "react";

type ProgressBarProps = {
    now: number | undefined;
};

const ProgressBar: React.FC<ProgressBarProps> = p => {
    const { now } = p;

    return (
        <>
            <div className=" w-full h-5 rounded border-2 border-gray-600">
                <div className="bg-green-500 h-full" style={{ width: now + "%" }} />
            </div>
        </>
    );
};

export { ProgressBar };
