"use client";

import { useCallback, useState } from "react";
import useApiService from "@/config/useApi";
import { ServiceUsedDTO } from "@/types/CarUser";

export function useServiceUsedManager() {
  const { callApi } = useApiService();
  const [servicesUsed, setServicesUsed] = useState<ServiceUsedDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // GET ALL
  const getAllServicesUsed = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callApi("get", "/vehicle/services-used");
      setServicesUsed(response?.data || []);
      return response?.data || [];
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  // CREATE
  const addServiceUsed = useCallback(
    async (data: Omit<ServiceUsedDTO, "id">) => {
      const response = await callApi("post", "/vehicle/services-used", data);
      await getAllServicesUsed();
      return response?.data;
    },
    [callApi, getAllServicesUsed]
  );

  // UPDATE
  const updateServiceUsed = useCallback(
    async (id: number, data: Omit<ServiceUsedDTO, "id">) => {
      const response = await callApi("patch", `/vehicle/services-used/${id}`, data);
      await getAllServicesUsed();
      return response?.data;
    },
    [callApi, getAllServicesUsed]
  );

  // DELETE
  const deleteServiceUsed = useCallback(
    async (id: number) => {
      const response = await callApi("delete", `/vehicle/services-used/${id}`);
      await getAllServicesUsed();
      return response?.data;
    },
    [callApi, getAllServicesUsed]
  );

  return {
    servicesUsed,
    getAllServicesUsed,
    addServiceUsed,
    updateServiceUsed,
    deleteServiceUsed,
    loading,
  };
}