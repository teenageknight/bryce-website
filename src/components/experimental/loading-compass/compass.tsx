import React from "react";

// TODO: Eventually I want this to take in...
// 1. Primary color- Of the compass and the the NSWE lettering
// 2. Secondary color- Of the background of compass
// 3. Tertiary color- The color of the dots around the lettering
// 4. Loading- Boolean to determine if the compass is loading or not
// 5. Size- The size of the compass
// 6. Animate- Boolean to determine if the compass is animated or not
type CompassProps = {
    size: number;
    primaryColor?: string;
    secondaryColor?: string;
};

const Compass: React.FC<CompassProps> = p => {
    const { size, primaryColor, secondaryColor } = p;

    return (
        <div style={{ width: size }}>
            <svg version="1.1" viewBox="0 0 401.29 401.29" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(100.67 -852.28)">
                    <g fill-rule="evenodd" stroke={primaryColor ?? "#000"} stroke-width="1px">
                        <path d="m185.06 967.86-84.828 59.38v25.448l84.828-84.828z" fill={primaryColor ?? "#000"} />
                        <path d="m185.04 967.85-59.38 84.828h-25.448l84.828-84.828z" fill={secondaryColor ?? "#fff"} />
                        <path d="m14.907 1138 84.828-59.38v-25.448l-84.828 84.828z" fill={primaryColor ?? "#000"} />
                        <path d="m14.923 1138 59.38-84.828h25.448l-84.828 84.828z" fill={secondaryColor ?? "#fff"} />
                        <path d="m185.04 1138-59.38-84.828h-25.448l84.828 84.828z" fill={primaryColor ?? "#000"} />
                        <path d="m185.06 1138-84.828-59.38v-25.448l84.828 84.828z" fill={secondaryColor ?? "#fff"} />
                        <path d="m14.923 967.85 59.38 84.828h25.448l-84.828-84.828z" fill={primaryColor ?? "#000"} />
                        <path d="m14.907 967.86 84.828 59.38v25.448l-84.828-84.828z" fill={secondaryColor ?? "#fff"} />
                        <path d="m100 852.36-30 170 30 30v-200z" fill={primaryColor ?? "#000"} />
                        <path d="m99.962 852.36 30 170-30 30v-200z" fill={secondaryColor ?? "#fff"} />
                        <path d="m99.962 1253.5 30-170-30-30v200z" fill={primaryColor ?? "#000"} />
                        <path d="m100 1253.5-30-170 30-30v200z" fill={secondaryColor ?? "#fff"} />
                        <path d="m300.54 1052.9-170-30-30 30h200z" fill={primaryColor ?? "#000"} />
                        <path d="m300.54 1052.9-170 30-30-30h200z" fill={secondaryColor ?? "#fff"} />
                        <path d="m-100.58 1052.9 170 30 30-30h-200z" fill={primaryColor ?? "#000"} />
                        <path d="m-100.58 1052.9 170-30 30 30h-200z" fill={secondaryColor ?? "#fff"} />
                    </g>
                </g>
            </svg>
        </div>
    );
};

export { Compass };
