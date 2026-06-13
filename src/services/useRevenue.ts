"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";
import { mapFullOrderToRequest } from "@/utils/mapperCreateOrder";
import { mapFullOrderToUpdateRequest } from "@/utils/mapperUpdateOrder";
import { OrderResponseDTO } from "@/types/OrderResponse";
export type RevenueData = {
    orderDate?: string
    serviceTypeCode?: string
    serviceName?: string
    serviceTypeName?: string
    netRevenue?: string
    grossRevenue?: string
}

export type RevenueRequest = {
    startDate: string
    endDate: string
    orderStatus?: string
}

export function useRevenue() {
    const { callApi, loading, setIsLoading } = useApiService();
    const router = useRouter();

    const getRevenue = useCallback(async (request: RevenueRequest) => {
        setIsLoading(true);
        try {
          const response = await callApi("post", "revenue", request);
          return response?.data;
        } catch (error: any) {
          throw error;
        } finally {
          setIsLoading(false);
        }
      }, [callApi, setIsLoading]);
  

  return { getRevenue, loading }
}