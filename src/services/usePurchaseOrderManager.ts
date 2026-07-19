"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/PurchaseOrder";

export function usePurchaseOrderManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAll = useCallback(async (): Promise<PurchaseOrder[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "purchase-orders/");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getByCode = useCallback(async (code: string): Promise<PurchaseOrder | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `purchase-orders/code/${code}`);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const create = useCallback(async (data: {
    supplierCode: string;
    purchaseDate?: string;
    invoiceNumber?: string;
    notes?: string;
    items: Omit<PurchaseOrderItem, "id" | "productName" | "totalCost" | "receivedQuantity">[];
  }): Promise<PurchaseOrder | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "purchase-orders/insert", data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const update = useCallback(async (code: string, data: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("patch", `purchase-orders/update/code/${code}`, data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const receive = useCallback(async (code: string, items: { productCode: string; receivedQuantity: number }[]): Promise<PurchaseOrder | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", `purchase-orders/receive/code/${code}`, { items });
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const cancel = useCallback(async (code: string): Promise<void> => {
    setIsLoading(true);
    try {
      await callApi("post", `purchase-orders/cancel/code/${code}`);
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { getAll, getByCode, create, update, receive, cancel, loading };
}
