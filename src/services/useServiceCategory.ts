"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import type { ServiceCategoryItem, ServiceCategoryRequest } from "@/types/ServiceCategory";

export function useServiceCategory() {
  const { callApi, loading } = useApiService();

  const getAll = useCallback(
    async (activeOnly?: boolean) => {
      const url = activeOnly !== undefined
        ? `service-categories?active=${activeOnly}`
        : "service-categories";
      const response = await callApi("get", url);
      return (response?.data ?? []) as ServiceCategoryItem[];
    },
    [callApi]
  );

  const getById = useCallback(
    async (id: string) => {
      const response = await callApi("get", `service-categories/${id}`);
      return response?.data as ServiceCategoryItem;
    },
    [callApi]
  );

  const create = useCallback(
    async (data: ServiceCategoryRequest) => {
      const response = await callApi("post", "service-categories", data);
      return response?.data as ServiceCategoryItem;
    },
    [callApi]
  );

  const update = useCallback(
    async (id: string, data: Partial<ServiceCategoryRequest>) => {
      const response = await callApi("put", `service-categories/${id}`, data);
      return response?.data as ServiceCategoryItem;
    },
    [callApi]
  );

  const remove = useCallback(
    async (id: string) => {
      await callApi("delete", `service-categories/${id}`);
    },
    [callApi]
  );

  return { loading, getAll, getById, create, update, remove };
}
