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
  packageId?: string;
  productId?: string;
  size?: string;
  phoneNumber?: string;
  status?: boolean; // true = IN_TRANSIT, false = PENDING
  createdAt?: string;
};

// type OrderInput = {
//   packageId: string;
//   productId: string;
//   phoneNumber: string | null;
//   size: OrderSize;
//   status: OrderStatus;
//   note: string | null;
//   isBroken: boolean;
//   userId: string;
//   deliveryCost: number | null;
//   deliveryAddress: string | null;
//   isPaid: boolean;
//   createdAt: Date;
// };

const BulkOrderUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<OrderBody[]>([]);
  const [error, setError] = useState<string | null>(null);

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

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (data) {
          const workbook = XLSX.read(data, { type: "binary" });

          // Select the sheet by name
          const sheetName = "Data"; // Specify the sheet name
          if (!workbook.SheetNames.includes(sheetName)) {
            setError(`Excel файлд "${sheetName}" хүснэгт олдсонгүй.`);
            return;
          }

          const worksheet = workbook.Sheets[sheetName];
          const json: ExcelOrder[] = XLSX.utils.sheet_to_json(worksheet);

          // Map Excel data to OrderInput
          const mappedOrders = json.map((row) => ({
            packageId:
              row.packageId || `PKG-${Math.random().toString(36).substring(7)}`,
            productId: row.productId || "PROD-DEFAULT",
            phoneNumber: row.phoneNumber || null,
            size: row.size
              ? row.size.toUpperCase() == "ЖИЖИГ БАРАА"
                ? OrderSize.SMALL
                : row.size.toUpperCase() == "ТОМ БАРАА"
                ? OrderSize.LARGE
                : OrderSize.UNDEFINED
              : OrderSize.UNDEFINED,
            status: row.status ? OrderStatus.IN_TRANSIT : OrderStatus.PENDING,
            note: null, // Default note
            isBroken: false, // Default isBroken
            deliveryCost: null, // Default deliveryCost
            deliveryAddress: null, // Default deliveryAddress
            isPaid: false, // Default isPaid
            createdAt: row.createdAt ? new Date(row.createdAt) : new Date(), // Default to current date
          }));

          setOrders(mappedOrders);
        }
      };
      reader.readAsBinaryString(file);
    },
  });

  const queryClient = useQueryClient();

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
        const errorData = await response.json();
        throw new Error(errorData.error || "Захиалга үүсгэхэд алдаа гарлаа.");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refetch orders after mutation
      toast.success("Захиалга амжилттай үүслээ!"); // Success toast
      setIsOpen(false);
      setOrders([]); // Clear the orders after successful submission
    },
    onError: (error) => {
      console.error("Failed to create orders:", error);

      //   // Handle duplicate packageId errors
      //   if (error.message.includes("Захиалгын дугаар давхардсан байна.")) {
      //     toast.error("Захиалгын дугаар давхардсан байна. Дахин шалгана уу.");
      //   } else if (
      //     error.message.includes("Зарим захиалгын дугаар өмнө бүртгэгдсэн байна.")
      //   ) {
      //     toast.error(
      //       "Зарим захиалгын дугаар өмнө бүртгэгдсэн байна. Дахин шалгана уу."
      //     );
      //   } else {
      toast.error("Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
      //   }
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
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-primary/20 p-6 text-center cursor-pointer bg-primary/10 hover:bg-gray-100"
            >
              <input {...getInputProps()} />
              <p className="text-primary">
                Excel файл оруулах бол энд дарна уу.
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
                <h3 className="font-semibold mb-4">Үүсгэх захиалгууд:</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Захиалгын дугаар</TableHead>
                      <TableHead>Барааны код</TableHead>
                      <TableHead>Утасны дугаар</TableHead>
                      <TableHead>Хэмжээ</TableHead>
                      <TableHead>Төлөв</TableHead>
                      <TableHead>Үүсгэсэн огноо</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell>{order.packageId}</TableCell>
                        <TableCell>{order.productId}</TableCell>
                        <TableCell>{order.phoneNumber || "N/A"}</TableCell>
                        <TableCell>{order.size}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              order.status === OrderStatus.IN_TRANSIT
                                ? "bg-blue-200 text-blue-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {order.createdAt.toLocaleDateString()}
                        </TableCell>
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
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Түр хүлээнэ үү..." : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkOrderUpload;
