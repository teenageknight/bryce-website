import React from "react";
import XLSX from "sheetjs-style";
import * as FileSaver from "file-saver";

type ExcelDataProps = {
    excelData: any;
    fileName: string;
};

const ExportExcel: React.FC<ExcelDataProps> = p => {
    const { excelData, fileName } = p;

    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    const exportToExcel = async (fileName: string) => {
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    return (
        <>
            <button onClick={e => exportToExcel(fileName)} color="primary">
                Export to Excel
            </button>
        </>
    );
};

export { ExportExcel };
