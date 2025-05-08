"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  currentStatus: OrderStatus;
}

const StatusChangeModal = ({ isOpen, onClose, currentStatus, orderId }: StatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
  const queryClient = useQueryClient();

  // Reset the selected status when the modal opens/closes
  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [isOpen, onClose]);

  // Mutation for updating order status
  const mutation = useMutation({
    mutationFn: async (newStatus: OrderStatus) => {
      if (!orderId) throw new Error("Захиалгын ID олдсонгүй.");
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      return response.json();
    },
    onSuccess: () => {
      toast.success("Захиалгын төлөв амжилттай шинэчлэгдлээ.");
      queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refresh orders list
      onClose(); // Close modal after success
    },
    onError: () => {
      toast.error("Захиалгын төлөв шинэчлэх явцад алдаа гарлаа.");
    },
  });

  const handleSave = () => {
    mutation.mutate(selectedStatus);
  };

  const statusColors:any = {
    [OrderStatus.IN_WAREHOUSE]: "text-yellow-800",
    [OrderStatus.IN_TRANSIT]: "text-blue-800",
    [OrderStatus.IN_UB]: "text-orange-800",
    [OrderStatus.DELIVERED]: "text-green-800",
    [OrderStatus.CANCELLED]: "text-gray-800",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Захиалгын төлөвийг өөрчлөх</DialogTitle>
          <DialogDescription>Шинэ статусыг сонгоно уу.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {Object.values(OrderStatus).map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "outline"}
              onClick={() => setSelectedStatus(status)}
              className={`w-full ${statusColors[status]} ${
                selectedStatus === status ? "text-white shadow-lg" : "shadow-none"
              }`}
              disabled={mutation.isPending}
            >
              {translateStatus(status)}
            </Button>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Болих
          </Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Хадгалах"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeModal;
