"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusHistory } from "@/types/order";
import { translateStatus } from "@/utils/translateStatus";
import { OrderStatus } from "@/types/enums";

interface StatusHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusHistory: StatusHistory[];
  packageId: string;
}

const StatusHistoryModal = ({ isOpen, onClose, statusHistory, packageId }: StatusHistoryModalProps) => {
  // Sort status history by timestamp (newest first for display)
  const sortedHistory = [...statusHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.IN_WAREHOUSE:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.IN_TRANSIT:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.IN_UB:
        return "bg-orange-100 text-orange-800";
      case OrderStatus.OUT_FOR_DELIVERY:
        return "bg-purple-100 text-purple-800";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg text-primary">
            Төлөвийн түүх - {packageId}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {sortedHistory.length === 0 ? (
            <p className="text-center text-gray-500">Төлөвийн түүх хоосон байна</p>
          ) : (
            <ul className="space-y-4">
              {sortedHistory.map((item, index) => (
                <li key={item.id || index} className="border-b pb-3">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs ${getStatusColor(item.status)}`}>
                      {translateStatus(item.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {item.employeeId && (
                    <div className="mt-1 text-xs text-gray-500">
                      Ажилтан: {item.employeeId}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatusHistoryModal; 