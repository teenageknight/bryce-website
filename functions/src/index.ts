/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
console.log("first thing it sees");
import { onCall } from "firebase-functions/v2/https";
const fetch = require("node-fetch");
const Geocodio = require("geocodio-library-node");

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// const serviceAccountLocal = require("../service-account-keys/bryce-jackson-website-firebase-adminsdk-ra4es-7428ff5320.json");

// FIXME: THIS LIKELY WILL BREAK CD IN THE FUTURE. THIS IS BECUASE THE SERVICE ACCOUNT IS NOT CHECKED
// INTO VERSION CONTROL, I WILL NEED TO ADD THIS AS A .ENV SIMILAR TO THE GEOCODIO API KEY.

// let serviceAccount = serviceAccountLocal;
// console.log("outside of the if");
// if (process.env.FIREBASE_SERVICE_ACCOUNT) {
//     console.log("Using service account from env");
//     serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
// }

const config = {
    credential: cert(process.env.FIREBASE_SERVICE_ACCOUNT),
};

initializeApp(config);

const db = getFirestore();

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
    const address_query = address_query_geocode;
    const formatted_address = geocodio_address["formatted_address"];
    const state = geocodio_address["address_components"]["state"];
    const state_code = geocodio_address["fields"]["census"]["2020"]["state_fips"];
    const city = geocodio_address["address_components"]["city"];
    const zip_code = geocodio_address["address_components"]["zip"];
    const county = geocodio_address["address_components"]["county"];
    const county_code = geocodio_address["fields"]["census"]["2020"]["county_fips"];
    const tract = geocodio_address["fields"]["census"]["2020"]["tract_code"]; // FIXME: DEDDUPE This Eventually
    const tract_code = geocodio_address["fields"]["census"]["2020"]["tract_code"];
    const block_group = geocodio_address["fields"]["census"]["2020"]["block_group"];

    // For some reason, the county code is the state code followed by a 3 digit number representing the code.
    // For that reason, we need to strip off this state code from the county_code, as follows
    address = {
        address_query: address_query,
        formatted_address: formatted_address,
        state: state,
        state_code: state_code,
        city: city,
        zip_code: zip_code,
        county: county,
        county_code: county_code.slice(state_code.length),
        tract: tract,
        tract_code: tract_code,
        block_group: block_group,
    };

    return address;
}

export const validateAddresses = onCall({ timeoutSeconds: 120, secrets: ["GEOCODIO_API_KEY"] }, async request => {
    console.log("request.body", request.data.addresses);
    console.log("request.body", request.data.addresses.length);
    const addresses = request.data.addresses;
    const addresses_response: any[] = [];
    const invalid_addresses: any[] = [];
    const geocoder = new Geocodio(process.env.GEOCODIO_API_KEY);

    const batchGeocodeResult = await geocoder.geocode(addresses, ["census2020"]).catch((err: any) => {
        console.warn(err);
    });

    console.log("Successfully got batch geocode results.");
    console.log("Quantity: ", batchGeocodeResult.results.length);

    // Loop over the addresses, split up the addresses with matches and without matches.
    // The addresses with matches get parsed and returned as a formated JSON object. The
    // addresses without matches get returned as a string array.

    batchGeocodeResult.results.forEach((result: any) => {
        if (result.response?.results && result.response.results.length > 0) {
            const response_address = result.response.results[0];
            console.log("response_address", response_address);
            addresses_response.push(parseAddress(result.query, response_address));
        } else {
            console.log("No match for address: ", result.address);
            invalid_addresses.push(result.query);
        }
    });

    const validAddresses = addresses_response.map(address => address.address_query);

    return {
        addresses: addresses_response,
        invalid_addresses: invalid_addresses,
        validAddresses: validAddresses,
    };
});

