"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import useApiService from "@/config/useApi";

export function useProductionManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  // Lấy toàn bộ production
  const getAllProduction = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "production/all");
      return response;
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  // Lấy production theo ID
  const getProductionById = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const response = await callApi("get", `production/${id}`);
      console.log("Production data:", response);
      return response;
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  // Tạo mới một production
  const createProduction = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      const response = await callApi("post", "production/insert", data);
      return response?.data;
    } catch (e: any) {
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  return {
    getAllProduction,
    getProductionById,
    createProduction,
    loading,
  };
}
