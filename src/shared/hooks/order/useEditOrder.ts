"use client";

import type React from "react";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import { useOrderManager } from "@/services/useOrderManager";
import type {
  OrderResponseDTO,
  OrderDetailDTO,
  CustomerDTO,
  VehicleDTO,
} from "@/types/OrderResponse";
import { useCreateInvoice } from "./useCreateOrder";
import { formatToLocalDateTime } from "@/shared/utils/formatDate";

export function useEditInvoice(id: string | undefined) {
  const router = useRouter();
  const { getOrderById, updateOrder, cancelOrderById } = useOrderManager();
  const [isLoading, setIsLoading] = useState(true);

  const {
    formData,
    setFormData,
    selectedCustomer,
    handleCustomerChange,
    handleVehicleChangeAt,
    handleServiceChangeAt,
    handleInfoOrderDetailChangeAt,
    addServiceAt,
    removeServiceAt: removeServiceAtInternal,
    currentTotalPrice,
    isNavigating,
    buildEmptyDetail,
  } = useCreateInvoice();

  // Wrapper functions for backward compatibility (edit form works with single vehicle)
  const handleVehicleChange = (vehicle: VehicleDTO) => {
    handleVehicleChangeAt(0)(vehicle);
  };

  const handleServiceChange = (index: number, service: any) => {
    handleServiceChangeAt(0, index, service);
  };

  const handleInfoOrderDetailChange = (field: string, value: any) => {
    handleInfoOrderDetailChangeAt(0)(field, value);
  };

  const addService = (service: any) => {
    addServiceAt(0)(service);
  };

  const removeServiceAt = (index: number) => {
    removeServiceAtInternal(0, index);
  };

  // ============================================================================
  // Load order data khi có id
  // // ============================================================================
  const loadOrderData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const orderData = await getOrderById(id);
      if (orderData.customer.id === undefined  || orderData.customer.id === null || orderData.customer.id === "") {
        handleCustomerChange(null);
      } else {
        handleCustomerChange(orderData.customer as CustomerDTO);
      }
      handleVehicleChange(orderData.orderDetails?.[0]?.vehicle as VehicleDTO);
      if (orderData) setFormData(orderData);
    } catch (error) {
      console.error("Error loading order:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể tải dữ liệu hóa đơn",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, getOrderById, setFormData]);

  useEffect(() => {
    // Nếu không có id thì không load lại
    if (!id) return;
    loadOrderData();
  }, [id, loadOrderData]);

  // Chuẩn hoá dữ liệu thành đúng OrderResponseDTO (không còn field nào có thể undefined)
  const normalizeOrderForUpdate = (
    raw: typeof formData,
    totalPrice: number,
    forceId: string
  ): OrderResponseDTO => {
    // Nếu backend bắt buộc phải có ít nhất 1 orderDetail
    const safeDetails: OrderDetailDTO[] = (
      raw?.orderDetails?.length ? raw.orderDetails : [buildEmptyDetail()]
    ) as OrderDetailDTO[];

    return {
      // ---- các field bắt buộc phải đủ kiểu string/number/enum ----
      id: forceId,
      code: raw?.code ?? "",

      date: formatToLocalDateTime(raw?.date ?? ""),
      checkIn: raw?.checkIn ?? "",
      checkOut: raw?.checkOut ?? "",

      // Nếu là enum, thay string bằng enum thật:
      // paymentType: (raw?.paymentType ?? PaymentType.CASH) as PaymentType,
      // paymentStatus: (raw?.paymentStatus ?? PaymentStatus.PENDING) as PaymentStatus,
      paymentType: (raw?.paymentType ?? "") as any, // <-- tạm thời nếu chưa có enum
      paymentStatus: (raw?.paymentStatus ?? "") as any, // <-- tạm thời nếu chưa có enum

      // số
      totalPrice: Number.isFinite(totalPrice) ? totalPrice : 0,
      vat: typeof raw?.vat === "number" ? raw!.vat : 0,
      tip: typeof raw?.tip === "number" ? raw!.tip : 0,
      discount: typeof raw?.discount === "number" ? raw.discount : 0, // <-- added discount

      // mảng
      orderDetails: safeDetails,

      // các field tuỳ chọn khác vẫn copy nhưng đảm bảo không phá kiểu
      customer: raw?.customer ?? ({} as CustomerDTO),
      note: raw?.note ?? null,

      // nếu có các cờ boolean bắt buộc:
      deleteFlag: Boolean(raw?.deleteFlag),

      // nếu schema có thêm trường khác trong OrderResponseDTO, set tương tự ở đây
    };
  };

  const handleUpdateSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!formData || !id) return;
    try {
      const updatedOrder = normalizeOrderForUpdate(
        formData,
        currentTotalPrice,
        id
      );
      await updateOrder(updatedOrder, id);
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được cập nhật!",
        color: "success",
      });
      router.push("/order/table");
    } catch (error) {
      console.error("Error updating order:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể cập nhật hóa đơn.",
        color: "danger",
      });
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelOrderById(id);
      addToast({
        title: "Thành công",
        description: "Đơn hàng đã được hủy!",
        color: "success",
      });
      router.push("/order/table");
    } catch (error) {
      console.error("Error canceling order:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể hủy đơn hàng.",
        color: "danger",
      });
    }
  };

  const handlePayment = async () => {
    if (!formData || !id) return;
    try {
      const updatedOrder = normalizeOrderForUpdate(
        formData,
        currentTotalPrice,
        id
      );
      await updateOrder(updatedOrder, id);
      router.push(`/order/${id}/payment`);
    } catch (error) {
      console.error("Error updating order:", error);
      addToast({
        title: "Lỗi",
        description: "Không thể cập nhật hóa đơn.",
        color: "danger",
      });
    }
  };

  return {
    isLoading,
    isNavigating,
    formData,
    selectedCustomer,
    currentTotalPrice,
    setFormData,
    handleCustomerChange,
    handleVehicleChange,
    handleServiceChange,
    handleInfoOrderDetailChange,
    addService,
    removeServiceAt,
    buildEmptyDetail,
    handleUpdateSubmit,
    handleCancel,
    handlePayment,
  };
}
