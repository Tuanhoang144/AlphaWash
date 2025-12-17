import { PromoType } from "../components/constant/PromoType";

export interface PromotionApiItem {
  promoId: string;
  promoCode: string;
  promoName: string;
  promoType: PromoType;
  value: number | null;
  services: PromotionServiceItem[];
  startDate: string;
  endDate: string | null;
  usable: boolean;
  reason: string | null;
}

export interface PromotionServiceItem {
  serviceCode: string;
  serviceName: string;
  discountAmount: number | null;
  discountPercent: number | null;
}
