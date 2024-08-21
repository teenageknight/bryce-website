import React, { useEffect, useReducer } from "react";

import { validateAddress, getCensusDataQuery } from "../services/functions";
import { add_census_data_to_row } from "../utils/census";
import { ExportExcel } from "../components/export-excel/export-excel";
import { Button } from "../components/button/Button";
import { ProgressBar } from "../components/progress-bar/Progress-Bar";

type status =
    | ""
    | "validating-addresses"
    | "addresses-validated"
    | "submitted"
    | "getting-geocode"
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
};

enum AddressStatus {
    Pending = "Pending",
    Valid = "Valid",
    Invalid = "Invalid",
}

export function FWACalculatorPage() {
    const [submitted, setSubmitted] = React.useState<boolean>(false);
    const [invalidAddresses, setInvalidAddresses] = React.useState<string[] | undefined>([]);
    const [geocodeResults, setGeocodeResults] = React.useState<any[] | undefined>([]);
    const [censusResults, setCensusResults] = React.useState<any[] | undefined>([]);
    const [parsedGeocodeResults, setParsedGeocodeResults] = React.useState<boolean | undefined>(false);
    const [tableData, setTableData] = React.useState<any[] | undefined>([]);
    const [addresses, setAddresses] = React.useState<string[] | undefined>([]);
    const [status, setStatus] = React.useState<status | undefined>("");
    const [progress, setProgress] = React.useState<number | undefined>(0);

    const initialFormState: FormState = {
        currentAddressLine: "",
        addresses: [],
        addressStatus: [],
        status: "",
        geocodeResults: [],
    };

    function formReducer(state: FormState, action: any): FormState {
        switch (action.type) {
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
                    addressStatus: action.payload,
                    status: "validating-addresses",
                };
            case "update_address_status_done":
                return {
                    ...state,
                    addressStatus: action.payload,
                    // TODO: Add the geocode results to the state
                    status: "addresses-validated",
                };
            default:
                return state;
        }
    }

    const [formState, formDispatch] = useReducer(formReducer, initialFormState);

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

    useEffect(() => {
        // If the lengths are diffrent, then we need to update the address status
        if (formState.addresses.length !== formState.addressStatus.length) {
            // Lazy load the address status and if it valid or not
            let addressStatus = new Array(formState.addresses.length).fill(AddressStatus.Pending) as string[];
            formDispatch({ type: "update_address_status_pending", payload: addressStatus });
            return;
        }
    }, [formState.addresses, formState.addressStatus]);

    useEffect(() => {
        const doWork = async () => {
            console.log("doing work");
            let numPending = 0;
            let indexes = [];
            let chunked_addresses: string[] = [];
            let promises: Promise<any>[] = [];
            for (let i = 0; i < formState.addresses.length; i++) {
                if (formState.addressStatus[i] === AddressStatus.Pending) {
                    console.log("pushing");
                    chunked_addresses.push(formState.addresses[i]);
                    indexes.push(i);
                    numPending++;
                }
                if (chunked_addresses.length === 20) {
                    console.log("chunked");
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
            console.log("results", results);
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
            for (let i = 0; i < indexes.length; i++) {
                if (resultsFormatted.invalid_addresses.includes(formState.addresses[indexes[i]])) {
                    tempStatus[indexes[i]] = AddressStatus.Invalid;
                } else {
                    tempStatus[indexes[i]] = AddressStatus.Valid;
                }
            }

            formDispatch({ type: "update_address_status_done", payload: tempStatus });
        };

        if (formState.status === "validating-addresses") {
            doWork();
        }
    }, [formState.status]);

    const handleSubmit = async () => {
        setStatus("submitted");
        let all_addresses = addressInput?.split("\n") || [];
        let geocode_results: any[] = [];
        let valid_addresses: string[] = [];
        let invalid_addresses: string[] = [];

        if (all_addresses.length === 0) {
            return;
        }

        setStatus("getting-geocode");
        setProgress(20);
        // Chuck the responses in groups of 20, an arbitrary number that should keep runtimes low and show progress.
        for (let i = 0; i < all_addresses.length / 20; i++) {
            try {
                var chunked_addresses = all_addresses.slice(
                    i * 20, // Starting at the index of the current chunk
                    i * 20 + 20 // Going to the index plus 20, if it is greater than the length of the array, it will just go to the end.
                );
                let result = await validateAddress({ addresses: chunked_addresses });
                let data: any = result.data;
                let response_addrs: any[] = data.addresses;
                let invalidAddresses: any[] = data.invalid_addresses;
                let validAddresses: any[] = data.valid_addresses;

                console.log("response_addrs", response_addrs);
                console.log("errors", invalid_addresses);
                console.log("data", data);

                invalid_addresses = invalid_addresses.concat(invalidAddresses);
                valid_addresses = valid_addresses.concat(validAddresses);
                geocode_results = geocode_results.concat(response_addrs);
            } catch (err) {
                console.log(err);
                alert("Something went wrong. Please try again.");
            }

            let tempProgressPercent = i + 1 / (all_addresses.length / 20) > 1 ? 1 : i + 1 / (all_addresses.length / 20);
            setProgress(20 + tempProgressPercent * 40);
        }
        setInvalidAddresses(invalid_addresses);
        setAddresses(valid_addresses);
        setGeocodeResults(geocode_results);
        setSubmitted(true);
    };

    const handleReset = () => {
        setAddressInput("");
        setInvalidAddresses([]);
        setGeocodeResults([]);
        setCensusResults([]);
        setParsedGeocodeResults(false);
        setTableData([]);
        setAddresses([]);
        setStatus("");
        setProgress(0);
        setSubmitted(false);
    };

    React.useEffect(() => {
        function writeGeocodeToTable(geocodeResults: any) {
            setStatus("parsing-geocode");
            let table: any[] = [];
            geocodeResults.forEach((geocoding_data: any) => {
                // This is where the table data will be written to the table for the first time.
                var row: any = {};
                row["address"] = geocoding_data.formatted_address;
                row["state"] = geocoding_data.state;
                row["state_code"] = geocoding_data.state_code;
                row["city"] = geocoding_data.city;
                row["zip_code"] = geocoding_data.zip_code;
                row["county"] = geocoding_data.county;
                row["county_code"] = geocoding_data.county_code;
                row["tract"] = geocoding_data.tract;
                row["tract_code"] = geocoding_data.tract_code;
                row["block_group"] = geocoding_data.block_group;

                table.push(row);
                setParsedGeocodeResults(true);
            });
            setTableData(table);
        }
        if (geocodeResults && geocodeResults.length > 0 && !parsedGeocodeResults) {
            writeGeocodeToTable(geocodeResults);
        }
    }, [geocodeResults, parsedGeocodeResults, invalidAddresses, addresses]);

    React.useEffect(() => {
        async function getCensusData(tableData: any) {
            setStatus("getting-census");
            setProgress(65);
            // Same thing as geocode, chunk in groups of 20, update progress bar accordingly, both to limit runtime and show progress.
            // Could consider in the future running the code in sync, but that would be a lot of requests.
            let censusResults: any[] = [];

            for (let i = 0; i < tableData.length / 20; i++) {
                console.log(i);
                console.log("getting query");
                let result: any = await getCensusDataQuery({ table: tableData.slice(i * 20, i * 20 + 20) }).catch(
                    (err: any) => console.log(err)
                );
                let tempProgressPercent = i + 1 / (tableData.length / 20) > 1 ? 1 : i + 1 / (tableData.length / 20);
                setProgress(65 + tempProgressPercent * 30);
                censusResults = censusResults.concat(result.data.response);
            }
            setCensusResults(censusResults);
        }

        if (parsedGeocodeResults && censusResults && censusResults.length === 0) {
            getCensusData(tableData);
        }
    }, [censusResults, parsedGeocodeResults, tableData]);

    React.useEffect(() => {
        function parseCensusResults(censusResults: any, tableData: any) {
            setStatus("parsing-census");
            let newTable: any[] = [];
            censusResults.forEach((census_data: any, index: number) => {
                // console.log(tableData[index])
                let row = add_census_data_to_row(tableData[index], census_data, index);
                newTable.push(row);
            });
            setTableData(newTable);
            setStatus("done");
        }
        if (censusResults && censusResults.length > 0 && tableData && status !== "done") {
            // console.log("censusResults", censusResults);
            parseCensusResults(censusResults, tableData);
        }
    }, [censusResults, status, tableData]);

    React.useEffect(() => {
        if (status === "parsing-geocode") {
            setProgress(60);
        } else if (status === "parsing-census") {
            setProgress(95);
        } else if (status === "done") {
            setProgress(100);
        }
    }, [status]);

    return (
        <div className="px-10" style={{ marginTop: "10px" }}>
            <h1 className="text-3xl">Census Data Automation Tool</h1>
            {/* FIXME: Add in tooltip beside this title, showing the instructions commented out below */}
            <p className="text-[#8D96A0]">
                This calculator tool will help automate the process of finding and reporting census data surrounding the
                farm, community garden, and orchard sites in Food Well Alliance’s service area.
            </p>
            {submitted && (
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
                {/* <Form.Label style={{ width: "100%", fontSize: 20 }}>
                    Addresses: <br />
                    <Form.Control
                        as={"textarea"}
                        value={addressInput}
                        style={{ height: "200px", width: "60%", color: "black" }}
                        onChange={event => {
                            setAddressInput(event.target.value);
                        }}
                    />
                </Form.Label> */}
            </div>
            <Button
                variant="primary"
                disabled={true}
                onClick={_ => {
                    handleSubmit();
                }}>
                Submit
            </Button>

            <div style={{ marginTop: 15, marginBottom: 15 }}>
                <div>Status: {status === "" ? "Waiting..." : status}</div>
                <ProgressBar now={progress} />
            </div>

            <div>Number of Valid Addresses: {addresses?.length}</div>
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
