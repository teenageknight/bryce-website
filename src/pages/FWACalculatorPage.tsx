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
                row["address"] = geocoding_data.address_formatted;
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
        <div style={{ marginLeft: "2%", marginRight: "2%", marginTop: "10px" }}>
            <h1>Census Data Automation Tool</h1>
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
                <li>
                    This request may take some time, so be patient. Requests are chucked in groups of 20 to handle large
                    requests and to not stall, so the progress bar will jump in increments to reflect this.
                </li>
                <li>
                    Once the table is complete, you will be prompted with an option to download the excel data. If you
                    need to reset the form, you can do so by clicking the reset button.
                </li>
            </ol>
            <p>For any inquires, please reach out to bkajackson9@gmail.com.</p>
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
                        <div key={index}>{address}</div>
                    ))}
                </>
            )}
            <div style={{ marginTop: 20 }}>
                {status === "done" && <ExportExcel excelData={tableData} fileName={"output"} />}
            </div>
        </div>
    );
}
