"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";

export interface ModelWithoutBrand {
  id: number;
  code: string;
  modelName: string;
  size: string;
}

export interface ModelRequest {
  modelName: string;
  size: string;
  brandId: number;
  code?: string;
  note?: string;
}

export function useModelManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getAllModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "model/");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getModelsByBrandCode = useCallback(
    async (brandCode: string): Promise<ModelWithoutBrand[]> => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "get",
          `model/by-brand?brandCode=${encodeURIComponent(brandCode)}`
        );
        return response?.data ?? [];
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const createModel = useCallback(
    async (data: ModelRequest): Promise<ModelWithoutBrand> => {
      setIsLoading(true);
      try {
        const response = await callApi("post", "model/insert", data);
        return response?.data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateModel = useCallback(
    async (id: number, data: Partial<ModelRequest>): Promise<ModelWithoutBrand> => {
      setIsLoading(true);
      try {
        const response = await callApi("patch", `model/update/${id}`, data);
        return response?.data;
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const deleteModel = useCallback(
    async (id: number): Promise<void> => {
      setIsLoading(true);
      try {
        await callApi("delete", `model/delete/${id}`);
      } catch (error: any) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  return {
    getAllModels,
    getModelsByBrandCode,
    createModel,
    updateModel,
    deleteModel,
    loading,
  };
}
