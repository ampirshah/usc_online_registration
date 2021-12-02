let methods = {};
let XLSX = require('xlsx')
let workbook = XLSX.readFile('./stdNumber.xlsx');
let sheet_name_list = workbook.SheetNames;
let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

methods.checkIfValid = (stdId, nationalCode) => {
    const found = xlData.find(element => parseInt(element.stdId) === parseInt(stdId) && parseInt(element.nationalCode) === parseInt(nationalCode));

    if (found) {
        return {
            "status": 1
        }
    } else {
        return {
            "status": 0
        }
    }
};


module.exports = methods;
