"use client";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { OrderSize, OrderStatus } from "@/types/enums";
import translatePackageSize from "@/utils/translatePackageSize";
import { translateStatus } from "@/utils/translateStatus";
import { Edit, Package } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function OrderForm({
  updateMode,
  orderId,
}: {
  updateMode: boolean;
  orderId?: string;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [isBroken, setIsBroken] = useState<boolean>(false);
  const [packageId, setPackageId] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  const [size, setSize] = useState<OrderSize>(OrderSize.SMALL);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [note, setNote] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [deliveryCost, setDeliveryCost] = useState<number>(0);

  // Fetch order data in update mode
  const { data: orderData } = useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!updateMode || !orderId) return null;
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order data");
      return response.json();
    },
    enabled: updateMode && !!orderId, // Only fetch if in update mode and orderId is provided
  });

  // Update form fields when orderData changes
  useEffect(() => {
    if (orderData) {
      setPackageId(orderData.packageId);
      setProductId(orderData.productId);
      setPhoneNumber(orderData.phoneNumber || "");
      setSize(orderData.size);
      setStatus(orderData.status);
      setIsBroken(orderData.isBroken);
      setNote(orderData.note || "");
      setDate(new Date(orderData.createdAt));
      setDeliveryAddress(orderData.deliveryAddress || "");
      setDeliveryCost(orderData.deliveryCost || 0);
    }
  }, [orderData]);

  const queryClient = useQueryClient();

  // Mutation for creating or updating an order
  const mutation = useMutation({
    mutationFn: async (orderBody: OrderBody) => {
      const response = await fetch(
        updateMode ? `/api/orders/${orderId}` : "/api/orders",
        {
          method: updateMode ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderBody),
        }
      );
      if (!response.ok) throw new Error("Failed to submit order");
      return response.json();
    },
    onSuccess: () => {
      toast.success(
        updateMode
          ? "Бүртгэл амжилттай шинэчлэгдлээ."
          : "Бүртгэл амжилттай нэмэгдлээ."
      );

      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refetch orders after mutation
      document.getElementById("closeDialog")?.click();
    },
    onError: (error) => {
      console.error("Error submitting order:", error);
      toast.error("Алдаа гарлаа. Дахин оролдоно уу.");
    },
  });

  const handleSubmit = () => {
    const orderBody: OrderBody = {
      packageId,
      productId,
      phoneNumber,
      size,
      status,
      isBroken,
      note: isBroken ? note : undefined,
      createdAt: date,
      // userId: "65a3b2c4d5e6f7890a1b2c3e", // Replace with actual user ID
      deliveryAddress: deliveryAddress || undefined,
      deliveryCost: deliveryCost || undefined,
    };

    mutation.mutate(orderBody);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={`mb-5 bg-primary ${!updateMode && "h-[50px]"}`}>
          {updateMode ? (
            <Edit />
          ) : (
            <div className="flex items-center gap-2">
              Бүтээгдэхүүн бүртгэх <Package />
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100vw] gap-0 p-0 md:max-w-2xl rounded-0 md:rounded-xl min-h-screen h-full md:min-h-0 md:max-h-[calc(100vh-80px)]">
        <DialogHeader className="p-5 border-b">
          <DialogTitle className="text-center text-lg text-primary uppercase">
            {updateMode ? "Захиалга шинэчлэх" : "Бүртгэл хийх"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-5 overflow-y-auto p-5 mb-5">
          <div className="flex flex-col gap-3 w-full">
            <label>Захиалгын дугаар</label>
            <Input
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            />
            <label>Барааны код</label>
            <Input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            />
            <label>Утасны дугаар</label>
            <Input
              type="number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <label>Хүргэлтийн хаяг (Сонголттой)</label>
            <Input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
            <label>Хүргэлтийн үнэ (Сонголттой)</label>
            <Input
              type="number"
              value={deliveryCost}
              onChange={(e) => setDeliveryCost(Number(e.target.value))}
            />
            <label>Барааны хэмжээ</label>
            <Select
              value={size}
              onValueChange={(value: OrderSize) => setSize(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Барааны хэмжээ" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(OrderSize).map((size) => (
                    <SelectItem key={size} value={size}>
                      {translatePackageSize(size)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <label>Төлөв</label>
            <Select
              value={status}
              onValueChange={(value: OrderStatus) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Төлөв" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(OrderStatus).map((status) => (
                    <SelectItem
                      className="h-[45px]"
                      key={status}
                      value={status}
                    >
                      {translateStatus(status)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <label>Эвдрэлтэй дутуу эсэх</label>
            <div className="flex items-center gap-5">
              <Switch
                checked={isBroken}
                onCheckedChange={() => setIsBroken(!isBroken)}
              />
            </div>
            {isBroken && (
              <>
                <label>Тэмдэглэл</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </>
            )}
          </div>
          <div>
            <label>Огноо</label>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selected) => selected && setDate(selected)}
              className="rounded-md border"
            />
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
            {mutation.isPending
              ? "Түр хүлээнэ үү..."
              : updateMode
              ? "Шинэчлэх"
              : "Хадгалах"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrderForm;