export const getCensusDataQuery = onCall({ timeoutSeconds: 120 }, async request => {
    console.log("request.body", request.data);
    const table = request.data.table;
    const json_responses: any[] = [];
    const errors: any[] = [];

    const params =
        "get=NAME,B01001_001E,B01001_003E,B01001_027E,B01001_004E,B01001_005E,B01001_006E,B01001_028E,B01001_029E,B01001_030E,B01001_020E,B01001_021E,B01001_022E,B01001_023E,B01001_024E,B01001_025E,B01001_044E,B01001_045E,B01001_046E,B01001_047E,B01001_048E,B01001_049E,B11001_001E,B17017_002E,B19013_001E,B23025_002E,B23025_005E,B01002_001E,B03003_003E,B02001_003E,B02001_002E,B02001_005E,B02001_004E,B02001_008E";

    for (const row of table) {
        const query =
            "&for=block%20group:" +
            row.block_group +
            "&in=state:" +
            row.state_code +
            "%20county:" +
            row.county_code +
            "%20tract:" +
            row.tract_code;

        const url = "https://api.census.gov/data/2020/acs/acs5?" + params + "&get=" + query;

        console.log("url", url);

        const res = await fetch(url).catch((error: any) => {
            console.log("error", error);
            errors.push(error);
        });

        try {
            const json_response = await res.json();

            json_responses.push(json_response);
        } catch {
            console.log("error in json", res);
        }
    }

    return { response: json_responses, error: errors };
});

export const getCJESTDataQuery = onCall({ timeoutSeconds: 120, secrets: ["GEOCODIO_API_KEY"] }, async request => {
    console.log("request.body", request.data);
    const addresses = request.data.addresses;
    const addresses_response: any[] = [];
    const disadvantaged: any[] = []; // This is a list of addresses keyed to a boolean value of whether or not they are disadvantaged
    const invalid_addresses: any[] = [];
    const geocoder = new Geocodio(process.env.GEOCODIO_API_KEY);

    const batchGeocodeResult = await geocoder.geocode(addresses, ["census2010"]).catch((err: any) => {
        console.warn(err);
    });

    console.log("Successfully got batch geocode results.");
    console.log("Quantity: ", batchGeocodeResult.results.length);

    // Initalize the collection reference for the cjest collection
    const cjestCollectionRef = db.collection("cjest");

    for (let i = 0; i < batchGeocodeResult.results.length; i++) {
        // batchGeocodeResult.results.forEach((result: any) => {
        const result = batchGeocodeResult.results[i];
        if (result.response?.results && result.response.results.length > 0) {
            const response_address = result.response.results[0];
            console.log("response_address", response_address);
            addresses_response.push(response_address);

            // Get the FIPS code for the address. We need to remove the last 4 characters, which are the state FIPS code, and something else.
            let fullFips = response_address["fields"]["census"]["2010"]["full_fips"].toString();
            fullFips = fullFips.substring(0, fullFips.length - 4);

            // The following code is for the CJEST methodology, and determining if any given address
            // meets the criteria laid for the address to be considered burdened. For more information,
            // see the CJEST methodology documentation.
            // https://screeningtool.geoplatform.gov/en/methodology#3/33.47/-97.5
            const cjestValueRef = cjestCollectionRef.doc(fullFips);
            const doc = await cjestValueRef.get();

            if (doc.exists) {
                // NOTE: Evemtually, if more functionality is ever wanted, please refer to the following technical documentation:
                // https://static-data-screeningtool.geoplatform.gov/data-versions/1.0/data/score/downloadable/1.0-cejst-technical-support-document.pdf
                // This documant on page 6 has the information we are using, but we are only using the column that check is the area is considered
                // "disadvantaged" or not. In the future, we may want more columns, but for now, this is all we need.
                // const burdenedData = parseBurdenedAddressData(doc.data());
                let isDisadvantaged = doc.data()["Identified as disadvantaged"];
                disadvantaged.push({ addresses: result.query, isDisadvantaged: isDisadvantaged });
            } else {
                console.error("No document found for FIPS code: ", fullFips);
                disadvantaged.push({ addresses: result.query, isDisadvantaged: false });
            }
        } else {
            console.log("No match for address: ", result.address);
            invalid_addresses.push(result.query);
        }
    }

    return { disadvantaged: disadvantaged };
});
