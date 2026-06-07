"use client";

import { useCallback, useState } from "react";
import useApiService from "@/config/useApi";
import {
  ServiceAll,
  ServiceFormData,
  ServiceUpdateFormData,
} from "@/types/ServiceAll";

export function useServiceManager() {
  const { callApi } = useApiService();
  const [services, setServices] = useState<ServiceAll[]>([]);
  const [loading, setLoading] = useState(false);

  // GET ALL SERVICES HAVE CATALOGS
  const getAllService = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callApi("get", "/service/search");
      setServices(response?.data || []);
      return response?.data || [];
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  // GET ALL SERVICE TYPES
  const getAllServiceType = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callApi("get", "/service-type/");
      return response?.data || [];
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  // GET ALL SERVICE CODES (for dropdown)
  const getAllServiceCode = useCallback(async () => {
    setLoading(true);
    try {
      const response = await callApi("get", "/service/");
      return response?.data || [];
    } finally {
      setLoading(false);
    }
  }, [callApi]);

  // CREATE SERVICE
  const createService = useCallback(
    async (data: ServiceFormData) => {
      setLoading(true);
      try {
        const response = await callApi("post", "/service/create", data);
        await getAllService(); // refresh list
        return response?.data;
      } finally {
        setLoading(false);
      }
    },
    [callApi, getAllService]
  );

  // UPDATE SERVICE
  const updateService = useCallback(
    async (data: ServiceUpdateFormData) => {
      setLoading(true);
      try {
        const response = await callApi("post", "/service/update", data);
        await getAllService(); // refresh list
        return response?.data;
      } finally {
        setLoading(false);
      }
    },
    [callApi, getAllService]
  );

  // DELETE SERVICE
  const deleteService = useCallback(
    async (serviceCode: string) => {
      setLoading(true);
      try {
        const response = await callApi(
          "delete",
          `/service/delete/${serviceCode}`
        );
        await getAllService();
        return response?.data;
      } finally {
        setLoading(false);
      }
    },
    [callApi, getAllService]
  );

  return {
    services,
    loading,
    getAllService,
    getAllServiceType,
    getAllServiceCode,
    createService,
    updateService,
    deleteService,
  };
}
