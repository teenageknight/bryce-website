import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";

import { app } from "../index";

const functions = getFunctions(app);

if (location.hostname === "localhost") {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

const validateAddress = httpsCallable(functions, "validateAddresses");
const getCensusDataQuery = httpsCallable(functions, "getCensusDataQuery");

export { validateAddress, getCensusDataQuery, functions };
