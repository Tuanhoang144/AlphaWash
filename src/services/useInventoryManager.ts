"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { InventoryTransaction, InventoryDashboard } from "@/types/Inventory";

export function useInventoryManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getTransactions = useCallback(async (): Promise<InventoryTransaction[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "inventory/transactions");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getByProductCode = useCallback(async (productCode: string): Promise<InventoryTransaction[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `inventory/transactions/product/${productCode}`);
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const adjust = useCallback(async (data: {
    productCode: string;
    quantity: number;
    type: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<InventoryTransaction | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "inventory/adjust", data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getDashboard = useCallback(async (): Promise<InventoryDashboard | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "inventory/dashboard");
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { getTransactions, getByProductCode, adjust, getDashboard, loading };
}
