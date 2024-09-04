import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "../button/Button";

// Documentation for XLSX
// https://docs.sheetjs.com/docs/

type ExcelDataProps = {
    excelData: any;
    fileName: string;
};

const ExportExcel: React.FC<ExcelDataProps> = p => {
    const { excelData, fileName } = p;
    console.log(excelData);
    console.log(fileName);

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const exportToExcel = async (fileName: string) => {
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        // Export the file to save it
        const data = new Blob([excelBuffer], { type: fileType });
        saveAs(data, fileName + fileExtension);
    };

    return (
        <>
            <Button variant="success" onClick={e => exportToExcel(fileName)}>
                Export to Excel
            </Button>
        </>
    );
};

export { ExportExcel };
