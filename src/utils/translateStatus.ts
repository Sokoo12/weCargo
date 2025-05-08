import { OrderStatus } from "@/types/enums";

export const translateStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.IN_WAREHOUSE:
      return "Эрээн агуулахад ирсэн";
    case OrderStatus.IN_TRANSIT:
      return "Эрээн агуулахаас гарсан";
    case OrderStatus.IN_UB:
      return "Хотод ирсэн";
    case OrderStatus.OUT_FOR_DELIVERY:
      return "Хүргэлтэнд гарсан";
    case OrderStatus.DELIVERED:
      return "Хүргэгдсэн";
    case OrderStatus.CANCELLED:
      return "Цуцлагдсан";
    default:
      return "Тодорхойгүй";
  }
};
