import { OrderStatus } from "@/types/enums"; // Import your OrderStatus enum
import {
  CheckCircle, // For completed steps
  Package, // For Order Confirmed
  Truck, // For Order Shipped
  Clock, // For In Transit
  MapPin, // For Out for Delivery
  Home, // For Delivered
} from "lucide-react";

const HorizontalStepper = ({ status }: { status: OrderStatus }) => {
  const steps = [
    {
      status: OrderStatus.PENDING,
      label: "Order Confirmed",
      icon: <Package className="w-5 h-5" />,
    },
    {
      status: OrderStatus.CUSTOMS_HOLD,
      label: "Order Shipped",
      icon: <Truck className="w-5 h-5" />,
    },
    {
      status: OrderStatus.IN_TRANSIT,
      label: "In Transit",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      status: OrderStatus.OUT_FOR_DELIVERY,
      label: "Out for Delivery",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      status: OrderStatus.DELIVERED,
      label: "Delivered",
      icon: <Home className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full relative">
      {/* Horizontal Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-300 z-0 hidden sm:block"></div>

      {/* Stepper Items */}
      {steps.map((step, index) => {
        const isCompleted = steps.findIndex((s) => s.status === status) >= index;
        const isCurrent = step.status === status;

        return (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center relative z-10 mb-4 sm:mb-0"
          >
            {/* Icon */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
            </div>

            {/* Label */}
            <div className="ml-2 sm:ml-0 sm:mt-2 text-center">
              <p
                className={`text-sm ${
                  isCompleted ? "text-primary font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-gray-500 mt-1">Current Status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HorizontalStepper;