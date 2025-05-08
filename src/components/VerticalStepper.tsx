import { OrderStatus } from "@/types/enums"; // OrderStatus enum-ийг оруулна
import {
  CheckCircle, // Дууссан алхамуудад
  Package, // Захиалга баталгаажсан
  Truck, // Захиалга хүргэлтэнд гарсан
  Clock, // Тээвэрлэгдэж байгаа
  MapPin, // Хүргэлтэнд гарсан
  Home, // Хүргэгдсэн
} from "lucide-react";

const VerticalStepper = ({ status }: { status: OrderStatus }) => {
  const steps = [
    {
      status: OrderStatus.IN_WAREHOUSE,
      label: "Эрээн агуулахад ирсэн",
      icon: <Package className="w-5 h-5" />,
    },
    {
      status: OrderStatus.IN_UB,
      label: "Хотод ирсэн",
      icon: <Truck className="w-5 h-5" />,
    },
    {
      status: OrderStatus.IN_TRANSIT,
      label: "Тээвэрлэгдэж байгаа",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      status: OrderStatus.OUT_FOR_DELIVERY,
      label: "Хүргэлтэнд гарсан",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      status: OrderStatus.DELIVERED,
      label: "Хүргэгдсэн",
      icon: <Home className="w-5 h-5" />,
    },
  ];

  const activeIndex = steps.findIndex((s) => s.status === status);

  return (
    <div className="flex flex-col items-start relative">
      {/* Босоо шугам */}
      <div className="absolute left-5 top-0 bottom-0 w-[2px] bg-gray-200 z-0">
        {/* Colorful Path */}
        <div
          className="absolute left-0 top-0 w-[2px] bg-primary transition-all duration-500"
          style={{
            height: activeIndex >= 0 ? `${(activeIndex * 20)}%` : "0%", // Fixed height calculation
          }}
        ></div>
      </div>

      {/* Алхамууд */}
      {steps.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const isCurrent = step.status === status;

        return (
          <div
            key={index}
            className="flex items-center relative z-10 mb-8"
          >
            {/* Дүрс */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isCompleted
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              { step.icon}
            </div>

            {/* Тайлбар */}
            <div className="ml-4">
              <p
                className={`text-sm ${
                  isCompleted ? "text-primary font-medium" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-gray-500 mt-1">Одоогийн төлөв</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VerticalStepper;