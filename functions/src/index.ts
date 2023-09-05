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
const Geocodio = require("geocodio-library-node");
const geocoder = new Geocodio("API_KEY");

// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

type ParsedGeocodedAddress =
    | {
          address_query: string;
          formatted_address: string;
          state: string;
          state_code: string;
          city: string;
          zip_code: string;
          county: string;
          county_code: string;
          tract: string;
          tract_code: string;
          block_group: string;
      }
    | {};

/**
 *
 * @param address_query_geocode this represents the address that was passed to the geocoder
 * @param geocodio_address this is the response from geocodio
 * @returns a parsed address object that passes all of the neccary census data to the client
 */
function parseAddress(address_query_geocode: string, geocodio_address: any) {
    let address: ParsedGeocodedAddress = {};
    var address_query = address_query_geocode;
    var formatted_address = geocodio_address["formatted_address"];
    var state = geocodio_address["address_components"]["state"];
    var state_code = geocodio_address["fields"]["census"]["2022"]["state_fips"];
    var city = geocodio_address["address_components"]["city"];
    var zip_code = geocodio_address["address_components"]["zip"];
    var county = geocodio_address["address_components"]["county"];
    var county_code = geocodio_address["fields"]["census"]["2022"]["county_fips"];
    var tract = geocodio_address["fields"]["census"]["2022"]["tract_code"]; // FIXME: DEDDUPE This Eventually
    var tract_code = geocodio_address["fields"]["census"]["2022"]["tract_code"];
    var block_group = geocodio_address["fields"]["census"]["2022"]["block_group"];

    address = {
        address_query: address_query,
        formatted_address: formatted_address,
        state: state,
        state_code: state_code,
        city: city,
        zip_code: zip_code,
        county: county,
        county_code: county_code,
        tract: tract,
        tract_code: tract_code,
        block_group: block_group,
    };
    return address;
}

export const validateAddresses = onCall({ timeoutSeconds: 120 }, async request => {
    console.log("request.body", request.data.addresses);
    let addresses = request.data.addresses;
    let addresses_response: any[] = [];
    let invalid_addresses: any[] = [];

    let batchGeocodeResult = await geocoder.geocode(addresses, ["census2022"]).catch((err: any) => {
        console.warn(err);
    });

    console.log("Successfully got batch geocode results.");
    console.log("Quantity: ", batchGeocodeResult.results.length);

    // Loop over the addresses, split up the addresses with matches and without matches.
    // The addresses with matches get parsed and returned as a formated JSON object. The
    // addresses without matches get returned as a string array.

    batchGeocodeResult.results.forEach((result: any) => {
        if (result.response?.results && result.response.results.length > 0) {
            let response_address = result.response.results[0];
            console.log("response_address", response_address);
            addresses_response.push(parseAddress(result.query, response_address));
        } else {
            console.log("No match for address: ", result.address);
            invalid_addresses.push(result.query);
        }
    });

    let validAddresses = addresses_response.map(address => address.address_query);

    return { addresses: addresses_response, invalid_addresses: invalid_addresses, validAddresses: validAddresses };
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
