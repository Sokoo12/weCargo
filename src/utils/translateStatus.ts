import { OrderStatus } from "@/types/enums";

export const translateStatus = (status: OrderStatus): string => {
  switch (status) {
    case OrderStatus.PENDING:
      return "Хүлээгдэж байна";
    case OrderStatus.IN_TRANSIT:
      return "Тээвэрлэгдэж байна";
    case OrderStatus.CUSTOMS_HOLD:
      return "Гаалийн хяналтад";
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
