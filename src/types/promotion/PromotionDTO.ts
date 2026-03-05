import { PromoType } from "@/constant/PromoType";

export interface PromotionDTO {
  promoId: string;
  promoCode: string;
  promoName: string;
  promoType: PromoType;
  value: number | null;
  services: PromotionServiceDTO[];
  startDate: string;
  endDate: string | null;
  usable: boolean;
  reason: string | null;
}

export interface PromotionServiceDTO {
  serviceCode: string;
  serviceName: string;
  discountAmount: number | null;
  discountPercent: number | null;
}
