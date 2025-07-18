"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";

export function useBrandManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  // GET: Fetch all brands
  const getAllBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "brands/");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return {
    getAllBrands,
    loading,
  };
}
