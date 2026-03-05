"use client";

import useApiService from "@/config/useApi";
import { CreateOrderRequest } from "@/types/order/CreateOrderRequest";
import { useCallback } from "react";

export function useCreateOrder() {
  const { callApi, loading, setIsLoading } = useApiService();

  const createOrder = useCallback(
    async (orderData: CreateOrderRequest) => {
      setIsLoading(true);
      try {
        const response = await callApi("post", "orders/", orderData);
        return response?.data;
      } catch (error: any) {
        console.error("Error calling createOrder API:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const getListComboService = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "/combo/");
      return response?.data;
    } catch (error: any) {
      console.error("Error calling getListComboService API:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { createOrder, getListComboService, loading };
}
