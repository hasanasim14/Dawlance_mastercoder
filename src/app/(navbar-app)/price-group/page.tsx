"use client";

import { useEffect, useState } from "react";
import { PaginationData } from "@/lib/types";

interface PriceGroupProps {
  "Price Group": string;
  "Min Price": number | null;
  "Max Price": number | null;
}

export default function PriceGroup() {
  const [priceGroupData, setPriceGroupData] = useState<PriceGroupProps[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total_records: 0,
    records_per_page: 50,
    page: 1,
    total_pages: 0,
  });
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPriceGroupData(currentPage, pageSize);
  }, []);

  //   useEffect(() => {
  const fetchPriceGroupData = async (page = 1, recordsPerPage = 50) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: recordsPerPage.toString(),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/pricegroups?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();
      setPriceGroupData(data?.data || []);
    } catch (error) {
      console.error("Error Fetching price group data: ", error);
    }
  };

  console.log("this is the data", priceGroupData);

  // fetchPriceGroupData();
  //   }, []);

  return <>Price Group</>;
}
