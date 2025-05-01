"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { translateStatus } from "@/utils/translateStatus";
import translatePackageSize from "@/utils/translatePackageSize";

const OrderExport = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsLoading(true);

    try {
      // Format dates for the API request
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();

      // Fetch orders within the date range
      const response = await fetch(
        `/api/orders/export?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const orders = await response.json();

      // Prepare data for Excel export
      const workbook = XLSX.utils.book_new();
      
      // Transform orders for more readable Excel format
      const exportData = orders.map((order: Order) => ({
        "Захиалгын дугаар": order.packageId,
        "Бүтээгдэхүүний дугаар": order.productId,
        "Утасны дугаар": order.phoneNumber || "N/A",
        "Хэмжээ": translatePackageSize(order.size),
        "Төлөв": translateStatus(order.status),
        "Үүсгэсэн огноо": new Date(order.createdAt).toLocaleDateString(),
        "Хүргэлтийн хаяг": order.deliveryAddress || "N/A",
        "Хүргэлтийн үнэ": order.deliveryCost || 0,
        "Төлбөр төлөгдсөн": order.isPaid ? "Тийм" : "Үгүй",
        "Эвдрэлтэй": order.isBroken ? "Тийм" : "Үгүй",
        "Тэмдэглэл": order.note || "",
      }));

      // Create worksheet and add to workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      // Generate filename with date range
      const startDateStr = format(startDate, "yyyyMMdd");
      const endDateStr = format(endDate, "yyyyMMdd");
      const fileName = `orders_${startDateStr}_to_${endDateStr}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting orders:", error);
      alert("Failed to export orders. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal bg-gray-700 border-gray-600 text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Эхлэх огноо"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
              className="bg-gray-800 text-white"
            />
          </PopoverContent>
        </Popover>

        <span className="text-gray-500">-</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal bg-gray-700 border-gray-600 text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Дуусах огноо"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              className="bg-gray-800 text-white"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={handleExport}
        disabled={isLoading || !startDate || !endDate}
        className="bg-primary"
      >
        <Download className="mr-2 h-4 w-4" />
        {isLoading ? "Боловсруулж байна..." : "Excel татах"}
      </Button>
    </div>
  );
};

export default OrderExport;