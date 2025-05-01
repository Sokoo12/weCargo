"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PackageDeleteModal from "./PackageDeleteModal";
import { OrderStatus } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import StatusChangeModal from "./StatusChangeModal";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import OrderForm from "./OrderForm";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import OrderFilters from "@/components/OrderFilters";
import { formatISO } from "date-fns";

const fetchOrders = async () => {
  const response = await fetch("/api/orders");
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING:
      return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30";
    case OrderStatus.IN_TRANSIT:
      return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30";
    case OrderStatus.CUSTOMS_HOLD:
      return "bg-red-500/20 text-red-400 hover:bg-red-500/30";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30";
    case OrderStatus.DELIVERED:
      return "bg-green-500/20 text-green-400 hover:bg-green-500/30";
    case OrderStatus.CANCELLED:
      return "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 hover:bg-gray-500/30";
  }
};

const PackagesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterPackageId, setFilterPackageId] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = 
      order.packageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPackageId = filterPackageId ? 
      order.packageId.toLowerCase().includes(filterPackageId.toLowerCase()) : 
      true;
    
    const matchesStatus = filterStatus === null ? true : order.status === filterStatus;
    
    let matchesDateRange = true;
    if (filterStartDate) {
      matchesDateRange = matchesDateRange && new Date(order.createdAt) >= filterStartDate;
    }
    if (filterEndDate) {
      const endDatePlusOne = new Date(filterEndDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      matchesDateRange = matchesDateRange && new Date(order.createdAt) < endDatePlusOne;
    }

    return matchesSearch && matchesPackageId && matchesStatus && matchesDateRange;
  });

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleFilterChange = (filters: { 
    packageId: string;
    status: OrderStatus | null;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => {
    setFilterPackageId(filters.packageId);
    setFilterStatus(filters.status);
    setFilterStartDate(filters.startDate);
    setFilterEndDate(filters.endDate);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (isError) {
    return <div>Error loading orders</div>;
  }

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Захиалгууд</h2>
        <div className="flex items-center gap-3">
          <OrderFilters onFilter={handleFilterChange} />
          <div className="relative">
            <input
              type="text"
              placeholder="Хайх..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-700">
              <th className="pb-3">Захиалгын дугаар</th>
              <th className="pb-3">Бүтээгдэхүүний дугаар</th>
              <th className="pb-3">Төлөв</th>
              <th className="pb-3">Огноо</th>
              <th className="pb-3">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: Order) => (
              <tr key={order.id} className="border-b border-gray-700">
                <td className="py-4">
                  <Link href={`/admin/packages/${order.packageId}`}>
                    <span className="text-blue-400 hover:underline">
                      {order.packageId}
                    </span>
                  </Link>
                </td>
                <td className="py-4 text-gray-300">{order.productId}</td>
                <td className="py-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`text-sm ${getStatusColor(order.status)}`}
                          onClick={() => handleStatusClick(order)}
                        >
                          {translateStatus(order.status)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Төлөв өөрчлөх</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-4 text-gray-300">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <OrderForm updateMode={true} orderId={order.id} />
                    <PackageDeleteModal orderId={order.id} packageId={order.packageId} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <StatusChangeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentStatus={selectedOrder.status}
          orderId={selectedOrder.id}
        />
      )}
    </motion.div>
  );
};

export default PackagesList;
