import React, { useState, useEffect } from "react";
import { TablePanel } from "./TablePanel";

// SpreadJS imports
import "@grapecity/spread-sheets-react";
/* eslint-disable */
import "@grapecity/spread-sheets/styles/gc.spread.sheets.excel2016colorful.css";
import {
  SpreadSheets,
  Worksheet,
  Column,
} from "@grapecity/spread-sheets-react";

import { IO } from "@grapecity/spread-excelio";
import { saveAs } from "file-saver";

import { extractSheetData } from "../util/util.js";

export const SalesTable = ({
  tableData,
  valueChangedCallback,
  fileImportedCallback,
}) => {
  const config = {
    sheetName: "Sales Data",
    hostClass: " spreadsheet",
    autoGenerateColumns: false,
    width: 200,
    visible: true,
    resizable: true,
    priceFormatter: "$ #.00",
    chartKey: 1,
  };

  function handleValueChanged(e, obj) {
    valueChangedCallback(obj.sheet.getDataSource());
  }
  handleValueChanged.bind(this);

  function exportSheet() {
    const spread = _spread;
    const fileName = "SalesData.xlsx";
    const sheet = spread.getSheet(0);
    const excelIO = new IO();
    const json = JSON.stringify(
      spread.toJSON({
        includeBindingSource: true,
        columnHeadersAsFrozenRows: true,
      })
    );
    excelIO.save(
      json,
      (blob) => {
        saveAs(blob, fileName);
      },
      function (e) {
        alert(e);
      }
    );
  }

  const [_spread, setSpread] = useState({});
  const [newSums, setNewSums] = useState([]);

  function workbookInit(spread) {
    setSpread(spread);
  }

  function fileChange(e) {
    if (_spread) {
      const fileDom = e.target || e.srcElement;
      const excelIO = new IO();
      const spread = _spread;
      const deserializationOptions = {
        frozenRowsAsColumnHeaders: true,
      };
      excelIO.open(fileDom.files[0], (data) => {
        const newSalesData = extractSheetData(data);
        fileImportedCallback(newSalesData);
      });
    }
  }

  //const sums = [];

  const groupBySum = (
    items,
    groupByProp,
    sumProp,
    keyProp,
    valueProp,
    isCurrent,
    isFuture,
    monthProp
  ) => {
    const date = new Date();

    function mydate(date) {
      return new Date(date);
    }
    function getLastDayOfMonth(year, month) {
      return new Date(year, month + 1, -2);
    }
    // 👇️ Last Three Day of CURRENT MONTH
    function checkThreeDaysBeforeMonth() {
      const lastDayCurrentMonth = getLastDayOfMonth(
        date.getFullYear(),
        date.getMonth()
      );

      if (new Date() > lastDayCurrentMonth) {
        return true;
      } else {
        return false;
      }
    }
    //console.log(!checkThreeDaysBeforeMonth());
    function isGoToNextYear(monthIdx, dateIdx) {
      if (
        mydate(
          `${
            date.getMonth() + monthIdx
          }/${date.getDate()}/${date.getFullYear()}`
        ) >= mydate(`12/31/${date.getFullYear()}`)
      ) {
        return `${date.getMonth() + monthIdx - 12}/${dateIdx}/${
          date.getFullYear() + 1
        }`;
      } else if (
        mydate(
          `${
            date.getMonth() + monthIdx
          }/${date.getDate()}/${date.getFullYear()}`
        ) <= mydate(`12/31/${date.getFullYear()}`)
      ) {
        return `${date.getMonth() + monthIdx}/${dateIdx}/${date.getFullYear()}`;
      }
    }
    var groups = new Map();

    const filterItems = items.filter(function (it) {
      it.Total_Amount = Number(it.Open_Qty) * Number(it.Unit_Price);

      if (isCurrent && !isFuture) {
        if (checkThreeDaysBeforeMonth()) {
          return (
            mydate(it.Delivery_Date) >= mydate(`${date.getMonth()}/1/2018`) &&
            mydate(it.Delivery_Date) <=
              mydate(
                `${isGoToNextYear(monthProp + 1, 22)}`
                //`${date.getMonth() + monthProp + 1}/22/${date.getFullYear()}`
              )
          );
        } else if (!checkThreeDaysBeforeMonth()) {
          return (
            mydate(it.Delivery_Date) >= mydate(`${date.getMonth()}/1/2018`) &&
            mydate(it.Delivery_Date) <=
              mydate(
                `${isGoToNextYear(monthProp, 22)}`
                //`${date.getMonth() + monthProp}/22/${date.getFullYear()}`
              )
          );
        }
      } else if (!isCurrent && !isFuture) {
        if (checkThreeDaysBeforeMonth()) {
          return (
            mydate(it.Delivery_Date) >=
              mydate(
                `${isGoToNextYear(monthProp, 23)}`
                //`${date.getMonth() + monthProp}/23/${date.getFullYear()}`
              ) &&
            mydate(it.Delivery_Date) <=
              mydate(
                `${isGoToNextYear(monthProp + 1, 22)}`
                //`${date.getMonth() + monthProp + 1}/22/${date.getFullYear()}`
              )
          );
        } else if (!checkThreeDaysBeforeMonth()) {
          return (
            mydate(it.Delivery_Date) >=
              mydate(
                `${isGoToNextYear(monthProp - 1, 23)}`
                //`${date.getMonth() + monthProp - 1}/23/${date.getFullYear()}`
              ) &&
            mydate(it.Delivery_Date) <=
              mydate(
                `${isGoToNextYear(monthProp, 22)}`
                //`${date.getMonth() + monthProp}/22/${date.getFullYear()}`
              )
          );
        }
      } else if (!isCurrent && isFuture) {
        if (checkThreeDaysBeforeMonth()) {
          return (
            mydate(it.Delivery_Date) >=
              mydate(
                `${isGoToNextYear(monthProp, 23)}`
                //`${date.getMonth() + 3}/23/${date.getFullYear()}`
              ) && mydate(it.Delivery_Date) <= mydate(`12/31/2050`)
          );
        } else if (!checkThreeDaysBeforeMonth()) {
          return (
            mydate(it.Delivery_Date) >=
              mydate(
                `${isGoToNextYear(monthProp - 1, 23)}`
                //`${date.getMonth() + 3}/23/${date.getFullYear()}`
              ) &&
            //mydate(`12/31/22`) &&
            mydate(it.Delivery_Date) <= mydate(`12/31/2050`)
          );
        }
      }
    });

    console.log("filterItems", filterItems);

    for (const item of filterItems) {
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
        // [groupByProp]: key,
        // [sumProp]: value,
        [keyProp]: key,
        [valueProp]: value,
      });
    });
    console.log("sum", sums);
    return sums;
  };

  function chartData() {
    const items = tableData;
    //const groups = groupBySum(items, "Customer_Name", "Total_Amount");
    //let groups;

    //method 1:
    // for (let i = 1; i <= 4; i++) {
    //   switch (i) {
    //     case 1:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "This_Month",
    //         "This_Total",
    //         true,
    //         false,
    //         1
    //       );
    //       break;
    //     case 2:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "Next_Month",
    //         "Next_Total",
    //         false,
    //         false,
    //         2
    //       );
    //       break;
    //     case 3:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "Two_Month",
    //         "Two_Total",
    //         false,
    //         false,
    //         3
    //       );
    //       break;
    //     case 4:
    //       groupBySum(
    //         items,
    //         "Customer_Name",
    //         "Total_Amount",
    //         "Future_Month",
    //         "Future_Total",
    //         false,
    //         true,
    //         4
    //       );
    //       break;
    //   }
    // }

    //mtehod 2:
    //  function atOnce(...fns) {
    //   return function(...args) {
    //     for (const fn of fns){
    //       fn.apply(this, args)
    //     }
    //   }
    // }

    // let one = atOnce(groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "This_Month",
    //   "This_Total",
    //   true,
    //   false,
    //   1
    // ), groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "Next_Month",
    //   "Next_Total",
    //   false,
    //   false,
    //   2
    // ), groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "Two_Month",
    //   "Two_Total",
    //   false,
    //   false,
    //   3
    // ), groupBySum(
    //   items,
    //   "Customer_Name",
    //   "Total_Amount",
    //   "Future_Month",
    //   "Future_Total",
    //   false,
    //   true,
    //   4
    // ))

    //method 3:
    const p1 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "This_Month",
          "This_Total",
          true,
          false,
          1
        )
      );
    });

    const p2 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "Next_Month",
          "Next_Total",
          false,
          false,
          2
        )
      );
    });

    const p3 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "Two_Month",
          "Two_Total",
          false,
          false,
          3
        )
      );
    });

    const p4 = new Promise((resolve, reject) => {
      resolve(
        groupBySum(
          items,
          "Customer_Name",
          "Total_Amount",
          "Future_Month",
          "Future_Total",
          false,
          true,
          4
        )
      );
    });

    Promise.all([p1, p2, p3, p4]).then((results) => {
      let flatten = results.flat();
      console.log("result,", flatten);
      setNewSums(flatten); 
    });

    //return newSums;
  }
  console.log("newSums", newSums);

  useEffect(() => {
    chartData();
  }, [tableData]);

  //method 4:
  // async function waitAlittle() {
  //   await new Promise((resolve, reject) => resolve(chartData()))

  //   let groups = await sums;

  //   console.log('awaited')

  //    return groups;
  // }

  // waitAlittle().then(value=>{
  //   console.log('value', value)
  //   //setNewSums((prev)=>[...prev, value]) 
  //   console.log(newSums)
  // });

  return (
    <TablePanel key={config.chartKey} title="Recent Sales">
      <SpreadSheets
        hostClass={config.hostClass}
        workbookInitialized={workbookInit}
        valueChanged={handleValueChanged}
      >
        <Worksheet
          name={config.sheetName}
          dataSource={newSums}
          autoGenerateColumns={config.autoGenerateColumns}
        >
          <Column
            width={200}
            dataField="This_Month"
            headerText="Customer Name"
          ></Column>
          <Column
            width={150}
            dataField="This_Total"
            headerText="Total This Month"
            formatter={config.chartKey}
            resizable="resizable"
          ></Column>
          <Column
            width={200}
            dataField="Next_Month"
            headerText="Customer Name"
          ></Column>
          <Column
            width={150}
            dataField="Next_Total"
            headerText="Total Next Month"
            formatter={config.chartKey}
            resizable="resizable"
          ></Column>
          <Column
            width={200}
            dataField="Two_Month"
            headerText="Customer Name"
          ></Column>
          <Column
            width={150}
            dataField="Two_Total"
            headerText="Total Two Month"
            formatter={config.chartKey}
            resizable="resizable"
          ></Column>
          <Column
            width={200}
            dataField="Future_Month"
            headerText="Customer Name"
          ></Column>
          <Column
            width={150}
            dataField="Future_Total"
            headerText="Total Future"
            formatter={config.chartKey}
            resizable="resizable"
          ></Column>
        </Worksheet>
      </SpreadSheets>

      <div className="dashboardRow">
        {/* EXPORT TO EXCEL */}
        <button
          className="btn btn-primary dashboardButton"
          onClick={exportSheet}
        >
          Export to Excel
        </button>
        {/* IMPORT FROM EXCEL */}
        <div>
          <b>Import Excel File:</b>
          <div>
            <input
              type="file"
              className="fileSelect"
              onChange={(e) => fileChange(e)}
            />
          </div>
        </div>
      </div>
    </TablePanel>
  );
};
