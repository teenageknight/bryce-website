import React, { useEffect, useReducer } from "react";

import { validateAddress } from "../services/functions";
import { writeGeocodeToTable, getCensusData, parseCensusResults } from "../utils/census";
import { ExportExcel } from "../components/export-excel/export-excel";
import { Button } from "../components/button/Button";
import { ProgressBar } from "../components/progress-bar/Progress-Bar";

type status =
    | ""
    | "validating-addresses"
    | "addresses-validated"
    | "submitted"
    | "parsing-geocode"
    | "getting-census"
    | "parsing-census"
    | "done";

type FormState = {
    currentAddressLine: string;
    addresses: string[];
    addressStatus: string[]; // This might become an enum or something else later
    status: string;
    geocodeResults: any[];
    tableData: any[];
};

enum AddressStatus {
    Pending = "Pending",
    Valid = "Valid",
    Invalid = "Invalid",
}

export function FWACalculatorPage() {
    const [invalidAddresses, setInvalidAddresses] = React.useState<string[] | undefined>([]);
    const [tableData, setTableData] = React.useState<any[] | undefined>([]);
    const [progress, setProgress] = React.useState<number | undefined>(0);

    const initialFormState: FormState = {
        currentAddressLine: "",
        addresses: [],
        addressStatus: [],
        status: "",
        geocodeResults: [],
        tableData: [],
    };

    function formReducer(state: FormState, action: any): FormState {
        switch (action.type) {
            case "update_status":
                return {
                    ...state,
                    status: action.payload,
                };
            case "update_current_address_line":
                return {
                    ...state,
                    currentAddressLine: action.payload,
                };
            case "add_addresses_and_update_current_address_line":
                return {
                    ...state,
                    currentAddressLine: action.payload.currentAddressLine,
                    addresses: [...state.addresses, ...action.payload.addresses],
                };
            case "update_address_status_pending":
                return {
                    ...state,
                    addressStatus: action.payload.status,
                    geocodeResults: action.payload.geocodeResults,
                    status: "validating-addresses",
                };
            case "update_address_status_done":
                return {
                    ...state,
                    addressStatus: action.payload.status,
                    // TODO: Add the geocode results to the state
                    geocodeResults: action.payload.geocodeResults,
                    status: "addresses-validated",
                };
            case "form_submitted_success":
                return {
                    ...state,
                    status: "done",
                    tableData: action.payload,
                };
            case "form_submitted_failure":
                return {
                    ...state,
                    status: "error",
                };
            case "reset":
                return initialFormState;
            default:
                return state;
        }
    }

    const [formState, formDispatch] = useReducer(formReducer, initialFormState);
    console.log(formState);
    const handeAddressInputChange = (e: any) => {
        let lines = e.target.value.split("\n");
        if (lines.length > 1) {
            formDispatch({
                type: "add_addresses_and_update_current_address_line",
                payload: { addresses: lines.slice(0, lines.length - 1), currentAddressLine: lines[lines.length - 1] },
            });
        } else {
            formDispatch({ type: "update_current_address_line", payload: e.target.value });
        }
    };

    /*
        This use effect is specifically for resizing the arrays any time the addresses change. Since its javascript, technically
        we dont have to do this, but idk, it made sense to me.
    */
    useEffect(() => {
        // If the lengths are diffrent, then we need to update the address status
        if (formState.addresses.length !== formState.addressStatus.length) {
            // Lazy load the address status and if it valid or not
            let newAddressStatus = new Array(formState.addresses.length - formState.addressStatus.length).fill(
                AddressStatus.Pending
            ) as string[];
            let addressStatus = [...formState.addressStatus, ...newAddressStatus];

            // Resize the geocode results array to the same length as the address status array
            let newGeocodeResults = new Array(formState.addresses.length - formState.geocodeResults.length).fill(
                "Loading..."
            ) as string[];
            let geocodeResults = [...formState.geocodeResults, ...newGeocodeResults];

            formDispatch({
                type: "update_address_status_pending",
                payload: { status: addressStatus, geocodeResults: geocodeResults },
            });
            return;
        }
    }, [formState.addresses, formState.addressStatus]);

    useEffect(() => {
        // TODO: Clean this up and make it more readable
        const doWork = async () => {
            let numPending = 0;
            let indexes = [];
            let chunked_addresses: string[] = [];
            let promises: Promise<any>[] = [];
            for (let i = 0; i < formState.addresses.length; i++) {
                if (formState.addressStatus[i] === AddressStatus.Pending) {
                    chunked_addresses.push(formState.addresses[i]);
                    indexes.push(i);
                    numPending++;
                }
                if (chunked_addresses.length === 20) {
                    let promise = validateAddress({ addresses: chunked_addresses });
                    promises.push(promise);
                    chunked_addresses = [];
                    numPending = 0;
                }
            }
            // FIXME: This will break on the last chuck or possibly push an empty array. Take care of this.
            // Final chunk
            let promise = validateAddress({ addresses: chunked_addresses });
            promises.push(promise);

            await Promise.all(promises);
            const results = await Promise.all(promises);
            let resultsFormatted: { addresses: string[]; invalid_addresses: string[]; valid_addresses: string[] } = {
                addresses: [],
                invalid_addresses: [],
                valid_addresses: [],
            };
            results.forEach((result: any) => {
                resultsFormatted.addresses = resultsFormatted.addresses.concat(result.data.addresses);
                resultsFormatted.invalid_addresses = resultsFormatted.invalid_addresses.concat(
                    result.data.invalid_addresses
                );
                resultsFormatted.valid_addresses = resultsFormatted.valid_addresses.concat(result.data.validAddresses);
            });

            let tempStatus = [...formState.addressStatus];
            let tempGeocodeResults = [...formState.geocodeResults];
            for (let i = 0; i < indexes.length; i++) {
                if (resultsFormatted.invalid_addresses.includes(formState.addresses[indexes[i]])) {
                    tempStatus[indexes[i]] = AddressStatus.Invalid;
                    // NOTE: This is a way to keep track of the index of the geocoding results
                    tempGeocodeResults[indexes[i]] = AddressStatus.Invalid;
                } else {
                    tempStatus[indexes[i]] = AddressStatus.Valid;
                    tempGeocodeResults[indexes[i]] = resultsFormatted.addresses[indexes[i]];
                }
            }
            console.log("test");

            formDispatch({
                type: "update_address_status_done",
                payload: { status: tempStatus, geocodeResults: resultsFormatted.addresses },
            });
        };

        if (formState.status === "validating-addresses") {
            doWork();
        }
    }, [formState.status]);

    const handleSubmit = async () => {
        // 1. Write the geocoding data to a table {}
        formDispatch({ type: "update_status", payload: "parsing-geocode" });
        // FIXME: This will break if there are any invalid addresses, we need to handle that before this step!!!
        let table = writeGeocodeToTable(formState.geocodeResults);

        // 2. Query the census data
        formDispatch({ type: "update_status", payload: "getting-census" });
        let censusResults: any[] = [];
        try {
            censusResults = await getCensusData(table);
        } catch (error) {
            console.log(error);
            formDispatch({ type: "form_submitted_failure", payload: "error" });
            return;
        }

        // 3. Parse the census data to the table
        formDispatch({ type: "update_status", payload: "parsing-census" });
        table = parseCensusResults(censusResults, table);

        // 4. Download the table
        formDispatch({ type: "form_submitted_success", payload: table });
    };

    const handleReset = () => {
        formDispatch({ type: "reset" });
    };

    return (
        <div className="px-10" style={{ marginTop: "10px" }}>
            <h1 className="text-3xl">Census Data Automation Tool</h1>
            {/* FIXME: Add in tooltip beside this title, showing the instructions commented out below */}
            <p className="text-[#8D96A0]">
                This calculator tool will help automate the process of finding and reporting census data surrounding the
                farm, community garden, and orchard sites in Food Well Alliance’s service area.
            </p>
            {formState.status !== "" && (
                <div>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            handleReset();
                        }}>
                        Reset Form
                    </Button>
                </div>
            )}
            <div style={{ display: "flex", width: "100%" }}>
                <div>
                    {/* Title */}
                    <h2>Addresses</h2>
                    {/* Render all of the addressses input so far */}
                    {/* TODO: Add this functionality */}
                    {/* Render the input field */}
                    {formState.addresses.map((address: string, index: number) => (
                        // FIXME: This will need to have some additional logic to determine if the address is valid or not and what is focused on.
                        <div key={index}>
                            <div className="flex flex-row">
                                <p>{index + 1}.</p>
                                <p>{address}</p>
                                <p>{formState.addressStatus[index]}</p>
                            </div>
                        </div>
                    ))}
                    {/* Input Row */}
                    <div className="flex flex-row">
                        <textarea
                            rows={1}
                            placeholder="Address"
                            value={formState.currentAddressLine}
                            onChange={e => handeAddressInputChange(e)}
                            onKeyDown={e => e.key === "Enter"}
                        />
                        <p>Plus button to add</p>
                    </div>
                </div>
            </div>
            <Button
                variant="primary"
                disabled={formState.status !== "addresses-validated"}
                onClick={_ => {
                    handleSubmit();
                }}>
                Submit
            </Button>

            <div style={{ marginTop: 15, marginBottom: 15 }}>
                <div>Status: {status === "" ? "Waiting..." : status}</div>
                <ProgressBar now={progress} />
            </div>

            <div>Number of Valid Addresses: {formState.addresses?.length}</div>
            <div>Number of Invalid Addresses: {invalidAddresses?.length}</div>
            {invalidAddresses && invalidAddresses?.length > 0 && (
                <>
                    <div>
                        The following Addresses are invalid. Please use an address nearby to fix this issue and try
                        again.
                    </div>
                    {invalidAddresses?.map((address: string, index: number) => (
                        <div key={index}>{address}</div>
                    ))}
                </>
            )}
            <div style={{ marginTop: 20 }}>
                {status === "done" && <ExportExcel excelData={tableData} fileName={"output"} />}
            </div>
            <p className="text-[#8D96A0]">For any inquires, please reach out to bkajackson9@gmail.com.</p>
        </div>
    );
}

