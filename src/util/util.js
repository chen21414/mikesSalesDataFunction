export const groupBySum = (items, groupByProp, sumProp) => {
  var groups = new Map();
  for (const item of items) {
    if (item[groupByProp] && item[sumProp]) {
      const groupBy = item[groupByProp];
      if (groups.has(groupBy)) {
        const currentValue = groups.get(groupBy);
        groups.set(groupBy, currentValue + item[sumProp]);
      } else {
        groups.set(groupBy, item[sumProp]);
      }
    }
  }
  const sums = [];
  groups.forEach((value, key, m) => {
    sums.push({
      [groupByProp]: key,
      [sumProp]: value,
    });
  });
  return sums;
};

export const withCommas = (x) => {
  //return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const columnMappings = {
  "#": "#",
  "SO No.": "SO_No.",
  "Posting Date": "Posting_Date",
  "Customer Code": "Customer_Code",
  "Customer Name": "Customer_Name",
  "Customer PO": "Customer_PO",
  "Item No.": "Item_No.",
  "Order Qty": "Order_Qty",
  "Open Qty": "Open_Qty",
  "Delivery Date": "Delivery_Date",
  "ETD from Port": "ETD_from_Port",
  Warehouse: "Warehouse",
  "Unit Price": "Unit_Price",
  "Total Amount": "Total_Amount",
};

const objectToArray = (dataObject) => {
  return Object.keys(dataObject).map((idx) => dataObject[idx]);
};

const extractColumns = (columnsObject) => {
  const columns = objectToArray(columnsObject).filter(
    (c) => c.value !== "ETD from Port"
  );
  //console.log("objectToArray", columns);
  const columnNames = columns.map((obj) => columnMappings[obj.value]);
  return columnNames;
};

export const extractSheetData = (excelData) => {
  const rawData = JSON.parse(JSON.stringify(excelData));
  //console.log("rawData", rawData);

  const sheet = rawData.sheets[Object.keys(rawData.sheets)[0]];
  //rawData.sheets[Object.keys(rawData.sheets)[rawData.activeSheetIndex]]; //meaning getting rowdata.sheet with index 1
  //console.log("rawData.sheets", rawData.sheets[Object.keys(rawData.sheets)[0]]);

  const data = objectToArray(sheet.data.dataTable);
  //console.log("data", data);
  //console.log("data", data);
  // since we're expecting column names as a frozen first row, let's extract them
  // and map them back to our data property names so we'll be able to reflect the new
  // data back to the Vuex store.
  //console.dir(columnObject);
  const columnNames = extractColumns(data.shift());
  const newSheetData = [];

  for (const row of data) {
    //console.log("row of data", row);
    const rowData = {};
    const rowArray = objectToArray(row);
    //console.log('rowArray', rowArray)
    rowArray.forEach((val, idx) => {
      rowData[columnNames[idx]] = val.value;
    });
    newSheetData.push(rowData);
  }

  return newSheetData;
};
