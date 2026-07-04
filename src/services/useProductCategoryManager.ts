"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { ProductCategory } from "@/types/Product";

export function useProductCategoryManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAll = useCallback(async (): Promise<ProductCategory[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "product-categories/");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getActive = useCallback(async (): Promise<ProductCategory[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "product-categories/active");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const create = useCallback(async (data: Partial<ProductCategory>): Promise<ProductCategory | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "product-categories/insert", data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const update = useCallback(async (code: string, data: Partial<ProductCategory>): Promise<ProductCategory | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("patch", `product-categories/update/code/${code}`, data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const remove = useCallback(async (code: string): Promise<void> => {
    setIsLoading(true);
    try {
      await callApi("delete", `product-categories/delete/code/${code}`);
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { getAll, getActive, create, update, remove, loading };
}
