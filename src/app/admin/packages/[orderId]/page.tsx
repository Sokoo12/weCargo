"use client";
import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import { translateStatus } from "@/utils/translateStatus";
import { Package, Truck, Clock, MapPin, Home, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import StatCard from "../../components/common/StatCard";
import Stepper from "../../components/packages/Stepper";

const fetchOrder = async (orderId: string): Promise<Order> => {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) throw new Error("Failed to fetch order");
  return response.json();
};

const getDaysSinceOrder = (createdAt: string) => {
  return moment().diff(moment(createdAt), "days");
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-3">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-full" />
    </div>
  </div>
);

const ErrorMessage = ({ error }: { error: string }) => (
  <div className="p-4 text-red-500">{error}</div>
);

const OrderDetailPage = () => {
  const params = useParams();
  const { orderId } = params;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (orderId) {
      fetchOrder(orderId as string)
        .then((data) => {
          if (isMounted) {
            setOrder(data);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setError(err.message);
            setIsLoading(false);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const daysSinceOrder = useMemo(
    () => (order ? getDaysSinceOrder(String(order.createdAt)) : 0),
    [order]
  );

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!order) {
    return <p className="text-gray-500">Захиалга олдсонгүй.</p>;
  }

  return (
    <div>
      <motion.div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <StatCard
          name="Захиалгын дугаар"
          icon={Package}
          value={order.packageId}
          color="#6366F1"
        />
        <StatCard
          name="Үүсгэсэн огноо"
          icon={Truck}
          value={moment(order.createdAt).format("YYYY-MM-DD")}
          color="#F59E0B"
        />
        <StatCard
          name="Төлөв"
          icon={Clock}
          value={translateStatus(order.status)}
          color="#10B981"
        />

        <StatCard
          name="Өнгөрсөн өдөр:"
          icon={MapPin}
          value={<div>{getDaysSinceOrder(String(order.createdAt))} өдөр</div>}
          color="#EF4444"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="">
          <div className="mt-4 divide-y-2 divide-gray-300 divide-dotted text-gray-700">
            <p className="py-3 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              <span className="font-medium text-white">Барааны код:</span>{" "}
              <span className="ml-2 text-white bg-green-400 px-3 rounded-full">
                {order.productId}
              </span>
            </p>

            {order.note && (
              <p className="py-5 items-center">
                <div className="border border-primary rounded-lg p-5 bg-primary/5">
                  <div className="flex">
                    <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-medium text-primary">
                      Тэмдэглэл
                    </span>{" "}
                  </div>
                  <p className="text-white mt-2">{order.note}</p>
                </div>
              </p>
            )}
          </div>

          <div className="pt-6">
            <h2 className="text-xl font-bold mb-4 text-primary">
              Захиалгын төлөв
            </h2>
            <Stepper status={order.status} />
          </div>

          {/* Status Timeline */}
          <div className="mt-6">
            <h4 className="text-xl font-bold mb-4 text-primary">
              Захиалгын хяналт
            </h4>
            <div className="mt-2 space-y-2">
              {order.statusHistory.map((history, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 "></div>
                  <p>
                    {translateStatus(history.status)} -{" "}
                    {moment(history.timestamp).format("YYYY-MM-DD HH:mm")}{" "}
                    {/* Format timestamp with Moment.js */}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderDetailPage; 