/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import api from "@/config/axiosInstance";
import { addToast } from "@heroui/react";
import { useCallback, useState } from "react";

const useApiService = () => {
  const [loading, setIsLoading] = useState<boolean>(false);

  const callApi = useCallback(
    async (
      method: "get" | "post" | "put" | "delete",
      url: string,
      data?: any
    ) => {
      try {
        setIsLoading(true);
        const response = await api[method](url, data);
        return response.data;
      } catch (e: any) {
		console.error(e);
    addToast(e?.response?.data?.Message || "Error");
		throw e;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { loading, callApi, setIsLoading };
};

export default useApiService;
