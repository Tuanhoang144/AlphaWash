import { PromoType } from "@/shared/components/constant/PromoType";
import { PromotionApiItem } from "@/shared/types/PromotionApiItem";
import { formatMoney } from "../formatMoney";

export function promoTypeLabel(t: PromoType) {
  switch (t) {
    case "SERVICE_AMOUNT":
      return "Theo dịch vụ • Giảm tiền";
    case "SERVICE_PERCENT":
      return "Theo dịch vụ • Giảm %";
    case "BILL_AMOUNT":
      return "Theo hoá đơn • Trừ tiền";
    case "BILL_PERCENT":
      return "Theo hoá đơn • Giảm %";
    default:
      return t;
  }
}

export function promoValueLabel(p: PromotionApiItem) {
  if (p.value == null) return "Tuỳ cấu hình";
  if (p.promoType === "BILL_PERCENT" || p.promoType === "SERVICE_PERCENT") {
    return `Giảm ${p.value}%`;
  }
  return `Giảm ${formatMoney(p.value)}`;
}

export function filterPromotions(list: PromotionApiItem[], q: string) {
  const kw = q.trim().toLowerCase();
  if (!kw) return list;
  return list.filter(
    (p) =>
      p.promoCode.toLowerCase().includes(kw) ||
      p.promoName.toLowerCase().includes(kw)
  );
}

export function splitUsable(list: PromotionApiItem[]) {
  return {
    usable: list.filter((p) => p.usable),
    unusable: list.filter((p) => !p.usable),
  };
}