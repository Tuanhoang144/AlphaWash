"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import type { ServiceItem } from "@/types/Service";

export function useServiceCatalog() {
  const { callApi, loading } = useApiService();

  const getServices = useCallback(
    async (params?: { category?: string; active?: boolean }) => {
      let url = "services";
      const qs: string[] = [];
      if (params?.category) qs.push(`category=${encodeURIComponent(params.category)}`);
      if (params?.active !== undefined) qs.push(`active=${params.active}`);
      if (qs.length) url += `?${qs.join("&")}`;
      const response = await callApi("get", url);
      return (response?.data ?? []) as ServiceItem[];
    },
    [callApi]
  );

  const getCategories = useCallback(async () => {
    const response = await callApi("get", "services/categories");
    return (response?.data ?? []) as string[];
  }, [callApi]);

  const getBonusServices = useCallback(async () => {
    const response = await callApi("get", "services/bonus");
    return (response?.data ?? []) as ServiceItem[];
  }, [callApi]);

  const createService = useCallback(
    async (data: Omit<ServiceItem, "id">) => {
      const response = await callApi("post", "services", data);
      return response?.data as ServiceItem;
    },
    [callApi]
  );

  const updateService = useCallback(
    async (id: string, data: Partial<ServiceItem>) => {
      const response = await callApi("put", `services/${id}`, data);
      return response?.data as ServiceItem;
    },
    [callApi]
  );

  const deleteService = useCallback(
    async (id: string) => {
      await callApi("delete", `services/${id}`);
    },
    [callApi]
  );

  const toggleActive = useCallback(
    async (id: string, active: boolean) => {
      const response = await callApi("put", `services/${id}`, { active });
      return response?.data as ServiceItem;
    },
    [callApi]
  );

  return {
    loading,
    getServices,
    getCategories,
    getBonusServices,
    createService,
    updateService,
    deleteService,
    toggleActive,
  };
}
