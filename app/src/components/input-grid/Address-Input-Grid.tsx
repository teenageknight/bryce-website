/*
    This is a component that will be used to input addresses into the form.
    This is a proof of concept for the more abstract version of the input grid. I am still working on
    writing better and more clean components. This is a way to keep track of my use of certain components for now
    so I know when I refactor them where the issues are
*/
import React, { ReactElement } from "react";
import { InputGrid } from "./Input-Grid";

import type { RowProps } from "./Input-Grid";
import type { FormState } from "../../utils/census/census-types";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface AddressInputGridProps {
    formState: FormState;
    handleAddressInputChange: (e: any) => void;
}

const AddressInputGrid: React.FC<AddressInputGridProps> = p => {
    const { formState, handleAddressInputChange } = p;

    return (
        <InputGrid columns={2}>
            <InputGrid.Row header>
                <p>#</p>
                <p>Address Name</p>
                <p>Status</p>
            </InputGrid.Row>
            {formState.addresses.map(
                (address: string, index: number): ReactElement<RowProps> => (
                    // FIXME: This will need to have some additional logic to determine if the address is valid or not and what is focused on.
                    <InputGrid.Row key={index}>
                        <p>{index + 1}.</p>
                        <p>{address}</p>
                        {formState.addressStatus[index] === "Valid" ? (
                            <CheckCircleIcon color="green" height={"100%"} />
                        ) : formState.addressStatus[index] === "Invalid" ? (
                            <XCircleIcon color="red" height={"100%"} />
                        ) : (
                            <p>{formState.addressStatus[index]}</p>
                        )}
                    </InputGrid.Row>
                )
            )}
            <InputGrid.Row>
                <p>{formState.addresses.length + 1}</p>
                <textarea
                    style={{ width: "90%", backgroundColor: "#282c34", border: "none", resize: "none" }}
                    rows={1}
                    placeholder="Address"
                    value={formState.currentAddressLine}
                    onChange={e => handleAddressInputChange(e)}
                    onKeyDown={e => e.key === "Enter"}
                />
                <p>Plus button to add</p>
            </InputGrid.Row>
        </InputGrid>
    );
};

export { AddressInputGrid };
