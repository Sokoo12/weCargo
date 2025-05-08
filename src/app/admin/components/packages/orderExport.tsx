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
import { OrderStatus, OrderSize } from "@/types/enums";

// Define order details interface
interface OrderDetails {
  totalQuantity?: number;
  shippedQuantity?: number;
  largeItemQuantity?: number;
  smallItemQuantity?: number;
  priceRMB?: number;
  priceTonggur?: number;
  deliveryAvailable?: boolean;
  comments?: string;
}

// Extend the global Order type
interface ExportOrder {
  id: string;
  packageId: string;
  phoneNumber?: string;
  size?: string;
  status?: string;
  statusHistory?: any[];
  createdAt: Date | string;
  note?: string;
  isBroken?: boolean;
  deliveryAddress?: string;
  deliveryCost?: number;
  isPaid?: boolean;
  orderDetails?: OrderDetails | null;
}

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

      console.log(`Exporting orders from ${formattedStartDate} to ${formattedEndDate}`);

      // Fetch orders within the date range
      const response = await fetch(
        `/api/orders/export?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }

      const orders = await response.json();
      console.log(`Received ${orders.length} orders from API`);
      
      if (!orders || orders.length === 0) {
        alert("No orders found for the selected date range");
        setIsLoading(false);
        return;
      }

      // Prepare data for Excel export
      const workbook = XLSX.utils.book_new();
      
      // Transform orders for more readable Excel format
      const exportData = orders.map((order: ExportOrder) => {
        console.log("Processing order:", order.packageId);
        
        // Use optional chaining and nullish coalescing for safety
        return {
          "Барааны дугаар": order.packageId || "N/A",
          "Утасны дугаар": order.phoneNumber || "N/A",
          "Хэмжээ": order.size ? translatePackageSize(order.size as OrderSize) : "Тодорхойгүй",
          "Төлөв": order.status ? translateStatus(order.status as OrderStatus) : "Тодорхойгүй",
          "Үүсгэсэн огноо": order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A",
          "Хүргэлтийн хаяг": order.deliveryAddress || "N/A",
          "Хүргэлтийн үнэ": order.deliveryCost || 0,
          "Төлбөр төлөгдсөн": order.isPaid ? "Тийм" : "Үгүй",
          "Эвдрэлтэй": order.isBroken ? "Тийм" : "Үгүй",
          "Тэмдэглэл": order.note || "",
          // Add order details if available
          "Нийт тоо": order.orderDetails?.totalQuantity || "",
          "Ачигдсан тоо": order.orderDetails?.shippedQuantity || "",
          "Том бараа": order.orderDetails?.largeItemQuantity || "",
          "Жижиг бараа": order.orderDetails?.smallItemQuantity || "",
          "Үнэ (юань)": order.orderDetails?.priceRMB || "",
          "Үнэ (төгрөг)": order.orderDetails?.priceTonggur || "",
          "Хүргэлт боломжтой": order.orderDetails?.deliveryAvailable ? "Тийм" : "Үгүй",
          "Нэмэлт тайлбар": order.orderDetails?.comments || "",
        };
      });

      console.log(`Prepared ${exportData.length} rows for Excel export`);

      // Create worksheet and add to workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

      // Generate filename with date range
      const startDateStr = format(startDate, "yyyyMMdd");
      const endDateStr = format(endDate, "yyyyMMdd");
      const fileName = `orders_${startDateStr}_to_${endDateStr}.xlsx`;

      // Export to file
      XLSX.writeFile(workbook, fileName);
      console.log(`Excel file ${fileName} created successfully`);
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