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
import { OrderStatus, OrderSize } from "@prisma/client";
import { Edit, Package } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface OrderBody {
  orderId: string;
  packageId: string;
  phoneNumber?: string;
  isShipped: boolean;
  isDamaged: boolean;
  damageDescription?: string;
  status: OrderStatus;
  size: OrderSize;
  note?: string;
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
  const [orderId_, setOrderId] = useState<string>("");
  const [packageId, setPackageId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isShipped, setIsShipped] = useState<boolean>(false);
  const [isDamaged, setIsDamaged] = useState<boolean>(false);
  const [damageDescription, setDamageDescription] = useState<string>("");
  const [status, setStatus] = useState<OrderStatus>('IN_WAREHOUSE' as OrderStatus);
  const [size, setSize] = useState<OrderSize>('MEDIUM' as OrderSize);
  const [note, setNote] = useState<string>("");
  
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
      setOrderId(orderData.orderId || "");
      setPackageId(orderData.packageId);
      setPhoneNumber(orderData.phoneNumber || "");
      setIsShipped(orderData.isShipped || false);
      setIsDamaged(orderData.isDamaged || false);
      setDamageDescription(orderData.damageDescription || "");
      setSize(orderData.size || 'MEDIUM');
      setNote(orderData.note || "");
      
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
        setTotalQuantity(orderData.orderDetails.totalQuantity || 0);
        setShippedQuantity(orderData.orderDetails.shippedQuantity || 0);
        setLargeItemQuantity(orderData.orderDetails.largeItemQuantity || 0);
        setSmallItemQuantity(orderData.orderDetails.smallItemQuantity || 0);
        setPriceRMB(orderData.orderDetails.priceRMB || 0);
        setPriceTonggur(orderData.orderDetails.priceTonggur || 0);
        setDeliveryAvailable(orderData.orderDetails.deliveryAvailable || false);
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
          ? "Захиалга амжилттай шинэчлэгдлээ."
          : "Захиалга амжилттай үүсгэгдлээ."
      );

      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refetch orders after mutation
      document.getElementById("closeDialog")?.click();
    },
    onError: (error) => {
      console.error("Error submitting order:", error);
      toast.error(`Алдаа: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    const orderBody: OrderBody = {
      orderId: orderId_,
      packageId,
      phoneNumber: phoneNumber || undefined,
      isShipped,
      isDamaged,
      damageDescription: isDamaged ? damageDescription : undefined,
      status,
      size,
      note: note || undefined,
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

  const translateStatus = (status: OrderStatus): string => {
    const translations: Record<string, string> = {
      IN_WAREHOUSE: "Эрээн агуулахад ирсэн",
      IN_TRANSIT: "Эрээн агуулахаас гарсан",
      IN_UB: "УБ-д ирсэн",
    };
    
    return translations[status] || status;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={`mb-5 ${!updateMode && "h-[50px]"}`}>
          {updateMode ? (
            <Edit />
          ) : (
            <div className="flex items-center gap-2">
              Захиалга нэмэх <Package />
            </div>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[100vw] gap-0 p-0 md:max-w-2xl rounded-md md:rounded-xl min-h-screen h-full md:min-h-0 md:max-h-[calc(100vh-80px)]">
        <DialogHeader className="p-5 border-b">
          <DialogTitle className="text-center text-lg">
            {updateMode ? "Захиалга шинэчлэх" : "Шинэ захиалга үүсгэх"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 overflow-y-auto p-5 mb-5">
          <div className="flex flex-col gap-3 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Захиалгын дугаар</label>
                <Input
                  value={orderId_}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Захиалгын дугаар оруулах"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ачааны дугаар</label>
                <Input
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  placeholder="Ачааны дугаар оруулах"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Утасны дугаар</label>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Утасны дугаар оруулах"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Хэмжээ</label>
                <Select
                  value={size}
                  onValueChange={(value) => setSize(value as OrderSize)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Хэмжээ сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="SMALL">Жижиг</SelectItem>
                      <SelectItem value="MEDIUM">Дунд</SelectItem>
                      <SelectItem value="LARGE">Том</SelectItem>
                      <SelectItem value="UNDEFINED">Тодорхойгүй</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Төлөв</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as OrderStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Төлөв сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="IN_WAREHOUSE">Эрээн агуулахад ирсэн</SelectItem>
                    <SelectItem value="IN_TRANSIT">Эрээн агуулахаас гарсан</SelectItem>
                    <SelectItem value="IN_UB">УБ-д ирсэн</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isShipped" 
                  checked={isShipped} 
                  onCheckedChange={setIsShipped}
                />
                <label htmlFor="isShipped" className="text-sm font-medium">Ачигдсан</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isDamaged" 
                  checked={isDamaged} 
                  onCheckedChange={setIsDamaged}
                />
                <label htmlFor="isDamaged" className="text-sm font-medium">Гэмтэлтэй</label>
              </div>
            </div>
            
            {isDamaged && (
              <div>
                <label className="text-sm font-medium mb-1 block">Гэмтлийн тайлбар</label>
                <Textarea
                  value={damageDescription}
                  onChange={(e) => setDamageDescription(e.target.value)}
                  placeholder="Гэмтлийн тухай тайлбарлах"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Тэмдэглэл</label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Нэмэлт тэмдэглэл бичих"
              />
            </div>
            
            {isShipped && (
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium mb-4">Захиалгын дэлгэрэнгүй</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Нийт тоо хэмжээ</label>
                    <Input
                      type="number"
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Ачигдсан тоо</label>
                    <Input
                      type="number"
                      value={shippedQuantity}
                      onChange={(e) => setShippedQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Том ачаа</label>
                    <Input
                      type="number"
                      value={largeItemQuantity}
                      onChange={(e) => setLargeItemQuantity(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Жижиг ачаа</label>
                    <Input
                      type="number"
                      value={smallItemQuantity}
                      onChange={(e) => setSmallItemQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Үнэ (Юань)</label>
                    <Input
                      type="number"
                      value={priceRMB}
                      onChange={(e) => setPriceRMB(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Үнэ (Төгрөг)</label>
                    <Input
                      type="number"
                      value={priceTonggur}
                      onChange={(e) => setPriceTonggur(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <Switch 
                    id="deliveryAvailable" 
                    checked={deliveryAvailable} 
                    onCheckedChange={setDeliveryAvailable}
                  />
                  <label htmlFor="deliveryAvailable" className="text-sm font-medium">Хүргэлт боломжтой</label>
                </div>
                <div className="mt-2">
                  <label className="text-sm font-medium mb-1 block">Тайлбар</label>
                  <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Нэмэлт тайлбар"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="p-4 border-t">
          <DialogClose id="closeDialog" asChild>
            <Button variant="outline" type="button">
              Цуцлах
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSubmit}
            disabled={!packageId || mutation.isPending}
          >
            {mutation.isPending ? 'Боловсруулж байна...' : (updateMode ? 'Шинэчлэх' : 'Үүсгэх')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OrderForm; 