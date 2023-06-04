import { getFunctions, httpsCallable } from "firebase/functions";
import { HttpsCallable } from "@firebase/functions-types";

import { app } from "../index";

const functions = getFunctions(app);

const validateAddressTest = httpsCallable(functions, "validateAddresses");

export { validateAddressTest };
