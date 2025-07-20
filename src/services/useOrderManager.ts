"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import useApiService from "@/config/useApi";
import { mapFullOrderToRequest } from "@/utils/mapperCreateOrder";
import { OrderDTO } from "@/app/(admin)/order/create/types/invoice";
import { mapFullOrderToUpdateRequest } from "@/utils/mapperUpdateOrder";

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

  const createOrder = useCallback(
    async (orderData: OrderDTO) => {
      setIsLoading(true);
      try {
        //Map
        const orderRequest = mapFullOrderToRequest(orderData);
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
    async (order: OrderDTO, id : string) => {
      setIsLoading(true);
      try {
        const requestBody = mapFullOrderToUpdateRequest(id, order);
        const response = await callApi("post", "orders/update", requestBody);
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

  return {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    loading,
  };
}
