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

type MultiVehicleOrder = Omit<OrderResponseDTO, "orderDetails"> & {
  orderDetails: OrderDetailDTO[];  // Changed: now an array, not tuple
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

  const [formData, setFormData] = useState<Partial<MultiVehicleOrder>>({
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
  // HELPERS - Order Detail Access (Multi-Vehicle Support)
  // =========================================================================

  // Get detail at specific index
  const getDetailAt = (index: number): OrderDetailDTO | null =>
    formData.orderDetails?.[index] ?? null;

  // Update detail at specific index
  const onOrderDetailChangeAt = (index: number, nextDetail: OrderDetailDTO) => {
    setFormData((prev) => {
      const details = [...(prev.orderDetails || [])];
      details[index] = nextDetail;
      return { ...prev, orderDetails: details };
    });
  };

  // Add new vehicle detail
  const addVehicle = () => {
    setFormData((prev) => ({
      ...prev,
      orderDetails: [...(prev.orderDetails || []), buildEmptyDetail()],
    }));
  };

  // Remove vehicle at index (can't remove if only 1 left)
  const removeVehicleAt = (index: number) => {
    setFormData((prev) => {
      const details = prev.orderDetails || [];
      if (details.length <= 1) return prev; // Keep at least 1
      return {
        ...prev,
        orderDetails: details.filter((_, i) => i !== index),
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

  const handleVehicleChangeAt = (index: number) => (nextVehicle: VehicleDTO) => {
    setFormData((prev) => {
      const details = [...(prev.orderDetails || [])];
      const detail = details[index];
      if (!detail) return prev;
      details[index] = { ...detail, vehicle: nextVehicle };
      return { ...prev, orderDetails: details };
    });
  };

  // =========================================================================
  // HANDLERS - Service Management (Per Vehicle)
  // =========================================================================

  const handleServiceChangeAt = (vehicleIndex: number, serviceIndex: number, updated: ServiceDTO) => {
    setFormData((prev) => {
      const details = [...(prev.orderDetails || [])];
      const detail = details[vehicleIndex];
      if (!detail) return prev;

      const prevServices = Array.isArray(detail.service) ? detail.service : [];
      if (serviceIndex < 0 || serviceIndex >= prevServices.length) return prev;

      const nextServices = [...prevServices];
      nextServices[serviceIndex] = updated;
      details[vehicleIndex] = { ...detail, service: nextServices };
      return { ...prev, orderDetails: details };
    });
  };

  const addServiceAt = (vehicleIndex: number) => (newService: ServiceDTO) => {
    setFormData((prev) => {
      const details = [...(prev.orderDetails || [])];
      const detail = details[vehicleIndex];
      if (!detail) return prev;

      const nextServices = [...(detail.service ?? []), newService];
      details[vehicleIndex] = { ...detail, service: nextServices };
      return { ...prev, orderDetails: details };
    });
  };

  const removeServiceAt = (vehicleIndex: number, serviceIndex: number) => {
    setFormData((prev) => {
      const details = [...(prev.orderDetails || [])];
      const detail = details[vehicleIndex];
      if (!detail) return prev;

      const prevServices = Array.isArray(detail.service) ? detail.service : [];
      if (serviceIndex < 0 || serviceIndex >= prevServices.length) return prev;

      const nextServices = prevServices.filter((_, i) => i !== serviceIndex);
      details[vehicleIndex] = { ...detail, service: nextServices };
      return { ...prev, orderDetails: details };
    });
  };

  // =========================================================================
  // HANDLERS - Employee/status/note trong orderDetail
  // =========================================================================
  const handleInfoOrderDetailChangeAt = (index: number) => (field: string, value: any) => {
    setFormData((prev) => {
      const details = [...(prev.orderDetails || [])];
      const detail = details[index];
      if (!detail) return prev;
      details[index] = { ...detail, [field]: value };
      return { ...prev, orderDetails: details };
    });
  };

  // =========================================================================
  // HANDLERS - Submit & Navigation
  // =========================================================================

  const validateOrder = (): string | null => {
    // Check each order detail
    for (let i = 0; i < (formData.orderDetails?.length || 0); i++) {
      const detail = formData.orderDetails![i];
      
      // Check if vehicle is selected
      if (!detail.vehicle?.licensePlate) {
        return `Xe #${i + 1}: Vui lòng chọn phương tiện`;
      }

      // Check if at least one service is selected
      if (!detail.service || detail.service.length === 0) {
        return `Xe #${i + 1}: Vui lòng thêm ít nhất một dịch vụ`;
      }

      // Check each service has valid catalog code
      for (let j = 0; j < detail.service.length; j++) {
        const service = detail.service[j];
        if (!service.id || service.id === 0) {
          return `Xe #${i + 1}, Dịch vụ #${j + 1}: Vui lòng chọn dịch vụ`;
        }
        if (!service.serviceCatalog?.code) {
          return `Xe #${i + 1}, Dịch vụ #${j + 1}: Vui lòng chọn kích thước dịch vụ`;
        }
      }
    }

    return null;
  };

  const createNewOrder = async (): Promise<string> => {
    // Validate before submitting
    const validationError = validateOrder();
    if (validationError) {
      addToast({
        title: "Lỗi",
        description: validationError,
        color: "danger",
      });
      throw new Error(validationError);
    }

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
      customer: selectedCustomer ?? formData.customer ?? undefined,
      orderDetails:
        formData.orderDetails?.map((detail) => ({
          ...detail,
          vehicle: detail.vehicle as VehicleDTO,
          service:
            detail.service?.map((s) => ({
              ...s,
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
    isNavigating,
    currentTotalPrice,

    // Detail Helpers (Multi-Vehicle)
    getDetailAt,
    onOrderDetailChangeAt,
    buildEmptyDetail,

    // Multi-Vehicle Management
    addVehicle,
    removeVehicleAt,

    // Customer & Vehicle
    handleCustomerChange,
    handleVehicleChangeAt,

    // Services (Per Vehicle)
    handleServiceChangeAt,
    addServiceAt,
    removeServiceAt,

    // Employee/status/note trong orderDetail
    handleInfoOrderDetailChangeAt,

    // Submit & Navigation
    handleSubmit,
    handleNavigateToPayment,
  };
}
