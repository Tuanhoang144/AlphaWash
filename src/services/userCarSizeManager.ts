"use client";

import { useState, useCallback } from "react";
import { CarSize, CreateCarSizeRequest } from "@/types/CarSize";
import useApiService from "@/config/useApi";

export function useCarSizeManager() {
  const [carSizes, setCarSizes] = useState<CarSize[]>([]);

  const { callApi, loading, setIsLoading } = useApiService();
  const getAllCarSizes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await callApi("get", `vehicles/size`);
      setCarSizes(res.data);
      return res.data;
    } catch (error) {
      console.error(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCarSize = async (created: Omit<CreateCarSizeRequest, "brandCode" | "brandName" | "modelName" | "size" | "note">) => {
    setIsLoading(true);
    try {
      const res = await callApi("post", `vehicles/size/create`, created);
      setCarSizes(prev => [...prev, res]);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCarSize = async ( updated: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">) => {
    setIsLoading(true);
  try {
    const res = await callApi("post", `vehicles/size/update`, updated);

    setCarSizes(prev =>
      prev.map(c => (c.id === res.id ? { ...c, ...res } : c))
    );
    return res;
  } finally {
    setIsLoading(false);
  }
  };

  const deleteCarSize = async (id: number) => {
    setCarSizes(prev => prev.filter(c => c.id !== id));
  };

  return {
    carSizes,
    loading,
    getAllCarSizes,
    createCarSize,
    updateCarSize,
    deleteCarSize,
  };
}