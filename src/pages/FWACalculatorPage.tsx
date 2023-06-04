import React from "react";

import { validateAddress, getCensusDataQuery } from "../services/functions";
import { add_census_data_to_row } from "../utils/census";
import { ExportExcel } from "../components/export-excel/export-excel";

export function FWACalculatorPage() {
    const [addressInput, setAddressInput] = React.useState<string | undefined>();
    const [submitted, setSubmitted] = React.useState<boolean>(false);
    const [invalidAddresses, setInvalidAddresses] = React.useState<string[] | undefined>([]);
    const [geocodeResults, setGeocodeResults] = React.useState<any[] | undefined>([]);
    const [censusResults, setCensusResults] = React.useState<any[] | undefined>([]);
    const [parsedGeocodeResults, setParsedGeocodeResults] = React.useState<boolean | undefined>(false);
    const [tableData, setTableData] = React.useState<any[] | undefined>([]);
    const [addresses, setAddresses] = React.useState<string[] | undefined>([]);
    const [status, setStatus] = React.useState<string | undefined>("");

    // console.log("geocodeResults", geocodeResults);
    // console.log("addresses", addresses);
    // console.log("addressInput", addressInput);
    console.log("tableData", tableData);

    const handleSubmit = () => {
        let temp_addresses = addressInput?.split("\n") || [];
        if (temp_addresses.length === 0) {
            return;
        }
        console.log("temp_addresses", temp_addresses);
        validateAddress({ addresses: temp_addresses })
            .then(result => {
                let data: any = result.data;
                console.log("data", data);
                let response_addrs: any[] = data.addresses;
                console.log("response_addrs", response_addrs);
                let errors: any[] = data.errors;
                console.log("errors", errors);
                let all_addresses = [...temp_addresses];
                response_addrs.forEach((address: any, index: number) => {
                    console.log("address", !address.result.addressMatches[0]);
                    console.log("length", address.result.addressMatches.length);
                    if (address.result.addressMatches.length === 0 && !address.result.addressMatches[0]) {
                        setInvalidAddresses(prevState => {
                            if (prevState) {
                                let newState = [...prevState];
                                newState.push(all_addresses[index]);
                                return newState;
                            }
                            return prevState;
                        });
                        temp_addresses.splice(index, 1);
                    }
                });
                setAddresses(temp_addresses);
                setGeocodeResults(response_addrs);
            })
            .catch(error => {
                console.log(error);
            });
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
        setSubmitted(false);
    };

    React.useEffect(() => {
        function writeGeocodeToTable(geocodeResults: any) {
            let table: any[] = [];
            geocodeResults.forEach((geocoding_data: any, index: number) => {
                // This is where the table data will be written to the table for the first time.
                if (
                    addresses &&
                    addresses[index] &&
                    geocoding_data["result"]["addressMatches"] &&
                    geocoding_data["result"]["addressMatches"][0]
                ) {
                    var matched_address_result: any = geocoding_data.result.addressMatches[0];
                    var state = matched_address_result["addressComponents"]["state"];
                    var city = matched_address_result["addressComponents"]["city"];
                    var zip_code = matched_address_result["addressComponents"]["zip"];
                    var county = matched_address_result["geographies"]["Counties"][0]["BASENAME"];
                    var county_code = matched_address_result["geographies"]["Census Tracts"][0]["COUNTY"];
                    var tract = matched_address_result["geographies"]["Census Tracts"][0]["BASENAME"];
                    var tract_code = matched_address_result["geographies"]["Census Tracts"][0]["TRACT"];
                    var block_group = matched_address_result["geographies"]["2020 Census Blocks"][0]["BLKGRP"];
                    var address = geocoding_data.result.input.address.address;

                    var row: any = {};
                    row["address"] = address;
                    row["state"] = state;
                    row["city"] = city;
                    row["zip_code"] = zip_code;
                    row["county"] = county;
                    row["county_code"] = county_code;
                    row["tract"] = tract;
                    row["tract_code"] = tract_code;
                    row["block_group"] = block_group;

                    table.push(row);
                    setParsedGeocodeResults(true);
                }
            });
            setTableData(table);
        }
        if (geocodeResults && geocodeResults.length > 0 && !parsedGeocodeResults) {
            console.log("Fired...");
            writeGeocodeToTable(geocodeResults);
        }
    }, [geocodeResults, parsedGeocodeResults, invalidAddresses, addresses]);

    React.useEffect(() => {
        function getCensusData(tableData: any) {
            console.log("Querying Census API");
            getCensusDataQuery({ table: tableData })
                .then((result: any) => {
                    console.log("result", result);
                    setCensusResults(result.data.response);
                })
                .catch((error: any) => {
                    console.log("error", error);
                });
        }

        if (parsedGeocodeResults && censusResults && censusResults.length === 0) {
            getCensusData(tableData);
        }
    }, [censusResults, parsedGeocodeResults, tableData]);

    React.useEffect(() => {
        function parseCensusResults(censusResults: any, tableData: any) {
            let newTable: any[] = [];
            censusResults.forEach((census_data: any, index: number) => {
                let row = add_census_data_to_row(tableData[index], census_data);
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

    return (
        <div>
            <h1>FWA Calculator Page</h1>
            <p>Instructions</p>

            {submitted && (
                <div>
                    <button
                        onClick={() => {
                            handleReset();
                        }}>
                        Reset Form
                    </button>
                </div>
            )}

            <label>
                Addresses:
                <textarea
                    value={addressInput}
                    onChange={event => {
                        setAddressInput(event.target.value);
                    }}
                />
            </label>
            <button
                disabled={submitted}
                onClick={e => {
                    handleSubmit();
                }}>
                Submit
            </button>

            {/* This will be the table. Eventually this needs to be abstracted. */}
            <div>Number of Valid Addresses: {addresses?.length}</div>
            <div>Number of Invalid Addresses: {invalidAddresses?.length}</div>
            {invalidAddresses && invalidAddresses?.length > 0 && (
                <>
                    <div>
                        The following Addresses are invalid. Please use an address nearby to fix this issue and try
                        again.
                    </div>
                    {invalidAddresses?.map((address: string, index: number) => (
                        <div>{address}</div>
                    ))}
                </>
            )}

            <div>{status === "done" && <ExportExcel excelData={tableData} fileName={"output"} />}</div>
        </div>
    );
}
