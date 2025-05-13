"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DeliveryStatus, OrderStatus } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import { Truck, Calendar, Phone, MapPin, DollarSign, Loader2, Package } from "lucide-react";
import moment from "moment";

// Type definition for delivery request with related order info
interface DeliveryRequest {
  id: string;
  orderId: string;
  address: string;
  district: string;
  apartment?: string;
  deliveryFee?: number;
  requestedAt: string;
  scheduledDate?: string;
  completedAt?: string;
  status: DeliveryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    packageId: string;
    phoneNumber?: string;
    status: OrderStatus;
  };
}

// Helper function to translate delivery status
const translateDeliveryStatus = (status: DeliveryStatus): string => {
  switch (status) {
    case "REQUESTED":
      return "Хүсэлт илгээсэн";
    case "SCHEDULED":
      return "Баталгаажсан";
    case "IN_PROGRESS":
      return "Хүргэлтэнд гарсан";
    case "COMPLETED":
      return "Хүргэгдсэн";
    case "CANCELLED":
      return "Цуцлагдсан";
    default:
      return status;
  }
};

// Helper to get color for delivery status badge
const getDeliveryStatusColor = (status: DeliveryStatus): string => {
  switch (status) {
    case "REQUESTED":
      return "bg-orange-100 text-orange-800 hover:bg-orange-200";
    case "SCHEDULED":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200";
    case "COMPLETED":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    case "CANCELLED":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

// Component code with all the UI
function DeliveriesContent() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRequest | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(DeliveryStatus.REQUESTED);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch deliveries
  const fetchDeliveries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/deliveries");
      if (!response.ok) {
        throw new Error("Failed to fetch deliveries");
      }

      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast.error("Хүргэлтийн мэдээлэл татахад алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateDelivery = (delivery: DeliveryRequest) => {
    setSelectedDelivery(delivery);
    setDeliveryFee(delivery.deliveryFee?.toString() || "");
    setScheduledDate(delivery.scheduledDate 
      ? moment(delivery.scheduledDate).format("YYYY-MM-DD") 
      : "");
    setDeliveryStatus(delivery.status);
    setIsUpdateModalOpen(true);
  };

  const handleSubmitUpdate = async () => {
    if (!selectedDelivery) return;

    setIsSubmitting(true);
    try {
      const payload = {
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : undefined,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
        status: deliveryStatus,
      };

      const response = await fetch(`/api/admin/deliveries/${selectedDelivery.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update delivery");
      }

      toast.success("Хүргэлтийн мэдээлэл шинэчлэгдлээ");
      setIsUpdateModalOpen(false);
      fetchDeliveries(); // Refresh the list
    } catch (error) {
      console.error("Error updating delivery:", error);
      toast.error("Хүргэлтийн мэдээлэл шинэчлэхэд алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDeliveries = statusFilter === "all" 
    ? deliveries 
    : deliveries.filter(delivery => delivery.status === statusFilter);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Truck className="mr-2 h-8 w-8 text-primary" />
        Хүргэлтийн хүсэлтүүд
      </h1>

      <Tabs defaultValue="all" onValueChange={setStatusFilter}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Бүгд</TabsTrigger>
          <TabsTrigger value="REQUESTED">Хүсэлт</TabsTrigger>
          <TabsTrigger value="SCHEDULED">Баталгаажсан</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">Хүргэлтэнд гарсан</TabsTrigger>
          <TabsTrigger value="COMPLETED">Хүргэгдсэн</TabsTrigger>
          <TabsTrigger value="CANCELLED">Цуцлагдсан</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter}>
          <Card>
            <CardHeader>
              <CardTitle>
                {statusFilter === "all" 
                  ? "Бүх хүргэлтүүд" 
                  : `${translateDeliveryStatus(statusFilter as DeliveryStatus)} хүргэлтүүд`}
              </CardTitle>
              <CardDescription>
                Нийт {filteredDeliveries.length} хүргэлт
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredDeliveries.length === 0 ? (
                <div className="text-center py-8 text-[#ffffff]">
                  Хүргэлтийн хүсэлт байхгүй байна
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Захиалга ID</TableHead>
                      <TableHead>Хүргэлтийн хаяг</TableHead>
                      <TableHead>Утас</TableHead>
                      <TableHead>Төлөв</TableHead>
                      <TableHead>Хүргэлтийн төлбөр</TableHead>
                      <TableHead>Хүсэлт илгээсэн</TableHead>
                      <TableHead>Үйлдэл</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-primary" />
                            {delivery.order.packageId}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-1 text-gray-500 mt-1 flex-shrink-0" />
                            <div>
                              <div>{delivery.district} дүүрэг</div>
                              <div className="text-xs text-gray-500">{delivery.address}</div>
                              {delivery.apartment && (
                                <div className="text-xs text-gray-500">{delivery.apartment}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-500" />
                            {delivery.order.phoneNumber || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getDeliveryStatusColor(delivery.status)}>
                            {translateDeliveryStatus(delivery.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {delivery.deliveryFee ? (
                            <div className="flex items-center text-green-600 font-medium">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {delivery.deliveryFee?.toLocaleString()} ₮
                            </div>
                          ) : (
                            <span className="text-gray-400">Тохируулаагүй</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {moment(delivery.requestedAt).format("YYYY-MM-DD HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateDelivery(delivery)}
                          >
                            Засах
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Delivery Modal */}
      {selectedDelivery && (
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Хүргэлтийн мэдээлэл засах</DialogTitle>
              <DialogDescription>
                Захиалга: {selectedDelivery.order.packageId}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deliveryFee" className="text-right">
                  Хүргэлтийн төлбөр
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="deliveryFee"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="Хүргэлтийн төлбөр"
                    className="pl-7"
                    type="number"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₮</span>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scheduledDate" className="text-right">
                  Хүргэх өдөр
                </Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Төлөв
                </Label>
                <Select
                  value={deliveryStatus}
                  onValueChange={(value) => setDeliveryStatus(value as DeliveryStatus)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Төлөв сонгох" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REQUESTED">Хүсэлт илгээсэн</SelectItem>
                    <SelectItem value="SCHEDULED">Баталгаажсан</SelectItem>
                    <SelectItem value="IN_PROGRESS">Хүргэлтэнд гарсан</SelectItem>
                    <SelectItem value="COMPLETED">Хүргэгдсэн</SelectItem>
                    <SelectItem value="CANCELLED">Цуцлагдсан</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Цуцлах
              </Button>
              <Button onClick={handleSubmitUpdate} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Хадгалж байна...
                  </>
                ) : (
                  "Хадгалах"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Main component with Suspense
export default function DeliveriesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Хүргэлтийн мэдээлэл ачааллаж байна...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <DeliveriesContent />
    </Suspense>
  );
} 