import React from "react";

import { validateAddressTest } from "../services/functions";

export function FWACalculatorPage() {
    const [addressInput, setAddressInput] = React.useState<string | undefined>();
    const [unsavedChanges, setUnsavedChanges] = React.useState<boolean>(false);
    const [validAddresses, setValidAddresses] = React.useState<(boolean | string)[] | undefined>([]);
    const [geocodeResults, setGeocodeResults] = React.useState<any[] | undefined>([]);
    const [addresses, setAddresses] = React.useState<string[] | undefined>([]);

    console.log("geocodeResults", geocodeResults);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAddresses(addressInput?.split("\n"));

        setValidAddresses(new Array(addresses?.length).fill("loading"));
        validateAddressTest({ addresses: addresses })
            .then(result => {
                let data: any = result.data;
                console.log("data", data);
                let response_addrs: any[] = data.addresses;
                console.log("response_addrs", response_addrs);
                let errors: any[] = data.errors;
                console.log(errors);
                setGeocodeResults(response_addrs);
                response_addrs.forEach((address: any, index: number) => {
                    if (address.result.addressMatches.length > 0 && address.result.addressMatches[0]) {
                        setValidAddresses(prevState => {
                            if (prevState) {
                                let newState = [...prevState];
                                newState[index] = true;
                                return newState;
                            }
                            return prevState;
                        });
                    } else {
                        setValidAddresses(prevState => {
                            if (prevState) {
                                let newState = [...prevState];
                                newState[index] = false;
                                return newState;
                            }
                            return prevState;
                        });
                    }
                });
            })
            .catch(error => {
                console.log(error);
            });

        setUnsavedChanges(false);
    };

    return (
        <div>
            <h1>FWA Calculator Page</h1>
            <p>Instructions</p>
            <form onSubmit={handleSubmit}>
                <label>
                    Addresses:
                    <textarea
                        value={addressInput}
                        onChange={event => {
                            if (!unsavedChanges) {
                                setUnsavedChanges(true);
                            }
                            setAddressInput(event.target.value);
                        }}
                    />
                </label>
                <input type="submit" value="Submit" />
            </form>

            {/* This will be the table. Eventually this needs to be abstracted. */}
            <div>Number of Addresses: {addresses?.length}</div>
            <div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                    <div>Num</div>
                    <div>Valid Address</div>
                    <div>Address</div>
                </div>
                {addresses?.map((address, index) => (
                    <div key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                        <div>{index + 1}</div>
                        <div>
                            {validAddresses && validAddresses.length === addresses.length ? (
                                <div>{validAddresses[index] ? "Valid" : "Invalid"}</div>
                            ) : (
                                <div>loading</div>
                            )}
                        </div>
                        <div>{address}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
