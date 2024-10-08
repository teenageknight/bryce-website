/**
 * The following file is to take all of the data in the cjest.csv file and write it to the
 * cjest collection in the firestore database. It has to do this line by line and in batches
 * becuase JS is an extremly memory intensive language that can't handle large amounts of data.
 *
 * Addittionally, be very carefule running this again future self. I have written up to line 15000 in the
 * cjest.csv before killing the program so I wouldnt go bankrupt from the cost of cloud computing. I have
 * also temporarly disabled all writes to the database since I dont have time to properly test Rules for
 * this collection, and dont want to risk losing all my money with that either.
 */
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const readline = require("readline");

const fileStream = fs.createReadStream("./Georgia_EPA_Data.csv");

const config = {
    credential: cert(require("../service-account-keys/bryce-jackson-website-firebase-adminsdk-ra4es-7428ff5320.json")),
};

initializeApp(config);

const db = getFirestore();

let batch = db.batch();

// Set the value of the CJEST collection
const cjestRef = db.collection("cjest-epa");

async function readLineByLine() {
    let isFirstLine = true;
    let headers = [];

    // Create an interface to read the file line by line
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity, // Recognize all instances of CR LF ('\r\n') as line breaks
    });

    let num = 0;

    for await (const line of rl) {
        console.log("line", num);
        if (isFirstLine) {
            headers = line.split(",");
            isFirstLine = false;
        } else {
            const data = line.split(",");
            let cjestData = {};
            for (let i = 0; i < headers.length; i++) {
                const header = headers[i];
                const value = data[i];
                cjestData[header] = value === undefined ? "" : value;
            }
            batch.set(cjestRef.doc(cjestData["ID"]), cjestData);
        }
        num++;

        if (num % 100 === 0) {
            console.log("cunching");
            await batch.commit();
            batch = db.batch();
        }
    }
    console.log("Finished reading the file.");

    batch.commit();
}

readLineByLine();
