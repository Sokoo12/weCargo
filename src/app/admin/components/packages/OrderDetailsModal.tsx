"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderDetails } from "@/types/order";

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: OrderDetails | null;
  packageId: string;
}

const OrderDetailsModal = ({ isOpen, onClose, orderDetails, packageId }: OrderDetailsModalProps) => {
  if (!orderDetails) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg text-primary">
            Бүтээгдэхүүний дэлгэрэнгүй - {packageId}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Нийт тоо хэмжээ</p>
              <p className="font-medium">{orderDetails.totalQuantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Ачигдсан тоо</p>
              <p className="font-medium">{orderDetails.shippedQuantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Том ачаа</p>
              <p className="font-medium">{orderDetails.largeItemQuantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Жижиг ачаа</p>
              <p className="font-medium">{orderDetails.smallItemQuantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Үнэ (Юань)</p>
              <p className="font-medium">{orderDetails.priceRMB.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Үнэ (Төгрөг)</p>
              <p className="font-medium">{orderDetails.priceTonggur.toLocaleString()}</p>
            </div>
            <div className="space-y-1 col-span-2">
              <p className="text-sm text-gray-500">Хүргэлттэйэсэх</p>
              <p className="font-medium">{orderDetails.deliveryAvailable ? "Тийм" : "Үгүй"}</p>
            </div>
          </div>
          {orderDetails.comments && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Нэмэлт тайлбар</p>
              <div className="p-3 bg-gray-100 rounded-md">
                <p>{orderDetails.comments}</p>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Бүртгэгдсэн огноо</p>
            <p className="font-medium">
              {new Date(orderDetails.createdAt).toLocaleDateString()} {new Date(orderDetails.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal; 