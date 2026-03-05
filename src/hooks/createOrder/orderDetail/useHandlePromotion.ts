"use client";

import { usePromotionServices } from "@/shared/services/usePromotionServices";
import { CustomerDTO } from "@/types/customer/CustomerDTO";
import { PromotionDTO } from "@/types/promotion/PromotionDTO";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function usePromotion(
  customer: CustomerDTO | null,
) {
  const [listPromotions, setListPromotions] = useState<PromotionDTO[]>([]);
  const { getActivePromotionForOrder } = usePromotionServices();

  useEffect(() => {
    (async () => {
      if (!customer?.id) {
        setListPromotions([]);
        return;
      }
      try {
        const data = await getActivePromotionForOrder(customer.id);
        setListPromotions(Array.isArray(data) ? data : []);
      } catch (error) {
        setListPromotions([]);
      }
    })();
  }, [customer?.id]);

  const usablePromotions = useMemo(
    () => listPromotions.filter((p) => p.usable),
    [listPromotions]
  );

  return {
    listPromotions,
    usablePromotions,
  };
}
