"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import { useOrderManager } from "@/services/useOrderManager";
import type {
  CustomerDTO,
  OrderDetailDTO,
  OrderResponseDTO,
  ServiceDTO,
  VehicleDTO,
} from "@/types/OrderResponse";
import { calculateTotal } from "@/shared/utils/order/calculatePrice";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type SingleOrder = Omit<OrderResponseDTO, "orderDetails"> & {
  orderDetails: [OrderDetailDTO];
};

// ============================================================================
// FACTORY - Create Empty Order Detail
// ============================================================================

const buildEmptyDetail = (patch?: Partial<OrderDetailDTO>): OrderDetailDTO => ({
  service: [
    {
      serviceCode: "",
      serviceName: "",
      serviceTypeCode: "",
      adjustedPriceReason: "",
      adjustedPrice: 0,
      adjustedPriceFlag: false,
      duration: undefined,
      note: undefined,
    } as ServiceDTO,
  ],
  vehicle: {
    id: "",
    licensePlate: "",
    brandId: 0,
    brandCode: "",
    brandName: "",
    modelId: 0,
    modelCode: "",
    modelName: "",
    size: "",
    imageUrl: "",
  },
  employees: [],
  status: "PENDING",
  code: "",
  note: null,
  ...patch,
});

// ============================================================================
// HOOK - useCreateInvoice
// ============================================================================

