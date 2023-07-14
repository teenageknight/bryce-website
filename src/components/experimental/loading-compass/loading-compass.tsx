import React from "react";
import "./loading-compass.css";

import { Compass } from "./compass";

type AnimationTime = "slow" | "medium" | "fast";
// The Animation is on 3's meaning there are 3 parts to each cycle, 3s a peice, so all Animation times need to be intervals of 3
const animationSpeed: { [key in AnimationTime]: number } = { slow: 9, medium: 6, fast: 3 };

type LoadingCompassProps = {
    size?: number;
    speed?: AnimationTime;
    primaryColor?: string;
    secondaryColor?: string;
    tertiaryColor?: string;
};

const LoadingCompass: React.FC<LoadingCompassProps> = p => {
    const { size, speed, primaryColor, secondaryColor, tertiaryColor } = p;

    const colors = {
        primary: primaryColor ?? "#000",
        secondary: secondaryColor ?? "#fff",
        tertiary: tertiaryColor ?? "#fff",
    };

    const cardinalTranslations: number = (size ?? 200) * 0.41;
    const dotTranslations: number = (size ?? 200) * 0.25;
    const fontSize: number = (size ?? 200) * 0.09;
    const dotSize: number = (size ?? 200) * 0.025;

    return (
        <>
            <div
                style={{
                    width: size ?? 200,
                    height: size ?? 200,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                <p
                    style={{
                        position: "absolute",
                        transform: `translate(0, -${cardinalTranslations}px)`,
                        fontSize: fontSize,
                        marginBottom: 0,
                        fontFamily: "Italianno",
                        fontWeight: "bold",
                        animation: `fade ${animationSpeed[speed ?? "medium"] / 3}s`,
                    }}>
                    N
                </p>
                <p
                    style={{
                        position: "absolute",
                        transform: `translate(0, ${cardinalTranslations}px)`,
                        fontSize: fontSize,
                        marginBottom: 0,
                        fontFamily: "Italianno",
                        fontWeight: "bold",
                        animation: `fade ${animationSpeed[speed ?? "medium"] / 3}s`,
                    }}>
                    S
                </p>
                <p
                    style={{
                        position: "absolute",
                        transform: `translate(-${cardinalTranslations}px, 0px)`,
                        fontSize: fontSize,
                        marginBottom: 0,
                        fontFamily: "Italianno",
                        fontWeight: "bold",
                        animation: `fade ${animationSpeed[speed ?? "medium"] / 3}s`,
                    }}>
                    W
                </p>
                <p
                    style={{
                        position: "absolute",
                        transform: `translate(${cardinalTranslations}px, 0px)`,
                        fontSize: fontSize,
                        marginBottom: 0,
                        fontFamily: "Italianno",
                        fontWeight: "bold",
                        animation: `fade ${animationSpeed[speed ?? "medium"] / 3}s`,
                    }}>
                    E
                </p>
                <div
                    style={{
                        position: "absolute",
                        backgroundColor: colors["tertiary"],
                        height: dotSize,
                        width: dotSize,
                        borderRadius: dotSize,
                        transform: `translate(${dotTranslations}px, ${dotTranslations}px)`,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        backgroundColor: colors["tertiary"],
                        height: dotSize,
                        width: dotSize,
                        borderRadius: dotSize,
                        transform: `translate(-${dotTranslations}px, ${dotTranslations}px)`,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        backgroundColor: colors["tertiary"],
                        height: dotSize,
                        width: dotSize,
                        borderRadius: dotSize,
                        transform: `translate(${dotTranslations}px, -${dotTranslations}px)`,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        backgroundColor: colors["tertiary"],
                        height: dotSize,
                        width: dotSize,
                        borderRadius: dotSize,
                        transform: `translate(-${dotTranslations}px, -${dotTranslations}px)`,
                    }}
                />
                <div
                    style={{
                        animation: `spin ${animationSpeed[speed ?? "medium"]}s linear infinite`,
                    }}>
                    <Compass
                        size={(size ?? 200) * 0.6}
                        primaryColor={colors["primary"]}
                        secondaryColor={colors["secondary"]}
                    />
                </div>
            </div>
        </>
    );
};

type FullScreenLoadingCompassProps = LoadingCompassProps & {
    backgroundImg: string;
    loading: boolean;
};

const FullScreenLoadingCompass: React.FC<FullScreenLoadingCompassProps> = p => {
    const { backgroundImg, loading } = p;

    return (
        <div
            style={{
                position: "absolute",
                backgroundImage: `url(${backgroundImg})`,
                backgroundSize: "auto",
                top: 0,
                left: 0,
                display: "flex",
                height: "100%",
                width: "100%",
                alignItems: "center",
                flexGrow: 1,
                justifyContent: "center",
                animation: loading ? "none" : "slideup 2s",
                animationFillMode: "forwards",
            }}>
            <LoadingCompass {...p} />
        </div>
    );
};

export { LoadingCompass, FullScreenLoadingCompass };
