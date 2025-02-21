import { OrderStatus } from "@/types/enums"; // Import your OrderStatus enum

const HorizontalTimeline = ({ status }: { status: OrderStatus }) => {
  const statuses = [
    { status: OrderStatus.PENDING, label: "Order Confirmed" },
    { status: OrderStatus.CUSTOMS_HOLD, label: "Order Shipped" },
    { status: OrderStatus.IN_TRANSIT, label: "In Transit" },
    { status: OrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
    { status: OrderStatus.DELIVERED, label: "Delivered" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between w-full relative">
      {/* Horizontal Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-300 z-0 hidden sm:block"></div>

      {/* Timeline Items */}
      {statuses.map((s, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row items-center relative z-10 mb-4 sm:mb-0"
        >
          {/* Circle */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              statuses.findIndex((item) => item.status === status) >= index
                ? "bg-primary border-2 border-primary"
                : "bg-gray-300 border-2 border-gray-300"
            }`}
          >
            {statuses.findIndex((item) => item.status === status) >= index && (
              <span className="text-white text-xs">✓</span>
            )}
          </div>

          {/* Label and Opposite Content */}
          <div className="ml-2 sm:ml-0 sm:mt-2 text-center">
            <p
              className={`text-sm ${
                statuses.findIndex((item) => item.status === status) >= index
                  ? "text-primary font-medium"
                  : "text-gray-400"
              }`}
            >
              {s.label}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {s.status === OrderStatus.PENDING && "09:15 AM, January 1, 2024"}
              {s.status === OrderStatus.CUSTOMS_HOLD && "12:20 PM, January 4, 2024"}
              {s.status === OrderStatus.IN_TRANSIT && "07:00 AM, January 8, 2024"}
              {s.status === OrderStatus.OUT_FOR_DELIVERY && "Out for Delivery"}
              {s.status === OrderStatus.DELIVERED && "Estimated delivery by 09:20 AM"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HorizontalTimeline;