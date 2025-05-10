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
import { OrderStatus, OrderSize } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import { Edit, Package } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Order, OrderDetails } from "@/types/order";

interface OrderBody {
  orderId: string;
  packageId: string;
  phoneNumber?: string;
  size?: OrderSize;
  package_size?: string;
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

function OrderForm({
  updateMode,
  orderId,
}: {
  updateMode: boolean;
  orderId?: string;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [orderId_, setOrderId] = useState<string>("");
  const [packageId, setPackageId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [size, setSize] = useState<OrderSize>(OrderSize.MEDIUM);
  const [packageSize, setPackageSize] = useState<string>("");
  const [isShipped, setIsShipped] = useState<boolean>(false);
  const [isDamaged, setIsDamaged] = useState<boolean>(false);
  const [damageDescription, setDamageDescription] = useState<string>("");
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.IN_WAREHOUSE);
  
  // Order details fields
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [shippedQuantity, setShippedQuantity] = useState<number>(0);
  const [largeItemQuantity, setLargeItemQuantity] = useState<number>(0);
  const [smallItemQuantity, setSmallItemQuantity] = useState<number>(0);
  const [priceRMB, setPriceRMB] = useState<number>(0);
  const [priceTonggur, setPriceTonggur] = useState<number>(0);
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean>(false);
  const [comments, setComments] = useState<string>("");

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
      setOrderId(orderData.orderId);
      setPackageId(orderData.packageId);
      setPhoneNumber(orderData.phoneNumber || "");
      setSize(orderData.size || OrderSize.MEDIUM);
      setPackageSize(orderData.package_size || "");
      setIsShipped(orderData.isShipped);
      setIsDamaged(orderData.isDamaged || false);
      setDamageDescription(orderData.damageDescription || "");
      setDate(new Date(orderData.createdAt));
      
      // First try to get status from the status field
      if (orderData.status) {
        setStatus(orderData.status);
      }
      // Fallback to getting status from the most recent status history entry
      else if (orderData.statusHistory && orderData.statusHistory.length > 0) {
        const latestStatus = orderData.statusHistory[orderData.statusHistory.length - 1].status;
        setStatus(latestStatus);
      }
      
      // Set order details fields if available
      if (orderData.orderDetails) {
        setTotalQuantity(orderData.orderDetails.totalQuantity);
        setShippedQuantity(orderData.orderDetails.shippedQuantity);
        setLargeItemQuantity(orderData.orderDetails.largeItemQuantity);
        setSmallItemQuantity(orderData.orderDetails.smallItemQuantity);
        setPriceRMB(orderData.orderDetails.priceRMB);
        setPriceTonggur(orderData.orderDetails.priceTonggur);
        setDeliveryAvailable(orderData.orderDetails.deliveryAvailable);
        setComments(orderData.orderDetails.comments || "");
      }
    }
  }, [orderData]);

  const queryClient = useQueryClient();

  // Mutation for creating or updating an order
  const mutation = useMutation({
    mutationFn: async (orderBody: OrderBody) => {
      try {
        const url = updateMode ? `/api/orders/${orderId}` : "/api/orders";
        console.log(`Submitting order to ${url}`, orderBody);
        
        const response = await fetch(url, {
          method: updateMode ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderBody),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Server error:", errorData);
          throw new Error(`Failed to submit order: ${response.status} ${response.statusText}`);
        }
        
        return response.json();
      } catch (error) {
        console.error("Order submission error:", error);
        throw error;
      }
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
      toast.error(`Алдаа гарлаа: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    const orderBody: OrderBody = {
      orderId: orderId_,
      packageId,
      phoneNumber: phoneNumber || undefined,
      size,
      package_size: packageSize,
      isShipped,
      isDamaged,
      damageDescription: isDamaged ? damageDescription : undefined,
      status,
      createdAt: date,
    };

    // Only include orderDetails if isShipped is true
    if (isShipped) {
      orderBody.orderDetails = {
        totalQuantity,
        shippedQuantity,
        largeItemQuantity,
        smallItemQuantity,
        priceRMB,
        priceTonggur,
        deliveryAvailable,
        comments: comments || undefined,
      };
    }

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
        <div className="flex flex-col gap-5 overflow-y-auto p-5 mb-5">
          <div className="flex flex-col gap-3 w-full">
            <label>Захиалгын дугаар</label>
            <Input
              value={orderId_}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <label>Ачааны дугаар(Track Number)</label>
            <Input
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            />
            <label>Утасны дугаар</label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Ачааны хэмжээ (категори)</label>
                <Select
                  value={size}
                  onValueChange={(value) => setSize(value as OrderSize)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Хэмжээ сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={OrderSize.SMALL}>Жижиг</SelectItem>
                      <SelectItem value={OrderSize.MEDIUM}>Дунд</SelectItem>
                      <SelectItem value={OrderSize.LARGE}>Том</SelectItem>
                      <SelectItem value={OrderSize.UNDEFINED}>Тодорхойгүй</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label>Ачааны хэмжээ (дэлгэрэнгүй)</label>
                <Input
                  value={packageSize}
                  onChange={(e) => setPackageSize(e.target.value)}
                  placeholder="Жишээ: 30x40x50 см"
                />
              </div>
            </div>
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
            
            <label>Эвдрэлтэй эсвэл дутуу эсэх</label>
            <div className="flex items-center gap-5">
              <Switch
                checked={isDamaged}
                onCheckedChange={() => setIsDamaged(!isDamaged)}
              />
            </div>
            
            {isDamaged && (
              <div>
                <label>Эвдрэлийн тайлбар</label>
                <Textarea
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Эвдрэлийн талаар дэлгэрэнгүй бичнэ үү"
                />
              </div>
            )}
            
            <label>Ачигдсан эсэх</label>
            <div className="flex items-center gap-5">
              <Switch
                checked={isShipped}
                onCheckedChange={() => setIsShipped(!isShipped)}
              />
            </div>
            
            {isShipped && (
              <div className="mt-4 p-4 border rounded-md">
                <h3 className="font-medium mb-3">Order Details (Ачигдсан бараа)</h3>
                <div className="space-y-3">
                  <div>
                    <label>Нийт тоо хэмжээ</label>
                    <Input
                      type="number"
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Ачигдсан тоо</label>
                    <Input
                      type="number"
                      value={shippedQuantity}
                      onChange={(e) => setShippedQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Том ачаа</label>
                    <Input
                      type="number"
                      value={largeItemQuantity}
                      onChange={(e) => setLargeItemQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Жижиг ачаа</label>
                    <Input
                      type="number"
                      value={smallItemQuantity}
                      onChange={(e) => setSmallItemQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Үнэ (Юань)</label>
                    <Input
                      type="number"
                      value={priceRMB}
                      onChange={(e) => setPriceRMB(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Үнэ (Төгрөг)</label>
                    <Input
                      type="number"
                      value={priceTonggur}
                      onChange={(e) => setPriceTonggur(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label>Хүргэлттэй эсэх</label>
                    <div className="flex items-center gap-5">
                      <Switch
                        checked={deliveryAvailable}
                        onCheckedChange={() => setDeliveryAvailable(!deliveryAvailable)}
                      />
                    </div>
                  </div>
                  <div>
                    <label>Нэмэлт тайлбар</label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                    />
                  </div>
                </div>
              </div>
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
