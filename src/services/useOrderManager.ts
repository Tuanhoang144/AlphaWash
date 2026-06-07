"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";
import { mapFullOrderToRequest } from "@/utils/mapperCreateOrder";
import { mapFullOrderToUpdateRequest } from "@/utils/mapperUpdateOrder";
import { OrderResponseDTO } from "@/types/OrderResponse";

export function useOrderManager() {
  const { callApi, loading, setIsLoading } = useApiService();
  const router = useRouter();

  const getAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await callApi("get", "orders/");
      return response?.data;
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callApi, setIsLoading]);

  const getOrderById = useCallback(
    async (id: string) => {
      if (!id) return null;
      setIsLoading(true);
      try {
        const response = await callApi("get", `orders/${id}`);
        return response?.data;
      } catch (error: any) {
        console.error("Lỗi khi gọi API getOrderById:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const getOrderByCode = useCallback(
    async (code: string) => {
      if (!code) return null;
      setIsLoading(true);
      try {
        const response = await callApi("get", `orders/code/${code}`);
        return response?.data;
      } catch (error: any) {
        console.error("Lỗi khi gọi API getOrderById:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const createOrder = useCallback(
    async (orderData: OrderResponseDTO) => {
      setIsLoading(true);
      try {
        //Map
        const orderRequest = mapFullOrderToRequest(orderData);
        console.log("Order request data:", orderRequest);
        const response = await callApi(
          "post",
          "orders/create-order",
          orderRequest
        );
        return response?.data;
      } catch (error) {
        console.error("Lỗi tạo đơn hàng:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const updateOrder = useCallback(
    async (order: OrderResponseDTO, id: string) => {
      setIsLoading(true);
      try {
        const requestBody = mapFullOrderToUpdateRequest(id, order);
        const response = await callApi("patch", "orders/update", requestBody);
        return response?.data;
      } catch (error) {
        console.error("Lỗi cập nhật đơn hàng:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const bulkUpdatePaymentStatus = useCallback(
    async (orderIds: string[], paymentStatus: string): Promise<number> => {
      setIsLoading(true);
      try {
        const response = await callApi("patch", "orders/bulk-payment", {
          orderIds,
          paymentStatus,
        });
        return response?.data ?? 0;
      } catch (error) {
        console.error("Lỗi cập nhật thanh toán hàng loạt:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  const cancelOrderById = useCallback(
    async (id: string) => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await callApi("patch", `orders/cancel/${id}`);
        return response?.data;
      } catch (error) {
        console.error("Lỗi huỷ đơn hàng:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [callApi, setIsLoading]
  );

  return {
    getAllOrders,
    getOrderById,
    getOrderByCode,
    createOrder,
    updateOrder,
    bulkUpdatePaymentStatus,
    cancelOrderById,
    loading,
  };
}
