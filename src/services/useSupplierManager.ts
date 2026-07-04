"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { Supplier } from "@/types/Product";

export function useSupplierManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAll = useCallback(async (): Promise<Supplier[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "suppliers/");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getActive = useCallback(async (): Promise<Supplier[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "suppliers/active");
      return response?.data ?? [];
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const create = useCallback(async (data: Partial<Supplier>): Promise<Supplier | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "suppliers/insert", data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const update = useCallback(async (code: string, data: Partial<Supplier>): Promise<Supplier | null> => {
    setIsLoading(true);
    try {
      const response = await callApi("patch", `suppliers/update/code/${code}`, data);
      return response?.data ?? null;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const remove = useCallback(async (code: string): Promise<void> => {
    setIsLoading(true);
    try {
      await callApi("delete", `suppliers/delete/code/${code}`);
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return { getAll, getActive, create, update, remove, loading };
}
