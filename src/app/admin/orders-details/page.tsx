"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Calendar, FileText, Download, Upload } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import OrderDetailsModal from "../components/packages/OrderDetailsModal";
import { OrderDetails, Order } from "@/types/order";
import BulkOrderUpload from "../components/packages/BulkOrderUpload";

const fetchOrdersWithDetails = async () => {
  try {
    console.log("Fetching orders with details");
    // Get the admin token from localStorage
    const token = localStorage.getItem("adminToken");

    const response = await fetch("/api/orders?admin=true", {
      headers: token ? {
        Authorization: `Bearer ${token}`
      } : {}
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }
    const data = await response.json();
    
    // Filter orders that have orderDetails
    const ordersWithDetails = (data.orders || data).filter((order: Order) => 
      order.isShipped && order.orderDetails
    );
    
    console.log(`Found ${ordersWithDetails.length} orders with details`);
    return ordersWithDetails;
  } catch (error) {
    console.error("Error fetching orders with details:", error);
    throw error;
  }
};

const OrderDetailsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetails | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders-with-details"],
    queryFn: fetchOrdersWithDetails,
  });

  const filteredOrders = orders.filter((order: Order) => {
    return (
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.packageId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleViewDetails = (order: Order) => {
    if (order.orderDetails) {
      setSelectedOrderDetails(order.orderDetails);
      setSelectedPackageId(order.packageId || "");
      setIsDetailsModalOpen(true);
    }
  };

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    // CSV Header
    const csvHeader = [
      "Order ID",
      "Package ID",
      "Total Quantity",
      "Shipped Quantity",
      "Large Items",
      "Small Items",
      "Price (RMB)",
      "Price (Tonggur)",
      "Delivery Available",
      "Comments",
      "Created Date"
    ].join(",");

    // CSV Rows
    const csvRows = filteredOrders.map((order: Order) => {
      const details = order.orderDetails;
      if (!details) return "";
      
      return [
        order.orderId,
        order.packageId,
        details.totalQuantity,
        details.shippedQuantity,
        details.largeItemQuantity,
        details.smallItemQuantity,
        details.priceRMB || 0,
        details.priceTonggur || 0,
        details.deliveryAvailable ? "Yes" : "No",
        details.comments ? `"${details.comments.replace(/"/g, '""')}"` : "",
        new Date(order.createdAt || new Date()).toLocaleDateString()
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [csvHeader, ...csvRows].join("\n");

    // Create a Blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `order-details-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    return <div>Error loading order details</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Бүтээгдэхүүн Дэлгэрэнгүй Мэдээлэл</h1>
        <div className="flex items-center gap-3">
          <BulkOrderUpload />
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportCSV}
            disabled={filteredOrders.length === 0}
          >
            <Download size={16} /> Экспорт CSV
          </Button>
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

      <motion.div
        className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3">Захиалгын дугаар</th>
                <th className="pb-3">Ачааны дугаар(Track Number)</th>
                <th className="pb-3">Нийт тоо хэмжээ</th>
                <th className="pb-3">Ачигдсан тоо</th>
                <th className="pb-3">Том ачаа</th>
                <th className="pb-3">Жижиг ачаа</th>
                <th className="pb-3">Үнэ (Юань)</th>
                <th className="pb-3">Үнэ (Төгрөг)</th>
                <th className="pb-3">Хүргэлттэй эсэх</th>
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
                  <td className="py-4 text-gray-300">{order.packageId}</td>
                  <td className="py-4 text-gray-300">{order.orderDetails?.totalQuantity}</td>
                  <td className="py-4 text-gray-300">{order.orderDetails?.shippedQuantity}</td>
                  <td className="py-4 text-gray-300">{order.orderDetails?.largeItemQuantity}</td>
                  <td className="py-4 text-gray-300">{order.orderDetails?.smallItemQuantity}</td>
                  <td className="py-4 text-gray-300">{order.orderDetails?.priceRMB?.toLocaleString() || '0'}</td>
                  <td className="py-4 text-gray-300">{order.orderDetails?.priceTonggur?.toLocaleString() || '0'}</td>
                  <td className="py-4">
                    <span className={order.orderDetails?.deliveryAvailable ? "text-green-400" : "text-yellow-400"}>
                      {order.orderDetails?.deliveryAvailable ? "Тийм" : "Үгүй"}
                    </span>
                  </td>
                  <td className="py-4 text-gray-300">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Дэлгэрэнгүй харах"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        orderDetails={selectedOrderDetails}
        packageId={selectedPackageId}
      />
    </div>
  );
};

export default OrderDetailsPage; 