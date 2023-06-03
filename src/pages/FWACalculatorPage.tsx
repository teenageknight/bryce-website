import React from "react";

export function FWACalculatorPage() {
    const GEOCODING_BASE_URL = "/geocoder/geographies/onelineaddress?";

    const [addressInput, setAddressInput] = React.useState<string | undefined>();
    const [unsavedChanges, setUnsavedChanges] = React.useState<boolean>(false);
    const [validAddresses, setValidAddresses] = React.useState<(boolean | string)[] | undefined>([]);
    const [addresses, setAddresses] = React.useState<string[] | undefined>([]);

    console.log(validAddresses);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAddresses(addressInput?.split("\n"));

        setUnsavedChanges(false);
    };

    React.useEffect(() => {
        function validateAddresses() {
            setValidAddresses(new Array(addresses?.length).fill("loading"));
            addresses?.forEach(async (address, index) => {
                await validateAddress(address, index);
            });
        }
        if (addresses && addresses.length > 0) {
            validateAddresses();
        }
    }, [addresses]);

    const validateAddress = async (address: string, index: number) => {
        let params = "address=" + encodeURI(address) + "&benchmark=4&vintage=4&format=json";
        console.log(params);
        let x = await fetch(GEOCODING_BASE_URL + params, { method: "GET" });
        let response = await x.json();
        console.log(response);
        if (response.result.addressMatches.length > 0 && response.result.addressMatches[0]) {
            setValidAddresses(prevState => {
                if (prevState) {
                    let newState = [...prevState];
                    newState[index] = true;
                    return newState;
                }
                return prevState;
            });
        }
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
            {addresses && addresses.length > 0 && (
                <div>
                    <p>Before you submit, verify the following information...</p>
                    <p>Number of Addresses: {addresses.length}</p>
                    {addresses.map((address, index) => (
                        <div>
                            <div>{index + 1 + ": " + address}</div>
                            {validAddresses && validAddresses.length == addresses.length && (
                                <div>{validAddresses[index].toString()}</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
