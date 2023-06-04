/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
const fetch = require("node-fetch");

// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const validateAddresses = onCall({ timeoutSeconds: 120 }, async request => {
    console.log("request.body", request.data.addresses);
    let addresses = request.data.addresses;
    const GEOCODING_BASE_URL = "https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress?";
    let addresses_response: any[] = [];
    let errors: any[] = [];

    for (const address of addresses) {
        let params = "address=" + encodeURI(address) + "&benchmark=4&vintage=4&format=json";
        let res = await fetch(GEOCODING_BASE_URL + params).catch((error: any) => {
            console.log("error", error);
            errors.push(error);
        });

        let json_response = await res.json();

        addresses_response.push(json_response);
    }

    return { addresses: addresses_response, error: errors };
});
