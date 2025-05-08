import { OrderStatus } from "./enums";

export interface StatusHistoryItem {
  id: string;
  status: OrderStatus;
  timestamp: Date;
  orderId: string;
}

export interface OrderDetails {
  id: string;
  orderId: string;
  totalQuantity?: number;
  shippedQuantity?: number;
  largeItemQuantity?: number;
  smallItemQuantity?: number;
  priceRMB?: number;
  priceTonggur?: number;
  deliveryAvailable?: boolean;
  comments?: string;
}

export interface Order {
  id: string;
  orderId: string;
  packageId?: string;
  phoneNumber?: string;
  isShipped: boolean;
  isDamaged: boolean;
  damageDescription?: string | null;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: StatusHistoryItem[];
  orderDetails?: OrderDetails | null;
}

export interface OrderUpdateData {
  orderId?: string;
  packageId?: string;
  phoneNumber?: string;
  isShipped?: boolean;
  isDamaged?: boolean;
  damageDescription?: string | null;
  status?: OrderStatus;
  createdAt?: Date;
} 