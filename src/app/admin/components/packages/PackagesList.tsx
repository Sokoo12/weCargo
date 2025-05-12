"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import PackageDeleteModal from "./PackageDeleteModal";
import { OrderStatus, OrderSize } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import StatusChangeModal from "./StatusChangeModal";
import OrderDetailsModal from "./OrderDetailsModal";
import StatusHistoryModal from "./StatusHistoryModal";
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
import { Order, OrderDetails } from "@/types/order";
import { Info, FileText, Clock } from "lucide-react";

// Add custom window interface for hasLoggedOrders
declare global {
  interface Window {
    hasLoggedOrders?: boolean;
  }
}

const fetchOrders = async () => {
  try {
    console.log("Fetching orders from /api/orders");
    // Get the admin token from localStorage
    const token = localStorage.getItem("adminToken");

    const response = await fetch("/api/orders?admin=true", {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to fetch orders:", response.status, errorData);
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    const data = await response.json();
    console.log("Orders received:", data.orders ? data.orders.length : data.length, "First order status:", data.orders ? data.orders[0]?.status : data[0]?.status);
    return data.orders || data;
  } catch (error) {
    console.error("Error in fetchOrders:", error);
    throw error;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.IN_WAREHOUSE:
      return "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30";
    case OrderStatus.IN_TRANSIT:
      return "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30";
    case OrderStatus.IN_UB:
      return "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30";
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

const translateSize = (size: OrderSize): string => {
  switch (size) {
    case OrderSize.SMALL:
      return 'Жижиг';
    case OrderSize.MEDIUM:
      return 'Дунд';
    case OrderSize.LARGE:
      return 'Том';
    case OrderSize.UNDEFINED:
    default:
      return 'Тодорхойгүй';
  }
};

const PackagesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [filterOrderId, setFilterOrderId] = useState("");
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
    // Log the first few orders to debug status
    if (orders.length > 0 && !window.hasLoggedOrders) {
      console.log("First order:", orders[0]);
      console.log("Order status types:", orders.slice(0, 3).map((o: Order) => 
        `${o.orderId}: status=${o.status}, statusHistory=${JSON.stringify(o.statusHistory)}`
      ));
      window.hasLoggedOrders = true;
    }

    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.packageId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrderId = filterOrderId ? 
      order.orderId?.toLowerCase().includes(filterOrderId.toLowerCase()) : 
      true;
    
    // Check status from direct status field, then fallback to history
    const currentStatus = order.status || 
      (order.statusHistory && order.statusHistory.length > 0 && order.statusHistory[order.statusHistory.length - 1].status);
    
    const matchesStatus = filterStatus === null ? true : 
      currentStatus === filterStatus;
    
    let matchesDateRange = true;
    if (filterStartDate) {
      matchesDateRange = matchesDateRange && new Date(order.createdAt) >= filterStartDate;
    }
    if (filterEndDate) {
      const endDatePlusOne = new Date(filterEndDate);
      endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
      matchesDateRange = matchesDateRange && new Date(order.createdAt) < endDatePlusOne;
    }

    return matchesSearch && matchesOrderId && matchesStatus && matchesDateRange;
  });

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleDetailsClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleHistoryClick = (order: Order) => {
    setSelectedOrder(order);
    setIsHistoryModalOpen(true);
  };

  const handleFilterChange = (filters: { 
    packageId: string;
    status: OrderStatus | null;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }) => {
    setFilterOrderId(filters.packageId);
    setFilterStatus(filters.status);
    setFilterStartDate(filters.startDate);
    setFilterEndDate(filters.endDate);
  };

  const getCurrentStatus = (order: Order): OrderStatus => {
    // First try to get status from the status field
    if (order.status) {
      return order.status;
    }
    // Fallback to status history
    if (order.statusHistory && order.statusHistory.length > 0) {
      return order.statusHistory[order.statusHistory.length - 1].status;
    }
    return OrderStatus.IN_WAREHOUSE;
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
        <h2 className="text-xl font-semibold text-gray-100">Ачаанууд</h2>
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
              <th className="pb-3">Track Number</th>
              <th className="pb-3">Утасны дугаар</th>
              <th className="pb-3">Хэмжээ</th>
              <th className="pb-3">Төлөв</th>
              <th className="pb-3">Ачигдсан эсэх</th>
              <th className="pb-3">Эвдрэлтэй эсэх</th>
              <th className="pb-3">Огноо</th>
              <th className="pb-3">Үйлдэл</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: Order) => (
              <tr key={order.id} className="border-b border-gray-700">
                <td className="py-4">
                  <Link href={`/admin/packages/${order.orderId}`}>
                    <span className="text-blue-400 hover:underline">
                      {order.orderId}
                    </span>
                  </Link>
                </td>
                <td className="py-4">
                  <span className="text-gray-300">
                    {order.packageId}
                  </span>
                </td>
                <td className="py-4">
                  <span className="text-gray-300">
                    {order.phoneNumber || 'N/A'}
                  </span>
                </td>
                <td className="py-4">
                  <span className="text-gray-300">
                    {order.size ? translateSize(order.size) : ''} 
                    {order.package_size ? `(${order.package_size})` : order.size ? '' : 'N/A'}
                  </span>
                </td>
                <td className="py-4">
                  <span 
                    className={`rounded-full px-3 py-1 text-xs ${getStatusColor(getCurrentStatus(order))} cursor-pointer`}
                    onClick={() => handleStatusClick(order)}
                  >
                    {translateStatus(getCurrentStatus(order))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleHistoryClick(order);
                      }}
                      className="ml-2 text-gray-500 hover:text-gray-300"
                      title="Төлөвийн түүх харах"
                    >
                      <Clock size={14} />
                    </button>
                  </span>
                </td>
                <td className="py-4">
                  <span className={order.isShipped ? "text-green-400" : "text-yellow-400"}>
                    {order.isShipped ? "Тийм" : "Үгүй"}
                    {order.isShipped && order.orderDetails && (
                      <button
                        onClick={() => handleDetailsClick(order)}
                        className="ml-2 text-blue-400 hover:text-blue-300"
                        title="Дэлгэрэнгүй мэдээлэл харах"
                      >
                        <FileText size={16} />
                      </button>
                    )}
                  </span>
                </td>
                <td className="py-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={order.isDamaged ? "text-red-400 cursor-help" : "text-gray-400"}>
                          {order.isDamaged ? "Тийм" : "Үгүй"}
                        </span>
                      </TooltipTrigger>
                      {order.isDamaged && order.damageDescription && (
                        <TooltipContent>
                          <p>{order.damageDescription}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="py-4 text-gray-300">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <OrderForm updateMode={true} orderId={order.id} />
                    <PackageDeleteModal orderId={order.id} packageId={order.packageId || ''} />
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
          currentStatus={getCurrentStatus(selectedOrder)}
          orderId={selectedOrder.id}
        />
      )}

      {selectedOrder && (
        <OrderDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          orderDetails={selectedOrder.orderDetails || null}
          packageId={selectedOrder.packageId || ''}
        />
      )}

      {selectedOrder && (
        <StatusHistoryModal
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
          statusHistory={selectedOrder.statusHistory || []}
          packageId={selectedOrder.packageId || ''}
        />
      )}
    </motion.div>
  );
};

export default PackagesList;
