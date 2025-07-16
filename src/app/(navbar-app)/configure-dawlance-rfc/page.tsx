"use client";

import { useEffect, useState } from "react";
import ConfigTable from "@/components/config-dawlance-rfc/ConfigTable";

export default function ConfigureDawlanceRFC() {
  const [selectedMonth, setSelectedMonth] = useState<string>("8");
  const [selectedYear, setSelectedYear] = useState<string>("2025");
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const FetchTableData = async () => {
      try {
        const query = new URLSearchParams();
        query.append("month", selectedMonth);
        query.append("year", selectedYear);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/dawlance-product-rfc?${query}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        setTableData(data?.data);
      } catch (error) {
        console.error("the error = ", error);
      }
    };
    FetchTableData();
  }, []);

  console.log("the data", tableData);

  return (
    <ConfigTable
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      tableData={tableData}
    />
  );
}
