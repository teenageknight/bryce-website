function createObject(arr1: any[], arr2: any[]) {
    if (arr1.length !== arr2.length) {
        throw new Error("Arrays must have the same length");
    }

    const obj: any = {};

    for (let i = 0; i < arr1.length; i++) {
        const key = arr1[i];
        const value = arr2[i];

        obj[key] = value;
    }

    return obj;
}

let census_codes: any = {
    POPULATION: "B01001_001E",
    population04: ["B01001_003E", "B01001_027E"],
    population0517: ["B01001_004E", "B01001_005E", "B01001_006E", "B01001_028E", "B01001_029E", "B01001_030E"],
    // Just going to do this as a calculation for now
    // population1864: [
    //     "B01001_007E",
    //     "B01001_008E",
    //     "B01001_009E",
    //     "B01001_010E",
    //     "B01001_011E",
    //     "B01001_012E",
    //     "B01001_013E",
    //     "B01001_014E",
    //     "B01001_015E",
    //     "B01001_016E",
    //     "B01001_017E",
    //     "B01001_018E",
    //     "B01001_019E",
    //     "B01001_031E",
    //     "B01001_032E",
    //     "B01001_033E",
    //     "B01001_034E",
    //     "B01001_035E",
    //     "B01001_036E",
    //     "B01001_037E",
    //     "B01001_038E",
    //     "B01001_039E",
    //     "B01001_040E",
    //     "B01001_041E",
    //     "B01001_042E",
    //     "B01001_043E",
    // ],
    population65: [
        "B01001_020E",
        "B01001_021E",
        "B01001_022E",
        "B01001_023E",
        "B01001_024E",
        "B01001_025E",
        "B01001_044E",
        "B01001_045E",
        "B01001_046E",
        "B01001_047E",
        "B01001_048E",
        "B01001_049E",
    ],
    households: "B11001_001E",
    householdsbp: "B17017_002E",
    mhi: "B19013_001E",
    labor_force: "B23025_002E",
    unemployed: "B23025_005E",
    median_resident_age: "B01002_001E",
    actual_latino: "B03003_003E",
    actual_black: "B02001_003E",
    actual_white: "B02001_002E",
    actual_asian: "B02001_005E",
    actual_indian: "B02001_004E",
    actual_multi_race: "B02001_008E",
};

function add_census_data_to_row(row: any, census_data: any[], index: number) {
    if (census_data.length >= 1) {
        let census_data_final = createObject(census_data[0], census_data[1]);
        let population = census_data_final[census_codes.POPULATION];

        // Population under 4 is sum of boys and girls
        let population04 = 0;
        census_codes.population04.forEach((code: string) => {
            population04 += parseInt(census_data_final[code]);
        });

        let population0517 = 0;
        census_codes.population0517.forEach((code: string) => {
            population0517 += parseInt(census_data_final[code]);
        });

        let population65 = 0;
        census_codes.population65.forEach((code: string) => {
            population65 += parseInt(census_data_final[code]);
        });

        let households = census_data_final[census_codes.households];
        let householdsbp = census_data_final[census_codes.householdsbp];
        let mhi = census_data_final[census_codes.mhi];
        let labor_force = census_data_final[census_codes.labor_force];
        let unemployed = census_data_final[census_codes.unemployed];
        let median_resident_age = census_data_final[census_codes.median_resident_age];
        let actual_latino = census_data_final[census_codes.actual_latino];
        let actual_black = census_data_final[census_codes.actual_black];
        let actual_white = census_data_final[census_codes.actual_white];
        let actual_asian = census_data_final[census_codes.actual_asian];
        let actual_indian = census_data_final[census_codes.actual_indian];
        let actual_multi_race = census_data_final[census_codes.actual_multi_race];

        let rowNumStr = (index + 2).toString();

        row["population"] = population;
        row["population04"] = population04;
        row["population0517"] = population0517;
        row["population1864"] = population - population04 - population0517 - population65;
        row["population65"] = population65;
        row["households"] = households;
        row["householdsbp"] = householdsbp;
        row["perc_house_bp"] = "=O" + rowNumStr + "/N" + rowNumStr;
        row["mhi"] = mhi < -666666 ? "ERROR" : mhi; // -666666 sometimes is returned for this value, not sure why
        row["labor_force"] = labor_force;
        row["unemployed"] = unemployed;
        row["perc_unemployed"] = "=S" + rowNumStr + "/R" + rowNumStr;
        row["median_resident_age"] = median_resident_age;
        row["perc_latino"] = "=W" + rowNumStr + "/J" + rowNumStr;
        row["actual_latino"] = actual_latino;
        row["perc_black"] = "=Y" + rowNumStr + "/J" + rowNumStr;
        row["actual_black"] = actual_black;
        row["perc_white"] = "=AA" + rowNumStr + "/J" + rowNumStr;
        row["actual_white"] = actual_white;
        row["perc_asian"] = "=AC" + rowNumStr + "/J" + rowNumStr;
        row["actual_asian"] = actual_asian;
        row["perc_indian"] = "=AE" + rowNumStr + "/J" + rowNumStr;
        row["actual_indian"] = actual_indian;
        row["perc_multi_race"] = "=AG" + rowNumStr + "/J" + rowNumStr;
        row["actual_multi_race"] = actual_multi_race;
    }

    console.log("row", row);
    return row;
}

export { add_census_data_to_row };