{
    /* <ol className="list-decimal">
                <li>
                    Compile a list of the addresses you seek to find census date for (for example: 2022 Fall Orchards
                    Listing)
                </li>
                <li>
                    Each address should be on its own line and should be formatted as follows: 970 Jefferson Street NW,
                    Atlanta, GA 30318
                </li>
                <li>
                    Once you have entered all addresses, click submit. The button will be disabled, and a query will run
                    to help validate each address. (This is essentially a request to{" "}
                    <a
                        className="text-blue-600"
                        href="https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress">
                        https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress
                    </a>
                    , which is a geocoding service)
                </li>
                <li>
                    If the address is invalid, it will show that on the page, and the address will be removed from the
                    output list.
                </li>
                <li>
                    To fix this, please use an address nearby (search Google maps for an address that is adjacent) and
                    resubmit to validate.
                </li>
                <li>
                    Once the addresses are validated, the addresses are then passed to the census API (application
                    programming interface-ie- the automation tool) to get the census data.
                </li>
                <li>Once the census data is retrieved, the data is then parsed and formatted in a table format.</li>
                <li>
                    This request may take some time, so be patient. Requests are chucked in groups of 20 to handle large
                    requests and to not stall, so the progress bar will jump in increments to reflect this.
                </li>
                <li>
                    Once the table is complete, you will be prompted with an option to download the excel data. If you
                    need to reset the form, you can do so by clicking the reset button.
                </li>
            </ol> */
}
