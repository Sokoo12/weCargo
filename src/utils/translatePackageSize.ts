
import { OrderSize } from "@/types/enums";

export default (size: OrderSize): string => {
    switch (size) {
        case OrderSize.LARGE:
            return "Том";
        case OrderSize.MEDIUM:
            return "Дунд";
        case OrderSize.SMALL:
            return "Жижиг";
        default:
            return "Тодорхойгүй";
    }
};