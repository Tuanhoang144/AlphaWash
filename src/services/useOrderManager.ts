"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";

export function useOrderManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  // GET: Fetch all orders
  const getAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "orders/"); 
      return response?.data; 
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return {
    getAllOrders,
    loading,
  };
}