export function useCreateInvoice() {
  // =========================================================================
  // STATE - Form Data
  // =========================================================================

  const [formData, setFormData] = useState<Partial<SingleOrder>>({
    date: new Date().toISOString().split("T")[0],
    checkIn: new Date().toISOString().split("T")[1].substring(0, 5),
    checkOut: "",
    tip: 0,
    paymentType: "Transfer",
    paymentStatus: "PENDING",
    vat: 0,
    discount: 0,
    deleteFlag: false,
    totalPrice: 0,
    note: null,
    customer: { id: "", name: "", phone: "", vehicles: [] },
    orderDetails: [buildEmptyDetail()],
  });

  // =========================================================================
  // STATE - Selection & Navigation
  // =========================================================================

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(
    null
  );
  const [vehicle, setVehicle] = useState<VehicleDTO | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // =========================================================================
  // SERVICES
  // =========================================================================

  const router = useRouter();
  const { createOrder } = useOrderManager();

  // =========================================================================
  // COMPUTED - Total Price
  // =========================================================================

  const currentTotalPrice = calculateTotal(formData as OrderResponseDTO);

  // =========================================================================
  // HELPERS - Order Detail Access
  // =========================================================================

  // Lấy detail đầu tiên (giả định chỉ có 1 detail)
  const getDetail = (): OrderDetailDTO =>
    formData.orderDetails![0] as OrderDetailDTO;

  // Cập nhật detail đầu tiên
  const onOrderDetailChange = (nextDetail: OrderDetailDTO) => {
    setFormData((prev) => {
      const old = prev.orderDetails![0];
      // Nếu KHÔNG thay đổi gì -> ĐỪNG setState (ngăn vòng lặp)
      if (JSON.stringify(old) === JSON.stringify(nextDetail)) return prev;
      return {
        ...prev,
        orderDetails: [nextDetail],
      };
    });
  };

  // =========================================================================
  // HANDLERS - Customer & Vehicle
  // =========================================================================

  const handleCustomerChange = (customer: CustomerDTO | null) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customer: customer ?? undefined }));
  };

  const handleVehicleChange = (nextVehicle: VehicleDTO) => {
    setVehicle(nextVehicle);
    const prevDetail = getDetail();
    onOrderDetailChange({
      ...prevDetail,
      vehicle: nextVehicle,
    });
  };

  // =========================================================================
  // HANDLERS - Service Management
  // =========================================================================

  const handleServiceChange = (index: number, updated: ServiceDTO) => {
    const prevDetail = getDetail();
    const prevServices = prevDetail.service ?? [];
    if (index < 0 || index >= prevServices.length) return;

    const next = [...prevServices];
    next[index] = updated;
    onOrderDetailChange({ ...prevDetail, service: next });
  };

  const addService = (newService: ServiceDTO) => {
    const prevDetail = getDetail();
    const next = [...(prevDetail.service ?? []), newService];
    onOrderDetailChange({ ...prevDetail, service: next });
  };

  const removeServiceAt = (index: number) => {
    const prevDetail = getDetail();
    const prevServices = prevDetail.service ?? [];
    if (index < 0 || index >= prevServices.length) return;

    const next = prevServices.filter((_, i) => i !== index);
    onOrderDetailChange({ ...prevDetail, service: next });
  };

  // =========================================================================
  // HANDLERS - Employee/status/note trong orderDetail
  // =========================================================================
  const handleInfoOrderDetailChange = (field: string, value: any) => {
    const prevDetail = getDetail();
    console.log("CHANGE", field, value);

    onOrderDetailChange({
      ...prevDetail,
      [field]: value,
    });
  };

  // =========================================================================
  // HANDLERS - Submit & Navigation
  // =========================================================================

  const createNewOrder = async (): Promise<string> => {
    const finalData: OrderResponseDTO = {
      ...formData,
      id: formData.id ?? "",
      code: formData.code ?? "",
      tip: formData.tip ?? 0,
      totalPrice: currentTotalPrice,
      date: formData.date
        ? `${formData.date}T00:00:00`
        : new Date().toISOString(),
      checkIn: formData.checkIn as string,
      checkOut: formData.checkOut as string,
      paymentType: formData.paymentType ?? "Transfer",
      paymentStatus: formData.paymentStatus ?? "PENDING",
      vat: formData.vat ?? 0,
      discount: formData.discount ?? 0,
      note: formData.note ?? null,
      customer: (selectedCustomer ?? formData.customer) as CustomerDTO,
      orderDetails:
        formData.orderDetails?.map((detail) => ({
          ...detail,
          vehicle: (detail.vehicle ?? vehicle) as VehicleDTO,
          service:
            detail.service?.map((s) => ({
              ...s,
              serviceCatalogCode: s.serviceCatalog?.code || "",
              adjustedPrice: s.adjustedPrice || 0,
              adjustedPriceFlag: s.adjustedPriceFlag || false,
              adjustedPriceReason: s.adjustedPriceReason || "",
            })) || [],
          note: detail.note ?? null,
        })) ?? [],
      deleteFlag: formData.deleteFlag ?? false,
    } as OrderResponseDTO;

    try {
      const orderId = await createOrder(finalData);
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được tạo!",
        color: "success",
      });
      return orderId;
    } catch (err) {
      console.error("[useCreateInvoice] Error creating order:", err);
      addToast({
        title: "Lỗi",
        description: "Không thể tạo hóa đơn",
        color: "danger",
      });
      throw err;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsNavigating(true);
    try {
      await createNewOrder();
      router.push("/order/table");
    } catch {
      setIsNavigating(false);
    }
  };

  const handleNavigateToPayment = async () => {
    setIsNavigating(true);
    try {
      const orderId = await createNewOrder();
      if (orderId) router.push(`/order/${orderId}/payment`);
    } catch {
      setIsNavigating(false);
    }
  };

  // =========================================================================
  // RETURN - Public API
  // =========================================================================

  return {
    // Form State
    formData,
    setFormData,
    selectedCustomer,
    vehicle,
    isNavigating,
    currentTotalPrice,

    // Detail Helpers
    getDetail,
    onOrderDetailChange,
    buildEmptyDetail,

    // Customer & Vehicle
    handleCustomerChange,
    handleVehicleChange,

    // Services
    handleServiceChange,
    addService,
    removeServiceAt,

    // Employee/status/note trong orderDetail
    handleInfoOrderDetailChange,

    // Submit & Navigation
    handleSubmit,
    handleNavigateToPayment,
  };
}
