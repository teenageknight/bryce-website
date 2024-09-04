import React from "react";

type ProgressBarProps = {
    now: number | undefined;
};

const ProgressBar: React.FC<ProgressBarProps> = p => {
    const { now } = p;
    console.log(now);
    return (
        <>
            <div className=" w-full h-5 rounded-lg border-2 border-gray-600">
                <div className="bg-green-500 h-full rounded-lg" style={{ width: now + "%" }} />
            </div>
        </>
    );
};

export { ProgressBar };
