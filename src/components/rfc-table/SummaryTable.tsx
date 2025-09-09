"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "../ui/input";
import type { PermissionConfig } from "@/lib/types";
import { getFullMonthName } from "@/lib/utils";

interface SummaryDataProps {
  // eslint-disable-next-line
  summaryData: any[];
  month: string;
  year: string;
  option: string;
  autoSaveCheck?: () => void;
  permission: PermissionConfig | null;
}

const SummaryTable = ({
  option,
  summaryData,
  month,
  year,
  autoSaveCheck,
  permission,
}: SummaryDataProps) => {
  const headers = summaryData.length > 0 ? Object.keys(summaryData[0]) : [];
  const stringMonth = getFullMonthName(month);

  const visibleHeaders = headers.filter((header) => header !== "Edit");

  const handleAutoSave = async (product: string, rfc: number) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("month", month);
      queryParams.append("year", year);
      const payload = [{ product, rfc }];

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/dawlance-product-rfc?${queryParams}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to auto-save");
      autoSaveCheck?.();
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  };

  return (
    <div className="w-full h-[50vh] overflow-auto relative">
      {/* Sticky summary heading */}
      <div className="sticky top-0 z-60 bg-background py-2">
        <span className="uppercase font-bold block text-center">
          {`Summary Table - ${stringMonth} ${year}`}
        </span>
      </div>

      <Table className="relative w-full">
        <TableHeader className="sticky top-10 z-50 bg-muted">
          <TableRow className="hover:bg-transparent border-b shadow-sm">
            {visibleHeaders.map((header) => (
              <TableHead
                key={header}
                className="text-left whitespace-nowrap bg-[#f5f5f4]"
              >
                {header.trim()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {summaryData.length > 0 ? (
            summaryData.map((item, idx) => (
              <TableRow key={idx} className="hover:bg-muted/50">
                {visibleHeaders.map((key) => {
                  const isRFC = key.includes("RFC");
                  const endsWithSpace = key.endsWith(" ");
                  const isRowEditable = item["Edit"] === 1;
                  const shouldShowInput =
                    option === "dawlance" &&
                    isRFC &&
                    !endsWithSpace &&
                    isRowEditable;

                  return (
                    <TableCell
                      key={key}
                      className="bg-background text-sm whitespace-nowrap"
                    >
                      {shouldShowInput ? (
                        <Input
                          type="number"
                          className="w-full h-7 sm:h-8 text-xs sm:text-sm"
                          defaultValue={item[key]}
                          disabled={permission?.save_allowed === 0}
                          onBlur={(e) => {
                            const value = Number.parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              handleAutoSave(item["Product"], value);
                            }
                          }}
                        />
                      ) : item[key] !== null && item[key] !== undefined ? (
                        item[key]
                      ) : (
                        " "
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={visibleHeaders.length}
                className="text-center py-6 text-muted-foreground"
              >
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SummaryTable;
