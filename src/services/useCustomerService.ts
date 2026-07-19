"use client";

import { useCallback, useState } from "react";
import useApiService from "@/config/useApi";
import api from "@/config/axiosInstance";
import type { VehicleDTO } from "@/types/OrderResponse";
import type {
  AddVehiclePayload,
  CreateCustomerPayload,
  CustomerDetail,
  CustomerExportParams,
  CustomerInvoiceRow,
  CustomerListItem,
  CustomerQueryParams,
  PageResponse,
  UpdateCustomerPayload,
  UpdateVehiclePayload,
} from "@/types/Customer";

function toQueryString(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function raiseBadRequest(error: any): never {
  if (error?.response?.status === 400 && error?.response?.data?.message) {
    const customError = new Error(error.response.data.message);
    customError.name = "BadRequest";
    throw customError;
  }
  throw error;
}

const EMPTY_PAGE = <T,>(page: number, size: number): PageResponse<T> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 0,
});

export function useCustomerService() {
  const { callApi, setIsLoading } = useApiService();
  const [loading, setLoading] = useState(false);

  const getCustomers = useCallback(
    async (params: CustomerQueryParams): Promise<PageResponse<CustomerListItem>> => {
      setLoading(true);
      try {
        const response = await callApi("get", `customer/list${toQueryString(params)}`);
        return response?.data ?? EMPTY_PAGE(params.page, params.size);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        return EMPTY_PAGE(params.page, params.size);
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  const getCustomerDetail = useCallback(
    async (id: string): Promise<CustomerDetail | null> => {
      setLoading(true);
      try {
        const response = await callApi("get", `customer/${id}`);
        return response?.data ?? null;
      } catch (error) {
        console.error("Lỗi khi tải chi tiết khách hàng:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  const getCustomerInvoices = useCallback(
    async (id: string, page: number, size = 10): Promise<PageResponse<CustomerInvoiceRow>> => {
      setLoading(true);
      try {
        const response = await callApi(
          "get",
          `customer/${id}/invoices${toQueryString({ page, size })}`
        );
        return response?.data ?? EMPTY_PAGE(page, size);
      } catch (error) {
        console.error("Lỗi khi tải hóa đơn của khách hàng:", error);
        return EMPTY_PAGE(page, size);
      } finally {
        setLoading(false);
      }
    },
    [callApi]
  );

  const createCustomer = useCallback(
    async (data: CreateCustomerPayload): Promise<CustomerDetail | null> => {
      setIsLoading(true);
      try {
        const response = await callApi("post", "customer/insert", data);
        return response?.data ?? null;
      } catch (error: any) {
        console.error("Lỗi khi tạo khách hàng:", error);
        raiseBadRequest(error);
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateCustomer = useCallback(
    async (id: string, data: UpdateCustomerPayload): Promise<CustomerDetail | null> => {
      setIsLoading(true);
      try {
        const response = await callApi("patch", `customer/update/${id}`, data);
        return response?.data ?? null;
      } catch (error: any) {
        console.error("Lỗi khi cập nhật khách hàng:", error);
        raiseBadRequest(error);
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const deleteCustomer = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      try {
        await callApi("delete", `customer/delete/${id}`);
      } catch (error: any) {
        console.error("Lỗi khi xóa khách hàng:", error);
        raiseBadRequest(error);
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const addVehicleToCustomer = useCallback(
    async (customerId: string, data: AddVehiclePayload): Promise<VehicleDTO | null> => {
      setIsLoading(true);
      try {
        const response = await callApi("post", `customer/${customerId}/vehicles`, data);
        return response?.data ?? null;
      } catch (error: any) {
        console.error("Lỗi khi thêm xe cho khách hàng:", error);
        raiseBadRequest(error);
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateVehicle = useCallback(
    async (
      customerId: string,
      vehicleId: string,
      data: UpdateVehiclePayload
    ): Promise<VehicleDTO | null> => {
      setIsLoading(true);
      try {
        const response = await callApi(
          "patch",
          `customer/${customerId}/vehicles/${vehicleId}`,
          data
        );
        return response?.data ?? null;
      } catch (error: any) {
        console.error("Lỗi khi cập nhật xe:", error);
        raiseBadRequest(error);
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const removeVehicle = useCallback(
    async (customerId: string, vehicleId: string): Promise<void> => {
      setIsLoading(true);
      try {
        await callApi("delete", `customer/${customerId}/vehicles/${vehicleId}`);
      } catch (error: any) {
        console.error("Lỗi khi xóa xe:", error);
        raiseBadRequest(error);
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const exportCustomers = useCallback(
    async (params: CustomerExportParams): Promise<Blob> => {
      setLoading(true);
      try {
        const query = toQueryString({ ...params, ids: params.ids?.join(",") });
        const response = await api.get(`customer/export${query}`, {
          responseType: "blob",
        });
        return response.data as Blob;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    getCustomers,
    getCustomerDetail,
    getCustomerInvoices,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    addVehicleToCustomer,
    updateVehicle,
    removeVehicle,
    exportCustomers,
  };
}
