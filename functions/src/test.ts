const fs = require("fs");
const { parse } = require("csv-parse");

let data = [];

async function parseFile(filePath) {
    let x = fs
        .createReadStream("./cjest.csv")
        .pipe(
            parse({
                delimiter: ",",
                columns: true,
                ltrim: true,
            })
        )
        .on("data", function (row) {
            // 👇 push the object row into the array
            data.push(row);
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", function () {
            // 👇 log the result array
            console.log("parsed csv data:");
            console.log(data);
        });
    return x;
}

parseFile("./cjest.csv").then(d => {
    console.log("done");
    // console.log(d);
});
console.log("Finished");
