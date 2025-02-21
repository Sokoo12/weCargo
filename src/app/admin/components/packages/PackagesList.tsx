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

const fetchOrders = async () => {
  const response = await fetch("/api/orders");
  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }
  return response.json();
};

const PackagesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const filteredOrders = orders.filter(
    (order: Order) =>
      order.packageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    );
  if (isError) return <p>Алдаа гарлаа </p>;

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Захиалгууд</h2>
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Захиалгын дугаар
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Барааны код
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Төлөв
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Огноо
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Үйлдэл
              </th>
            </tr>
          </thead>

          <tbody className="divide divide-gray-700">
            {filteredOrders.map((order: Order) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  <Link href={`/admin/packages/${order.packageId}`}>
                    {order.packageId}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {order.productId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleStatusClick(order)}
                          className={`${
                            order.status === OrderStatus.DELIVERED
                              ? "bg-green-200 text-green-800"
                              : order.status === OrderStatus.PENDING
                              ? "bg-yellow-200 text-yellow-800"
                              : order.status === OrderStatus.IN_TRANSIT
                              ? "bg-blue-200 text-blue-800"
                              : order.status === OrderStatus.CUSTOMS_HOLD
                              ? "bg-red-200 text-red-800"
                              : order.status === OrderStatus.CANCELLED
                              ? "bg-[#A6F1E0] text-[#73C7C7]"
                              : "bg-[#ffeab8] text-gray-800"
                          }`}
                        >
                          {translateStatus(order.status)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Төлөв шинчлэх</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="flex px-6 py-4 whitespace-nowrap text-sm text-gray-300 gap-3">
                  <OrderForm orderId={order.packageId} updateMode={true} />
                  <PackageDeleteModal
                    orderId={order.id}
                    packageId={order.packageId}
                  />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <StatusChangeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentStatus={selectedOrder?.status as OrderStatus}
        orderId={selectedOrder?.id}
      />
    </motion.div>
  );
};

export default PackagesList;
