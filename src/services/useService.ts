"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";

export function useService() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  // GET: Fetch all brands
  const getAllService = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "/service/search");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getAllServiceType = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "service-type/");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);
  return {
    getAllService,
    getAllServiceType,
    loading,
  };
}
