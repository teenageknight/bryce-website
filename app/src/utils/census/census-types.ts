type FormState = {
    currentAddressLine: string;
    addresses: string[];
    addressStatus: string[]; // This might become an enum or something else later
    status: string;
    geocodeResults: any[];
    tableData: any[];
};

type status =
    | ""
    | "validating-addresses"
    | "addresses-validated"
    | "submitted"
    | "parsing-geocode"
    | "getting-census"
    | "parsing-census"
    | "done";

export type { FormState, status };
