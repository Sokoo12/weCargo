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
import { OrderStatus, OrderSize } from "@prisma/client";

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
  isShipped?: boolean;
  isDamaged?: boolean;
  damageDescription?: string;
  orderDetails?: OrderDetails | null;
}

const OrderExport = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    if (!startDate || !endDate) {
      alert("Эхлэх болон дуусах огноог сонгоно уу");
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
        alert("Сонгосон хугацаанд захиалга олдсонгүй");
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
          "Ачааны дугаар": order.packageId || "Н/Б",
          "Захиалгын дугаар": order.id || "Н/Б",
          "Утасны дугаар": order.phoneNumber || "Н/Б",
          "Хэмжээ": order.size === "SMALL" ? "Жижиг" :
                    order.size === "MEDIUM" ? "Дунд" :
                    order.size === "LARGE" ? "Том" : "Тодорхойгүй",
          "Төлөв": translateStatus(order.status as OrderStatus),
          "Үүсгэсэн огноо": order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Н/Б",
          "Ачигдсан": order.isShipped ? "Тийм" : "Үгүй",
          "Гэмтэлтэй": order.isDamaged ? "Тийм" : "Үгүй",
          "Гэмтлийн тайлбар": order.damageDescription || "",
          "Тэмдэглэл": order.note || "",
          // Add order details if available
          "Нийт тоо хэмжээ": order.orderDetails?.totalQuantity || "",
          "Ачигдсан тоо": order.orderDetails?.shippedQuantity || "",
          "Том ачаа": order.orderDetails?.largeItemQuantity || "",
          "Жижиг ачаа": order.orderDetails?.smallItemQuantity || "",
          "Үнэ (Юань)": order.orderDetails?.priceRMB || "",
          "Үнэ (Төгрөг)": order.orderDetails?.priceTonggur || "",
          "Хүргэлт боломжтой": order.orderDetails?.deliveryAvailable ? "Тийм" : "Үгүй",
          "Тайлбар": order.orderDetails?.comments || "",
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
      alert("Захиалгыг экспортлоход алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setIsLoading(false);
    }
  };

  const translateStatus = (status?: OrderStatus): string => {
    if (!status) return "Тодорхойгүй";
    
    const translations: Record<string, string> = {
      IN_WAREHOUSE: "Эрээн агуулахад ирсэн",
      IN_TRANSIT: "Эрээн агуулахаас гарсан",
      IN_UB: "УБ-д ирсэн",
    };
    
    return translations[status] || status;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Эхлэх огноо"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <span className="text-gray-500">-</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[180px] justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Дуусах огноо"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={handleExport}
        disabled={isLoading || !startDate || !endDate}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        {isLoading ? "Боловсруулж байна..." : "Excel экспортлох"}
      </Button>
    </div>
  );
};

export default OrderExport; 