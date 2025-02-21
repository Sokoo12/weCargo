import { OrderStatus } from "@/types/enums";
import { Package, Truck, Clock, MapPin, Home } from "lucide-react";

const Stepper = ({ status }: { status: OrderStatus }) => {
  const steps = [
    { status: OrderStatus.PENDING, label: "Баталгаажсан", icon: Package },
    { status: OrderStatus.CUSTOMS_HOLD, label: "Хүргэлтэнд гарсан", icon: Truck },
    { status: OrderStatus.IN_TRANSIT, label: "Тээвэрлэгдэж байгаа", icon: Clock },
    { status: OrderStatus.OUT_FOR_DELIVERY, label: "Хүргэлтэнд гарсан", icon: MapPin },
    { status: OrderStatus.DELIVERED, label: "Хүргэгдсэн", icon: Home },
  ];

  const activeIndex = steps.findIndex((s) => s.status === status);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between w-full relative px-10">
        {/* Progress Line (Centered Through Icons) */}
        <div className="absolute top-[33%] left-0 right-0 h-[5px] bg-gray-300 rounded-lg overflow-hidden w-[81%] mx-auto">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = step.status === status;

          return (
            <div key={index} className="flex flex-col items-center relative z-10">
              {/* Icon (Centered on Line) */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  isCompleted ? "bg-primary text-white" : "bg-gray-400 text-gray-200"
                } ${isCurrent ? "ring-4 ring-primary/40" : ""}`}
              >
                <step.icon className="w-8 h-8" />
              </div>

              {/* Label */}
              <p className={`text-sm font-semibold mt-4 transition-colors duration-300 ${isCompleted ? "text-primary" : "text-gray-500"}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col items-start w-full space-y-6 relative">
        {/* Progress Line */}
        <div className="absolute left-6 top-8 bottom-8 w-[3px] bg-gray-300 overflow-hidden">
          <div
            className="w-full bg-primary transition-all duration-300"
            style={{ height: `${((activeIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;
          const isCurrent = step.status === status;

          return (
            <div key={index} className="flex items-center space-x-4 relative z-10">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
                  isCompleted ? "bg-primary text-white" : "bg-gray-300 text-gray-500"
                } ${isCurrent ? "ring-4 ring-primary/30" : ""}`}
              >
                <step.icon className="w-6 h-6" />
              </div>

              {/* Label */}
              <div>
                <p className={`text-sm font-medium transition-colors duration-300 ${isCompleted ? "text-primary" : "text-gray-400"}`}>
                  {step.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
