import React, { useState } from "react";
import TopoBackground from "../assets/imgs/topoBackground.jpg";

import { FullScreenLoadingCompass } from "../components/experimental/loading-compass/loading-compass";
// This page right now is for me to test out diffrent components and styles that I want to use on my travel website, but i dont want to set up a whole other backend yet, i want to build out the front end

export function TravelPage() {
    const [loading, setLoading] = useState(true);

    return (
        <div>
            <h1>Travel Page</h1>
            <FullScreenLoadingCompass
                backgroundImg={TopoBackground}
                loading={loading}
                size={500}
                speed={"medium"}
                secondaryColor={"#bcbbaa"}
                tertiaryColor={"#668b68"}
            />
        </div>
    );
}
