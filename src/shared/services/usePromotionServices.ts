"use client";

import { useCallback, useState } from "react";
import useApiService from "@/config/useApi";

export function usePromotionServices() {
  const { callApi } = useApiService();
  const [loading, setLoading] = useState(false);

  // GET ALL PROMOTIONS
  const getAllPromotion = useCallback(
    async (params?: {
      status?: string | null;
      promoType?: string | null;
      keyword?: string | null;
      fromDate?: string | null;
      toDate?: string | null;
      page?: number;
      size?: number;
    }) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();

        const put = (k: string, v: any) => {
          if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
        };

        put("status", params?.status);
        put("promoType", params?.promoType);
        put("keyword", params?.keyword);
        put("fromDate", params?.fromDate);
        put("toDate", params?.toDate);
        put("page", params?.page ?? 0);
        put("size", params?.size ?? 10);

        const url = `/promotion/search?${qs.toString()}`;
        const response = await callApi("get", url);

        const data = response?.data ?? [];
        return data;
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  const getActivePromotionForOrder = useCallback(
    async (customerId: string) => {
      if (!customerId) return [];

      setLoading(true);
      try {
        const url = `/promotion/active-for-order/${customerId}`;
        const response = await callApi("get", url);

        return response?.data ?? [];
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  return {
    loading,
    getAllPromotion,
    getActivePromotionForOrder,
  };
}
