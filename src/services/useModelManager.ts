"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";

export function useModelManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  // GET: Fetch all models
  const getAllModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "models/");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getModelsByBrandCode = useCallback(
    async (brandCode: string) => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "get",
          `model/by-brand?brandCode=${encodeURIComponent(brandCode)}`
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
    getAllModels,
    getModelsByBrandCode,
    loading,
  };
}
