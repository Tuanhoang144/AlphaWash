"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import api from "@/config/axiosInstance";
import { QuickServiceGroup, RecentVehicle } from "@/types/QuickInvoice";

export function useQuickInvoiceManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getGroupedServices = useCallback(async (): Promise<QuickServiceGroup[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "quick-invoice/services");
      return response?.data ?? [];
    } catch (error) {
      console.error("Error loading grouped services:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getRecentVehicles = useCallback(async (limit = 10): Promise<RecentVehicle[]> => {
    setIsLoading(true);
    try {
      const response = await api.get(`quick-invoice/recent-vehicles`, {
        params: { limit },
      });
      return response.data?.data ?? [];
    } catch (error) {
      console.error("Error loading recent vehicles:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return {
    getGroupedServices,
    getRecentVehicles,
    loading,
  };
}
