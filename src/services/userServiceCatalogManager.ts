// hooks/useServiceCatalogManager.ts
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";

export function useServiceCatalogManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  const getServiceCatalogById = useCallback(
    async (id: number) => {
      setIsLoading(true);
      try {
        const response = await callApi("get", `service-catalog/${id}`);
        return response?.data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

   const getServiceCatalogByServiceId = useCallback(
    async (id: number) => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "get",
          `service-catalog/by-service-id/${id}`
        );
        return response?.data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  return {
    getServiceCatalogById,
    getServiceCatalogByServiceId,
    loading,
  };
}
