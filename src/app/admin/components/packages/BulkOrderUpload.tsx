"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"; // Import shadcn Table components
import { OrderStatus, OrderSize } from "@/types/enums"; // Adjust the import path
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner"; // Import Sonner for toast notifications
import { PlusIcon } from "lucide-react";

type ExcelOrder = {
  orderId?: string;
  packageId?: string;
  phoneNumber?: string;
  status?: string;
  isShipped?: boolean | string;
  isDamaged?: boolean | string;
  damageDescription?: string;
  createdAt?: string;
  // Order details
  totalQuantity?: number;
  shippedQuantity?: number;
  largeItemQuantity?: number;
  smallItemQuantity?: number;
  priceRMB?: number;
  priceTonggur?: number;
  deliveryAvailable?: boolean | string;
  comments?: string;
};

interface OrderBody {
  orderId: string;
  packageId: string;
  phoneNumber?: string;
  isShipped: boolean;
  isDamaged: boolean;
  damageDescription?: string;
  status: OrderStatus;
  createdAt: Date;
  orderDetails?: {
    totalQuantity: number;
    shippedQuantity: number;
    largeItemQuantity: number;
    smallItemQuantity: number;
    priceRMB: number;
    priceTonggur: number;
    deliveryAvailable: boolean;
    comments?: string;
  };
}

// Sample Excel file format template
const excelTemplate = [
  {
    orderId: "ORD123",
    packageId: "PKG123",
    phoneNumber: "99112233",
    status: "IN_WAREHOUSE",
    isShipped: "TRUE",
    isDamaged: "FALSE",
    damageDescription: "",
    totalQuantity: 10,
    shippedQuantity: 8,
    largeItemQuantity: 2,
    smallItemQuantity: 6,
    priceRMB: 100,
    priceTonggur: 500,
    deliveryAvailable: "TRUE",
    comments: "Sample comment",
    createdAt: "2023-01-01",
  }
];

// Helper function to parse boolean values from Excel
const parseBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'тийм';
  }
  return !!value; // Convert to boolean
};

// Helper function to parse status from Excel
const parseStatus = (value: any): OrderStatus => {
  if (!value) return OrderStatus.IN_WAREHOUSE;
  
  if (typeof value === 'string') {
    const upperValue = value.toUpperCase();
    
    if (upperValue === 'IN_WAREHOUSE' || upperValue === 'WAREHOUSE' || upperValue === 'АГУУЛАХ') 
      return OrderStatus.IN_WAREHOUSE;
    if (upperValue === 'IN_TRANSIT' || upperValue === 'TRANSIT' || upperValue === 'ЗАМД') 
      return OrderStatus.IN_TRANSIT;
    if (upperValue === 'IN_UB' || upperValue === 'UB' || upperValue === 'УБ') 
      return OrderStatus.IN_UB;
    if (upperValue === 'OUT_FOR_DELIVERY' || upperValue === 'DELIVERY' || upperValue === 'ХҮРГЭЛТ') 
      return OrderStatus.OUT_FOR_DELIVERY;
    if (upperValue === 'DELIVERED' || upperValue === 'ХҮРГЭГДСЭН') 
      return OrderStatus.DELIVERED;
    if (upperValue === 'CANCELLED' || upperValue === 'ЦУЦЛАГДСАН') 
      return OrderStatus.CANCELLED;
  }
  
  return OrderStatus.IN_WAREHOUSE;
};

const BulkOrderUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<OrderBody[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    onDrop: (acceptedFiles) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) {
        setError("Excel файл оруулна уу.");
        return;
      }

      setExcelFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          try {
            const workbook = XLSX.read(data, { type: "binary" });

            // Try different sheet names or use the first sheet
            let sheetName = workbook.SheetNames[0]; // Default to first sheet
            const possibleSheetNames = ['Data', 'Sheet1', 'Orders', 'Захиалга'];
            
            for (const name of possibleSheetNames) {
              if (workbook.SheetNames.includes(name)) {
                sheetName = name;
                break;
              }
            }

            const worksheet = workbook.Sheets[sheetName];
            const json: ExcelOrder[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
              setError("Excel файлд мэдээлэл байхгүй байна.");
              return;
            }

            // Map Excel data to OrderInput
            const mappedOrders: OrderBody[] = json.map((row, index) => {
              // Generate defaults for required fields
              const orderId = row.orderId || `ORD-${Math.random().toString(36).substring(7)}`;
              const packageId = row.packageId || `PKG-${Math.random().toString(36).substring(7)}`;
              const isShipped = parseBoolean(row.isShipped);
              
              const orderBody: OrderBody = {
                orderId,
                packageId,
                phoneNumber: row.phoneNumber || undefined,
                isShipped,
                isDamaged: parseBoolean(row.isDamaged),
                damageDescription: row.damageDescription || undefined,
                status: parseStatus(row.status),
                createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
              };

              // Add order details if shipped
              if (isShipped) {
                orderBody.orderDetails = {
                  totalQuantity: Number(row.totalQuantity) || 0,
                  shippedQuantity: Number(row.shippedQuantity) || 0,
                  largeItemQuantity: Number(row.largeItemQuantity) || 0,
                  smallItemQuantity: Number(row.smallItemQuantity) || 0,
                  priceRMB: Number(row.priceRMB) || 0,
                  priceTonggur: Number(row.priceTonggur) || 0,
                  deliveryAvailable: parseBoolean(row.deliveryAvailable),
                  comments: row.comments || undefined,
                };
              }

              return orderBody;
            });

            setOrders(mappedOrders);
          } catch (error) {
            console.error("Error parsing Excel file:", error);
            setError("Excel файлыг уншихад алдаа гарлаа. Зөв формат эсэхийг шалгана уу.");
          }
        }
      };
      reader.readAsBinaryString(file);
    },
  });

  const queryClient = useQueryClient();

  // Download sample template
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet(excelTemplate);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "order_import_template.xlsx");
  };

  // TanStack Query mutation for creating orders
  const mutation = useMutation({
    mutationFn: async (orders: OrderBody[]) => {
      const response = await fetch("/api/orders/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orders),
      });

      if (!response.ok) {
        // Parse the error response from the API
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Захиалга үүсгэхэд алдаа гарлаа.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refetch orders after mutation
      toast.success("Захиалга амжилттай үүслээ!"); // Success toast
      setIsOpen(false);
      setOrders([]); // Clear the orders after successful submission
      setExcelFile(null);
    },
    onError: (error) => {
      console.error("Failed to create orders:", error);
      toast.error(`Захиалга үүсгэхэд алдаа гарлаа: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (orders.length === 0) {
      setError("Үүсгэх захиалга олдсонгүй.");
      return;
    }

    // Trigger the mutation
    mutation.mutate(orders);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-[50px]">
          Excel файл оруулах
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col max-w-[100vw] gap-0 p-0 md:max-w-3xl rounded-0 md:rounded-xl min-h-screen h-full md:min-h-0 md:max-h-[calc(100vh-80px)]">
        <DialogHeader className="p-5 border-b">
          <DialogTitle className="text-center text-lg text-primary uppercase">
            бүртгэл хийх
          </DialogTitle>
        </DialogHeader>
        <div className="gap-5 flex-1 overflow-y-auto p-5 mb-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Excel файлаар захиалга оруулах</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={downloadTemplate}
                className="text-xs"
              >
                Загвар татах
              </Button>
            </div>
            
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-primary/20 p-6 text-center cursor-pointer bg-primary/10 hover:bg-gray-100"
            >
              <input {...getInputProps()} />
              <p className="text-primary">
                {excelFile ? excelFile.name : "Excel файл оруулах бол энд дарна уу."}
              </p>
              <p className="text-sm text-gray-500">
                .xlsx болон .xls өргөтгөлтэй файлууд дэмжигдэнэ.
              </p>
              <div className="pt-4">
                <PlusIcon className="mx-auto text-primary" size={50} />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {orders.length > 0 && (
              <div className="overflow-x-auto">
                <h3 className="font-semibold mb-4">Үүсгэх захиалгууд: {orders.length}</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Захиалгын дугаар</TableHead>
                      <TableHead>Барааны дугаар</TableHead>
                      <TableHead>Утасны дугаар</TableHead>
                      <TableHead>Төлөв</TableHead>
                      <TableHead>Ачигдсан</TableHead>
                      {orders.some(order => order.isShipped && order.orderDetails) && (
                        <>
                          <TableHead>Нийт тоо</TableHead>
                          <TableHead>Үнэ (RMB)</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell>{order.orderId}</TableCell>
                        <TableCell>{order.packageId}</TableCell>
                        <TableCell>{order.phoneNumber || "N/A"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              order.status === OrderStatus.IN_WAREHOUSE
                                ? "bg-yellow-200 text-yellow-800"
                                : order.status === OrderStatus.IN_TRANSIT
                                ? "bg-blue-200 text-blue-800"
                                : order.status === OrderStatus.DELIVERED
                                ? "bg-green-200 text-green-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={order.isShipped ? "text-green-600" : "text-yellow-600"}>
                            {order.isShipped ? "Тийм" : "Үгүй"}
                          </span>
                        </TableCell>
                        {orders.some(order => order.isShipped && order.orderDetails) && (
                          <>
                            <TableCell>
                              {order.isShipped && order.orderDetails ? order.orderDetails.totalQuantity : "-"}
                            </TableCell>
                            <TableCell>
                              {order.isShipped && order.orderDetails ? order.orderDetails.priceRMB.toLocaleString() : "-"}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="justify-end p-5 border-t">
          <DialogClose asChild>
            <Button
              className="w-full sm:w-auto"
              type="button"
              variant="secondary"
              id="closeDialog"
            >
              Хаах
            </Button>
          </DialogClose>
          <Button
            className="w-full sm:w-auto"
            onClick={handleSubmit}
            disabled={mutation.isPending || orders.length === 0}
          >
            {mutation.isPending ? "Түр хүлээнэ үү..." : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOrderUpload;
