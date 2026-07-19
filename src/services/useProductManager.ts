"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { Product } from "@/types/Product";

export function useProductManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAll = useCallback(async (): Promise<Product[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "products/");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getActive = useCallback(async (): Promise<Product[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "products/active");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getByCode = useCallback(async (code: string): Promise<Product | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `products/code/${code}`);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `products/barcode/${barcode}`);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getByCategoryCode = useCallback(async (categoryCode: string): Promise<Product[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `products/category/${categoryCode}`);
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const create = useCallback(async (data: Partial<Product>): Promise<Product | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "products/insert", data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const update = useCallback(async (code: string, data: Partial<Product>): Promise<Product | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("patch", `products/update/code/${code}`, data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const remove = useCallback(async (code: string): Promise<void> => {
    setIsLoading(true);
    try {
      await callApi("delete", `products/delete/code/${code}`);
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { getAll, getActive, getByCode, getByBarcode, getByCategoryCode, create, update, remove, loading };
}
