"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Truck,
  Clock,
  MapPin,
  Home,
  CheckCircle,
} from "lucide-react"; // Import necessary icons
import { OrderStatus } from "@/types/enums";
import { translateStatus } from "@/utils/translateStatus";
import ConstellationAnimation from "@/components/ConstellationAnimation";
import moment from "moment"; // Import Moment.js
import VerticalStepper from "@/components/VerticalStepper";
import Image from "next/image";

const getDaysSinceOrder = (createdAt: string | Date): number => {
  const orderDate = moment(createdAt); // Parse the order date using Moment.js
  const currentDate = moment(); // Get the current date
  return currentDate.diff(orderDate, "days"); // Calculate the difference in days
};

const TrackingPage = () => {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackOrder = async () => {
    if (!orderId) {
      setError("Захиалгын дугаараа оруулна уу.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) {
        throw new Error("Захиалга олдсонгүй");
      }

      const data: Order = await response.json();
      setOrder(data);
    } catch (error) {
      setError("Захиалга олдсонгүй. Захиалгын дугаараа шалгана уу.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <ConstellationAnimation />
      <motion.div
        className="w-full max-w-lg z-10 mb-[100px] sm:mb-0 mt-[120px]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white/50 border-primary/20 border-[8px] backdrop-blur-sm shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary text-center">
              Захиалгаа хянах
            </CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Захиалгын дугаараа оруулан захиалгаа хянана уу.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Захиалгын дугаар"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="bg-gray-100 font-bold rounded-full h-[50px] text-gray-700 placeholder-gray-100 border-gray-300 outline-primary "
                />
                <div className="absolute text-white outline-none flex items-center justify-center right-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                  <Truck size={20} />
                </div>
              </div>

              <Button
                onClick={handleTrackOrder}
                className="w-full text-white h-[50px]"
                disabled={isLoading}
              >
                {isLoading ? "Хайж байна..." : "Захиалга хайх"}
              </Button>
              {error && (
                <motion.div
                  className="text-red-400 text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Image
                    src={"/assets/images/flying-kite.png"}
                    alt="not found"
                    width={250}
                    height={250}
                    className="mx-auto"
                  />
                  {error}
                </motion.div>
              )}

              {isLoading && (
                <motion.div
                  className="mt-6 space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Skeleton className="h-[48px] w-full bg-gray-200" />
                  <Skeleton className="h-[48px] w-full bg-gray-200" />
                  <Skeleton className="h-[48px] w-full bg-gray-200" />
                  <Skeleton className="h-[48px] w-full bg-gray-200" />
                  <Skeleton className="h-[48px] w-full bg-gray-200" />
                </motion.div>
              )}

              {order && !isLoading ? (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 z-50">
                    <h3 className="text-xl font-bold mb-4 text-primary">
                      Захиалгын мэдээлэл
                    </h3>
                    <div className="mt-4 divide-y-2 divide-gray-300 divide-dotted text-gray-700">
                      <p className="py-3 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-medium">
                          Захиалгын дугаар
                        </span>{" "}
                        <span className="bg-green-400 rounded-full px-2 ml-2 text-white">
                          {order.packageId}
                        </span>
                      </p>
                      <p className="py-3 flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-medium">Барааны код:</span>{" "}
                        <span className="ml-2">{order.productId}</span>
                      </p>
                      <p className="py-3 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-medium">Төлөв:</span>{" "}
                        <span
                          className={`px-2 py-1 rounded-full text-sm ml-2 ${
                            order.status === OrderStatus.DELIVERED
                              ? "bg-green-200 text-green-800"
                              : order.status === OrderStatus.PENDING
                              ? "bg-yellow-200 text-yellow-800"
                              : order.status === OrderStatus.IN_TRANSIT
                              ? "bg-blue-200 text-blue-800"
                              : order.status === OrderStatus.CUSTOMS_HOLD
                              ? "bg-red-200 text-red-800"
                              : "bg-[#ffeab8] text-gray-800"
                          }`}
                        >
                          {translateStatus(order.status)}
                        </span>
                      </p>
                      <p className="py-3 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-medium">
                          Үүсгэсэн огноо:
                        </span>{" "}
                        <span className="ml-2">
                          {moment(order.createdAt).format("YYYY-MM-DD")}{" "}
                        </span>
                        {/* Format date with Moment.js */}
                      </p>
                      <p className="py-3 flex items-center">
                        <Home className="w-5 h-5 mr-2 text-primary" />
                        <span className="font-medium">
                          Захиалгаас хойш өнгөрсөн өдөр:
                        </span>{" "}
                        {getDaysSinceOrder(order.createdAt)} өдөр
                      </p>
                      {order.note && (
                        <p className="py-3 items-center">
                          <div className="border border-primary rounded-lg p-2 bg-primary/5">
                            <div className="flex">
                              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
                              <span className="font-medium text-primary">
                                Тэмдэглэл
                              </span>{" "}
                            </div>
                            {order.note}
                          </div>
                        </p>
                      )}
                    </div>

                    <div className="pt-6">
                      <h2 className="text-xl font-bold mb-4 text-primary">
                        Захиалгын төлөв
                      </h2>
                      <VerticalStepper status={order.status} />
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-6">
                      <h4 className="text-xl font-bold mb-4 text-primary">
                        Захиалгын хяналт
                      </h4>
                      <div className="mt-2 space-y-2">
                        {order.statusHistory.map((history, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                            <p>
                              {translateStatus(history.status)} -{" "}
                              {moment(history.timestamp).format(
                                "YYYY-MM-DD HH:mm"
                              )}{" "}
                              {/* Format timestamp with Moment.js */}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image
                    src={"/assets/images/rocket-launch.png"}
                    alt="not found"
                    width={230}
                    height={230}
                    className="mx-auto"
                  />
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TrackingPage;
