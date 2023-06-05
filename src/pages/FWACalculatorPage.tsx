import React from "react";

import { validateAddress, getCensusDataQuery } from "../services/functions";
import { add_census_data_to_row } from "../utils/census";
import { ExportExcel } from "../components/export-excel/export-excel";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ProgressBar from "react-bootstrap/ProgressBar";

type status = "" | "submitted" | "getting-geocode" | "parsing-geocode" | "getting-census" | "parsing-census" | "done";

export function FWACalculatorPage() {
    const [addressInput, setAddressInput] = React.useState<string | undefined>();
    const [submitted, setSubmitted] = React.useState<boolean>(false);
    const [invalidAddresses, setInvalidAddresses] = React.useState<string[] | undefined>([]);
    const [geocodeResults, setGeocodeResults] = React.useState<any[] | undefined>([]);
    const [censusResults, setCensusResults] = React.useState<any[] | undefined>([]);
    const [parsedGeocodeResults, setParsedGeocodeResults] = React.useState<boolean | undefined>(false);
    const [tableData, setTableData] = React.useState<any[] | undefined>([]);
    const [addresses, setAddresses] = React.useState<string[] | undefined>([]);
    const [status, setStatus] = React.useState<status | undefined>("");
    const [progress, setProgress] = React.useState<number | undefined>(0);

    // console.log("geocodeResults", geocodeResults);
    // console.log("addresses", addresses);
    // console.log("addressInput", addressInput);
    // console.log("tableData", tableData);

    const handleSubmit = () => {
        setStatus("submitted");
        let temp_addresses = addressInput?.split("\n") || [];

        if (temp_addresses.length === 0) {
            return;
        }

        setStatus("getting-geocode");
        validateAddress({ addresses: temp_addresses })
            .then(result => {
                let data: any = result.data;
                let response_addrs: any[] = data.addresses;
                let errors: any[] = data.errors;
                console.log("errors", errors);
                let all_addresses = [...temp_addresses];
                response_addrs.forEach((address: any, index: number) => {
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
        setProgress(0);
        setSubmitted(false);
    };

    React.useEffect(() => {
        function writeGeocodeToTable(geocodeResults: any) {
            setStatus("parsing-geocode");
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
            setStatus("getting-census");
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
            setStatus("parsing-census");
            let newTable: any[] = [];
            censusResults.forEach((census_data: any, index: number) => {
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
        if (status === "getting-geocode") {
            setProgress(20);
        } else if (status === "parsing-geocode") {
            setProgress(60);
        } else if (status === "getting-census") {
            setProgress(80);
        } else if (status === "parsing-census") {
            setProgress(90);
        } else if (status === "done") {
            setProgress(100);
        }
    }, [status]);

    return (
        <div style={{ marginLeft: "2%", marginRight: "2%", marginTop: "10px" }}>
            <h1>FWA Census Calculator Tool</h1>
            <p>
                This calculator tool will help automate the process of finding and reporting census data surrounding the
                farm, community garden, and orchard sites in Food Well Alliance’s service area.
            </p>
            <ol>
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
                    <a href="https://geocoding.geo.census.gov/geocoder/geographies/onelineaddress">
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
                <li>This request may take some time, so be patient.</li>
                <li>
                    Once the table is complete, you will be prompted with an option to download the excel data. If you
                    need to reset the form, you can do so by clicking the reset button.
                </li>
            </ol>
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
                <Form.Label style={{ width: "100%", fontSize: 20 }}>
                    Addresses:
                    <Form.Control
                        as={"textarea"}
                        value={addressInput}
                        style={{ height: "200px", width: "60%" }}
                        onChange={event => {
                            setAddressInput(event.target.value);
                        }}
                    />
                </Form.Label>
            </div>
            <Button
                variant="primary"
                disabled={submitted}
                onClick={e => {
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
                        <div>{address}</div>
                    ))}
                </>
            )}
            <div style={{ marginTop: 20 }}>
                {status === "done" && <ExportExcel excelData={tableData} fileName={"output"} />}
            </div>
        </div>
    );
}
