"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";

export interface BrandResponse {
  id: number;
  code: string;
  brandName: string;
}

export interface BrandRequest {
  brandName: string;
}

export function useBrandManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAllBrands = useCallback(async (): Promise<BrandResponse[]> => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "brands/");
      return response?.data ?? [];
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const createBrand = useCallback(
    async (data: BrandRequest): Promise<BrandResponse> => {
      setIsLoading(true);
      try {
        const response = await callApi("post", "brands/insert", data);
        return response?.data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateBrand = useCallback(
    async (id: number, data: BrandRequest): Promise<BrandResponse> => {
      setIsLoading(true);
      try {
        const response = await callApi("patch", `brands/update/${id}`, data);
        return response?.data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const deleteBrand = useCallback(
    async (id: number): Promise<void> => {
      setIsLoading(true);
      try {
        await callApi("delete", `brands/delete/${id}`);
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  return {
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    loading,
  };
}
