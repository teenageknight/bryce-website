import { getFunctions, httpsCallable } from "firebase/functions";

import { app } from "../index";

const functions = getFunctions(app);

const validateAddress = httpsCallable(functions, "validateAddresses");
const getCensusDataQuery = httpsCallable(functions, "getCensusDataQuery");

export { validateAddress, getCensusDataQuery };
