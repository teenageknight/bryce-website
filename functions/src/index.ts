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
        let url = GEOCODING_BASE_URL + params;
        let res = await fetch(url).catch((error: any) => {
            console.log("error", error);
            errors.push(error);
        });

        let json_response = await res.json();

        addresses_response.push(json_response);
    }

    return { addresses: addresses_response, error: errors };
});

export const getCensusDataQuery = onCall({ timeoutSeconds: 120 }, async request => {
    console.log("request.body", request.data);
    let table = request.data.table;
    let json_responses: any[] = [];
    let errors: any[] = [];

    let params =
        "get=NAME,B01001_001E,B01001_003E,B01001_027E,B01001_004E,B01001_005E,B01001_006E,B01001_028E,B01001_029E,B01001_030E,B01001_020E,B01001_021E,B01001_022E,B01001_023E,B01001_024E,B01001_025E,B01001_044E,B01001_045E,B01001_046E,B01001_047E,B01001_048E,B01001_049E,B11001_001E,B17017_002E,B19013_001E,B23025_002E,B23025_005E,B01002_001E,B03003_003E,B02001_003E,B02001_002E,B02001_005E,B02001_004E,B02001_008E";
    let key = "&key=a9377975bb59e3a5a904e4dc7282aba021c9c55e";
    for (const row of table) {
        let query =
            "&for=block%20group:" +
            row.block_group +
            "&in=state:" +
            row.state_code +
            "%20county:" +
            row.county_code +
            "%20tract:" +
            row.tract_code;

        let url = "https://api.census.gov/data/2020/acs/acs5?" + params + "&get=" + query + key;

        console.log("url", url);

        let res = await fetch(url).catch((error: any) => {
            console.log("error", error);
            errors.push(error);
        });

        try {
            let json_response = await res.json();

            json_responses.push(json_response);
        } catch {
            console.log("error in json", res);
        }
    }

    return { response: json_responses, error: errors };
});
