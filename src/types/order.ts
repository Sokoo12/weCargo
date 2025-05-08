import { OrderStatus } from "./enums";

export interface StatusHistory {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  orderId: string;
  employeeId?: string;
}

export interface Order {
  id: string;
  orderId: string;
  packageId: string;
  phoneNumber?: string;
  isShipped: boolean;
  isDamaged: boolean;
  damageDescription?: string;
  status?: OrderStatus;
  statusHistory: StatusHistory[];
  createdAt: Date;
  orderDetails?: OrderDetails;
}

export interface OrderDetails {
  id: string;
  orderId: string;
  totalQuantity: number;
  shippedQuantity: number;
  largeItemQuantity: number;
  smallItemQuantity: number;
  priceRMB: number;
  priceTonggur: number;
  deliveryAvailable: boolean;
  comments?: string;
  createdAt: Date;
} 