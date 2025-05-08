type StatusHistory = {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  orderId: string;
};

type Order = {
  id: string;
  packageId: string;
  phoneNumber?: string | null;
  size: OrderSize;
  status: OrderStatus;
  statusHistory: StatusHistory[];
  createdAt: Date;
  note?: string | null;
  isBroken: boolean;
  // userId?: string;
  deliveryCost?: number | null;
  deliveryAddress?: string | null;
  isPaid: boolean;
};

// type OrderResponse = {
//   id: string;
//   orderId: string;
//   productId: string;
//   phoneNumber?: string;
//   size: OrderSize;
//   status: OrderStatus;
//   statusHistory: StatusHistory[];
//   createdAt: Date;
//   note?: string;
//   isBroken: boolean;
//   userId: string;
//   deliveryCost?: number;
//   deliveryAddress?: string;
// };

type OrderBody = {
  packageId: string;
  phoneNumber: string | null;
  size: OrderSize;
  status: OrderStatus;
  isBroken: boolean;
  note?: string | null;
  createdAt: Date;
  // userId: string;
  deliveryCost?: number | null;
  deliveryAddress?: string | null;
  isPaid?: boolean;
};

type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role?: string;
};

type DeliveryStatusData = {
  name: string; // Order status name (e.g., "PENDING", "IN_TRANSIT")
  value: number; // Count of orders in this status
};

type SalesOverviewData = {
  name: string; // Month name (e.g., "1 сар", "2 сар")
  sales: number; // Number of sales in that month
};

type MetricsResponse = {
  deliveryStatus: DeliveryStatusData[]; // Pie chart data for order statuses
  salesOverview: SalesOverviewData[]; // Line chart data for monthly sales
  totalRevenue: number; // Total revenue from all orders
  deliveredOrders: number; // Number of orders successfully delivered
  totalOrders: number; // Total number of orders
  canceledOrders: number; // Number of canceled orders
};

type MongoUser = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: string;
};

type ClerkUser = {
  id: string;
  imageUrl: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  role?: string;
  email: string;
  createdAt: number;
  lastActiveAt:number | null
};
