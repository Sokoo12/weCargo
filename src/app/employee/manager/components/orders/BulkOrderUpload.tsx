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
} from "@/components/ui/table";
import { OrderStatus, OrderSize } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";

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
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes' || lowerValue === 'y';
  }
  return !!value; // Convert to boolean
};

// Helper function to parse status from Excel
const parseStatus = (value: any): OrderStatus => {
  if (!value) return 'IN_WAREHOUSE' as OrderStatus;
  
  if (typeof value === 'string') {
    const upperValue = value.toUpperCase();
    
    if (upperValue === 'IN_WAREHOUSE' || upperValue === 'WAREHOUSE') 
      return 'IN_WAREHOUSE' as OrderStatus;
    if (upperValue === 'IN_TRANSIT' || upperValue === 'TRANSIT') 
      return 'IN_TRANSIT' as OrderStatus;
    if (upperValue === 'IN_UB' || upperValue === 'UB') 
      return 'IN_UB' as OrderStatus;
  }
  
  // Default to IN_WAREHOUSE if not one of the allowed values
  return 'IN_WAREHOUSE' as OrderStatus;
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
            const possibleSheetNames = ['Data', 'Sheet1', 'Orders'];
            
            for (const name of possibleSheetNames) {
              if (workbook.SheetNames.includes(name)) {
                sheetName = name;
                break;
              }
            }

            const worksheet = workbook.Sheets[sheetName];
            const json: ExcelOrder[] = XLSX.utils.sheet_to_json(worksheet);

            if (json.length === 0) {
              setError("Excel файлд мэдээлэл олдсонгүй.");
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
                phoneNumber: row.phoneNumber ? String(row.phoneNumber) : undefined,
                isShipped,
                isDamaged: parseBoolean(row.isDamaged),
                damageDescription: row.damageDescription || undefined,
                status: parseStatus(row.status),
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
            setError("Excel файлыг задлахад алдаа гарлаа. Форматаа шалгана уу.");
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
        throw new Error(errorData.error || "Захиалга үүсгэхэд алдаа гарлаа");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate the orders query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsOpen(false);
      setOrders([]);
      setExcelFile(null);
      toast.success("Амжилттай", {
        description: `${orders.length} захиалга амжилттай импортлогдлоо`
      });
    },
    onError: (error) => {
      console.error("Error creating orders:", error);
      toast.error("Алдаа", {
        description: `Захиалга импортлоход алдаа гарлаа: ${error.message}`
      });
    },
  });

  const handleSubmit = () => {
    if (orders.length === 0) {
      setError("Импортлох захиалга байхгүй байна");
      return;
    }

    mutation.mutate(orders);
  };

  const translateSize = (size: OrderSize) => {
    switch (size) {
      case "SMALL":
        return "Small";
      case "MEDIUM":
        return "Medium";
      case "LARGE":
        return "Large";
      default:
        return "Undefined";
    }
  };

  const translateStatus = (status: OrderStatus): string => {
    const translations: Record<string, string> = {
      IN_WAREHOUSE: "Эрээн агуулахад ирсэн",
      IN_TRANSIT: "Эрээн агуулахаас гарсан",
      IN_UB: "УБ-д ирсэн",
    };
    
    return translations[status] || status;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload size={16} />
          <span>Excel файл оруулах</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Excel файл оруулах</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* File Upload Area */}
          {orders.length === 0 ? (
            <div className="space-y-6">
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition"
              >
                <input {...getInputProps()} />
                <p className="text-gray-500">
                  Excel файлыг энд чирч оруулах, эсвэл дарж сонгоно уу
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Зөвхөн .xlsx болон .xls файлуудыг дэмжинэ
                </p>
              </div>

              {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Жишээ загвар хэрэгтэй юу? Эхлэхэд туслах загвар татаж авна уу.
                </p>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="ml-4"
                >
                  Загвар татах
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">
                  Урьдчилан харах ({orders.length} захиалга)
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOrders([]);
                    setExcelFile(null);
                  }}
                >
                  Цэвэрлэх
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ачааны дугаар</TableHead>
                      <TableHead>Захиалгын дугаар</TableHead>
                      <TableHead>Төлөв</TableHead>
                      <TableHead>Утас</TableHead>
                      <TableHead>Ачигдсан</TableHead>
                      <TableHead>Гэмтэлтэй</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell>{order.packageId}</TableCell>
                        <TableCell>{order.orderId}</TableCell>
                        <TableCell>{translateStatus(order.status)}</TableCell>
                        <TableCell>{order.phoneNumber || "Н/Б"}</TableCell>
                        <TableCell>{order.isShipped ? "Тийм" : "Үгүй"}</TableCell>
                        <TableCell>{order.isDamaged ? "Тийм" : "Үгүй"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-4 pb-4">
          <DialogClose asChild>
            <Button variant="outline" className="mr-2">
              Цуцлах
            </Button>
          </DialogClose>
          <Button
            disabled={orders.length === 0 || mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending
              ? "Импортлож байна..."
              : `${orders.length} захиалга импортлох`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOrderUpload; 