"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";

export function useServiceManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  // GET: Fetch all services
  const getAllServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "service/");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return {
    getAllServices,
    loading,
  };
}
