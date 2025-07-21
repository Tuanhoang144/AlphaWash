"use client";

import { useCallback } from "react";
import useApiService from "@/config/useApi";
import { CustomerDTO } from "@/types/OrderResponse";

export function useCustomerManager() {
  const { callApi, loading, setIsLoading } = useApiService();

  const getCustomersByPhone = useCallback(
    async (phone: string): Promise<CustomerDTO[]> => {
      if (!phone.trim()) return [];

      setIsLoading(true);
      try {
        const response = await callApi(
          "get",
          `customer/by-phone-with-vehicles?phone=${encodeURIComponent(phone)}`
        );

        const customer = response?.data;
        return customer ? [customer] : [];
      } catch (error: any) {
        console.error("Lỗi khi tìm khách hàng theo SĐT:", error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const createCustomer = useCallback(
    async (payload: any): Promise<CustomerDTO | null> => {
      setIsLoading(true);
      try {
        const response = await callApi("post", "customer/insert", payload);
        return response?.data ?? null;
      } catch (error) {
        console.error("Lỗi khi tạo khách hàng:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateCustomer = useCallback(
    async (id: string, payload: { customerName: string; phone: string; note?: string }) => {
      setIsLoading(true);
      try {
        const response = await callApi("patch", `customer/update/${id}`, payload);
        return response?.data;
      } catch (error: any) {
        console.error("Lỗi khi cập nhật khách hàng:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );
  return {
    getCustomersByPhone,
    createCustomer,
    updateCustomer,
    loading,
  };
}
