"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PromotionApiItem } from "@/shared/types/PromotionApiItem";
import { usePromotionServices } from "@/shared/services/usePromotionServices";

export function usePromotionApply(
  customerId: string | null,
  setSelectedPromotion: (promo: PromotionApiItem | null) => void
) {
  const [promotions, setPromotions] = useState<PromotionApiItem[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const canChoosePromotion = !!customerId;

  const { getActivePromotionForOrder } = usePromotionServices();

  const fetchPromotions = useCallback(async () => {
    if (!customerId) {
      setPromotions([]);
      return;
    }
    setPromoLoading(true);
    try {
      const data = await getActivePromotionForOrder(customerId);
      setPromotions(Array.isArray(data) ? data : []);
    } finally {
      setPromoLoading(false);
    }
  }, [customerId, getActivePromotionForOrder]);

  //Lấy dánh sách mã giảm giá khi customerId thay đổi
  useEffect(() => {
    fetchPromotions();
  }, [customerId]);

  const usablePromotions = useMemo(
    () => promotions.filter((p) => p.usable),
    [promotions]
  );

  const applyPromotion = useCallback(
    (
      promo: PromotionApiItem | null,
      options?: { skipUsableCheck?: boolean }
    ) => {
      if (!customerId) return;

      // Nếu không bỏ qua kiểm tra và promotion không usable → không cho apply
      if (!options?.skipUsableCheck && promo && !promo.usable) {
        return;
      }

      setSelectedPromotion(promo);

      // Trả về giá trị discount để component cha set vào form
      if (!promo) {
        return { discount: 0, promotionId: null };
      }

      if (promo.promoType === "BILL_PERCENT") {
        return {
          discount: promo.value ?? 0,
          promotionId: promo.promoId ?? null,
        };
      }

      // Các loại promotion khác (ví dụ: giảm cố định, tặng dịch vụ,...)
      return {
        discount: 0,
        promotionId: promo.promoId ?? null,
      };
    },
    [customerId]
  );

  const resetPromotion = useCallback(() => {
    setSelectedPromotion(null);
    applyPromotion(null);
  }, [applyPromotion]);

  return {
    promotions,
    usablePromotions,
    promoLoading,
    canChoosePromotion,
    applyPromotion,
    resetPromotion,
    refetchPromotions: fetchPromotions,
  };
}
