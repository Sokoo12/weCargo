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
  Phone,
  Search,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"; // Added ChevronDown and ChevronUp icons
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
  const [searchType, setSearchType] = useState("orderId"); // "orderId" or "phone"
  const [orderId, setOrderId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  
  // Changed to handle either a single order or an array of orders
  const [orderData, setOrderData] = useState<Order | Order[] | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<{[key: string]: boolean}>({});

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{8}$/;
    if (!phone.trim()) {
      return "Утасны дугаараа оруулна уу.";
    } else if (!phoneRegex.test(phone)) {
      return "Зөв утасны дугаар оруулна уу (8 орон).";
    }
    return null;
  };

  const handleTrackOrder = async () => {
    if (searchType === "orderId" && !orderId) {
      setError("Захиалгын дугаараа оруулна уу.");
      return;
    }

    if (searchType === "phone") {
      const phoneError = validatePhoneNumber(phoneNumber);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setOrderData(null);
    setExpandedOrders({});

    try {
      let response;
      if (searchType === "orderId") {
        response = await fetch(`/api/orders/${orderId}`);
      } else {
        response = await fetch(`/api/orders/phone/${phoneNumber}`);
      }

      if (!response.ok) {
        throw new Error(
          searchType === "orderId"
            ? "Захиалга олдсонгүй"
            : "Утасны дугаараар захиалга олдсонгүй"
        );
      }

      const data = await response.json();
      
      // Initialize expanded state for the first order if we received multiple orders
      if (Array.isArray(data) && data.length > 0) {
        const initialExpandState = {};
        initialExpandState[data[0].id] = true; // Expand the first order
        setExpandedOrders(initialExpandState);
      }
      
      setOrderData(data);
    } catch (error) {
      setError(
        searchType === "orderId"
          ? "Захиалга олдсонгүй. Захиалгын дугаараа шалгана уу."
          : "Утасны дугаараар захиалга олдсонгүй. Утасны дугаараа шалгана уу."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setSearchType(value);
    setError(null);
  };

  const toggleOrderExpanded = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Function to render a single order
  const renderOrderDetails = (order: Order) => {
    const isExpanded = expandedOrders[order.id] || false;
    
    return (
     
      <motion.div
        key={order.id}
        className="mt-4 bg-gray-100 p-4 rounded-lg border border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Order header - always visible */}
        <div 
          className="flex justify-between items-center cursor-pointer" 
          onClick={() => toggleOrderExpanded(order.id)}
        >
          <div className="flex items-center">
            <Package className="w-5 h-5 mr-2 text-primary" />
            <span className="font-bold text-gray-800">
              Захиалга #{order.packageId}
            </span>
            <span 
              className={`px-2 py-1 rounded-full text-xs ml-2 ${
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
          </div>
          <div>
            <span className="text-sm text-gray-500 mr-2">
              {moment(order.createdAt).format("YYYY-MM-DD")}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>
        
        {/* Expanded order details */}
        {isExpanded && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <div className="divide-y-2 divide-gray-300 divide-dotted text-gray-700">
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
              </p>
              <p className="py-3 flex items-center">
                <Home className="w-5 h-5 mr-2 text-primary" />
                <span className="font-medium">
                  Захиалгаас хойш өнгөрсөн өдөр:
                </span>{" "}
                {getDaysSinceOrder(order.createdAt)} өдөр
              </p>
              {order.phoneNumber && (
                <p className="py-3 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-primary" />
                  <span className="font-medium">
                    Утасны дугаар:
                  </span>{" "}
                  <span className="ml-2">{order.phoneNumber}</span>
                </p>
              )}
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
            {order.statusHistory && order.statusHistory.length > 0 && (
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
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
       <ConstellationAnimation/>
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
              Захиалгын дугаар эсвэл утасны дугаараар захиалгаа хянана уу.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Custom Tab-like UI */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Button 
                  variant={searchType === "orderId" ? "default" : "outline"}
                  className={`flex items-center justify-center ${
                    searchType === "orderId" 
                      ? "bg-primary text-white" 
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleTabChange("orderId")}
                >
                  <Package size={16} className="mr-2" />
                  Захиалгын дугаар
                </Button>
                <Button 
                  variant={searchType === "phone" ? "default" : "outline"}
                  className={`flex items-center justify-center ${
                    searchType === "phone" 
                      ? "bg-primary text-white" 
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                  onClick={() => handleTabChange("phone")}
                >
                  <Phone size={16} className="mr-2" />
                  Утасны дугаар
                </Button>
              </div>
              
              {/* Input fields based on selected search type */}
              {searchType === "orderId" ? (
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Захиалгын дугаар"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="bg-gray-100 font-bold rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary"
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center right-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <Truck size={20} />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="Утасны дугаар"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={8}
                    className="bg-gray-100 font-bold rounded-full h-[50px] text-gray-700 placeholder-gray-400 border-gray-300 outline-primary"
                  />
                  <div className="absolute text-white outline-none flex items-center justify-center right-2 h-[34px] w-[34px] top-2 bg-primary rounded-full">
                    <Phone size={20} />
                  </div>
                </div>
              )}

              <Button
                onClick={handleTrackOrder}
                className="w-full text-white h-[50px] rounded-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Хайж байна...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Search size={20} className="mr-2" />
                    Захиалга хайх
                  </div>
                )}
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
                  <div className="flex items-center justify-center mt-2">
                    <AlertCircle size={16} className="mr-2" />
                    {error}
                  </div>
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

              {orderData && !isLoading && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {/* Display multiple orders when searching by phone */}
                  {Array.isArray(orderData) ? (
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-primary">
                        Захиалгын мэдээлэл ({orderData.length} захиалга)
                      </h3>
                      
                      {orderData.map(order => renderOrderDetails(order))}
                    </div>
                  ) : (
                    // Display single order when searching by ID
                    <div className="bg-gray-100 p-4 rounded-lg border border-gray-200 z-50">
                      <h3 className="text-xl font-bold mb-4 text-primary">
                        Захиалгын мэдээлэл
                      </h3>
                      {renderOrderDetails(orderData)}
                    </div>
                  )}
                </motion.div>
              )}

              {!orderData && !isLoading && !error && (
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