"use client";

import type React from "react";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { usePromotionServices } from "@/shared/services/usePromotionServices";
import { PromotionApiItem } from "@/shared/types/PromotionApiItem";

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
    promotion: null,
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
      promotion: selectedPromotion,
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
  // PROMOTION
  // =========================================================================
  const { getActivePromotionForOrder } = usePromotionServices();

  const customerId = selectedCustomer?.id || formData.customer?.id || "";

  const [promotions, setPromotions] = useState<PromotionApiItem[]>([]);
  const [promoLoading, setPromoLoading] = useState(false);
  const [selectedPromotion, setSelectedPromotion] =
    useState<PromotionApiItem | null>(null);

  const canChoosePromotion = !!customerId;

  const fetchPromotions = useCallback(async () => {
    if (!customerId) {
      setPromotions([]);
      return;
    }
    setPromoLoading(true);
    try {
      const data = await getActivePromotionForOrder(customerId);
      setPromotions(Array.isArray(data) ? data : []);
    } finally {
      setPromoLoading(false);
    }
  }, [customerId, getActivePromotionForOrder]);

  // Khi có customerId thì fetch, khi mất customerId thì clear
  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Khi đổi khách hàng: reset promo đã chọn (tránh áp nhầm)
  useEffect(() => {
    setSelectedPromotion(null);
    // nếu bạn đang lưu discount/promo vào formData thì reset luôn:
    setFormData((prev) => ({ ...prev, discount: 0 }));
  }, [customerId, setFormData]);

  const usablePromotions = useMemo(
    () => promotions.filter((p) => p.usable),
    [promotions]
  );

  // const applyPromotion = useCallback(
  //   (promo: PromotionApiItem | null) => {
  //     if (!customerId) return; //
  //     if (promo && !promo.usable) return;

  //     setSelectedPromotion(promo);

  //     // Nếu bạn muốn lưu promo vào formData để submit backend:
  //     // setFormData(prev => ({...prev, promotionId: promo?.idPromo ?? null }))
  //     // hoặc lưu discount, tuỳ business của bạn:
  //     // setFormData(prev => ({...prev, discount: calcDiscountFromPromo(...) }))
  //   },
  //   [customerId]
  // );

  // CHỈ áp dụng cho BILL_PERCENT
  const applyPromotion = useCallback(
    (promo: PromotionApiItem | null, opts?: { skipUsableCheck?: boolean }) => {
      if (!customerId) return;

      if (!opts?.skipUsableCheck && promo && promo.usable === false) return;
      setSelectedPromotion(promo);

      // CHỈ áp dụng cho BILL_PERCENT
      if (!promo) {
        setFormData((prev) => ({ ...prev, discount: 0, promotionId: null }));
        return;
      }

      if (promo.promoType === "BILL_PERCENT") {
        const percent = promo.value ?? 0;

        setFormData((prev) => ({
          ...prev,
          discount: percent,
          promotionId: promo?.promoId ?? null,
        }));
      } else {
        // promo khác -> không dùng discount
        setFormData((prev) => ({
          ...prev,
          discount: 0,
          promotionId: promo?.promoId ?? null,
        }));
      }
    },
    [customerId, currentTotalPrice, setFormData]
  );

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

    // Promotion
    promotions,
    promoLoading,
    promoError: null,
    refetchPromotions: fetchPromotions,
    selectedPromotion,
    canChoosePromotion,
    usablePromotions,
    applyPromotion,
  };
}
