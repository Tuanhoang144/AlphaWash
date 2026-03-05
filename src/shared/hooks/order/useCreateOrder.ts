"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";
import { useOrderManager } from "@/services/useOrderManager";
import type {
  CustomerDTO,
  EmployeeDTO,
  OrderDetailDTO,
  OrderResponseDTO,
  ServiceDTO,
  VehicleDTO,
} from "@/types/OrderResponse";
import { calculateTotal } from "@/shared/utils/order/calculatePrice";
import { usePromotionServices } from "@/shared/services/usePromotionServices";
import type { PromotionApiItem } from "@/shared/types/PromotionApiItem";

// =====================
// MODE
// =====================
export type CreateOrderMode = "SERVICE" | "COMBO";

// =====================
// FACTORY - empty detail
// =====================

export const buildEmptyDetail = (
  patch?: Partial<OrderDetailDTO>
): OrderDetailDTO => ({
  service: [
    {
      serviceCode: "",
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
  orderType: "",
  employees: [],
  status: "PENDING",
  code: "",
  note: "",
  ...patch,
});

type SingleOrder = Omit<OrderResponseDTO, "orderDetails"> & {
  orderDetails: [OrderDetailDTO];
};

// =====================
// Helpers parse backend -> UI inputs
// =====================
const toDateInput = (iso?: string | null) => {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return String(iso).slice(0, 10);
};

const toTimeInput = (t?: string | null) => {
  if (!t) return "";
  const s = String(t);
  return s.length >= 5 ? s.slice(0, 5) : s;
};

// =====================
// Combo helpers (single source of truth)
// =====================
const getComboItem = (detail?: OrderDetailDTO) =>
  (detail?.service?.[0] as any) ?? null;

const buildEmptyComboItem = (): any => ({
  serviceCatalog: null,
  serviceComboCatalog: null,
  adjustedPrice: 0,
  adjustedPriceFlag: false,
  adjustedPriceReason: "",
});

export function useCreateInvoice() {
  const router = useRouter();
  const { createOrder } = useOrderManager();
  const [mode, setMode] = useState<CreateOrderMode>("SERVICE");
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
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDTO | null>(
    null
  );
  const [vehicle, setVehicle] = useState<VehicleDTO | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const getDetail = (): OrderDetailDTO =>
    (formData.orderDetails?.[0] as OrderDetailDTO) ?? buildEmptyDetail();

  const setDetail = useCallback(
    (updater: (prev: OrderDetailDTO) => OrderDetailDTO) => {
      setFormData((prev) => {
        const prevDetail =
          (prev.orderDetails?.[0] as OrderDetailDTO) ?? buildEmptyDetail();
        const nextDetail = updater(prevDetail);
        return { ...prev, orderDetails: [nextDetail] as any };
      });
    },
    []
  );

  useEffect(() => {
    console.log("[LOOP DETECT] formData changed", new Date().getTime());
  }, [formData]);

  useEffect(() => {
    setDetail((d) => {
      if (mode === "COMBO") {
        return {
          ...d,
          orderType: "COMBO",
          service: [],
        };
      }
      return { ...d, orderType: "SERVICE", service: [] };
    });
  }, [mode]);

  // =====================
  // Total Price
  // =====================
  const currentTotalPrice = useMemo(() => {
    if (mode === "COMBO") {
      const d = getDetail();
      const combo = getComboItem(d);
      return (
        combo?.adjustedPrice ??
        combo?.serviceComboCatalog?.price ??
        formData.totalPrice ??
        0
      );
    }
    return calculateTotal(formData as OrderResponseDTO);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, formData]);

  // =====================
  // Handlers: Customer, Vehicle, Employees, Status, Note
  // =====================
  const handleCustomerChange = (customer: CustomerDTO | null) => {
    setSelectedCustomer(customer);
    setFormData((prev) => ({ ...prev, customer: customer ?? undefined }));
  };

  const handleVehicleChange = (nextVehicle: VehicleDTO) => {
    setVehicle(nextVehicle);
    setDetail((d) => ({ ...d, vehicle: nextVehicle }));
  };

  const handleEmployeeChange = (employees: EmployeeDTO[]) => {
    setDetail((d) => ({ ...d, employees }));
  };

  const handleStatusChange = (status: string) => {
    setDetail((d) => {
      // Xử lý undefined/null thành ""
      const currentStatus = d.status ?? "";
      if (currentStatus === status) return d;
      return { ...d, status };
    });
  };
  const handleNoteChange = (note: string) => {
    setDetail((d) => {
      if (d.note === note) return d;
      return { ...d, note };
    });
  };

  // =====================
  // Services handlers (dùng cho cả SERVICE + COMBO)
  // - SERVICE: list nhiều phần tử
  // - COMBO: chỉ dùng index 0 (service[0])
  // =====================
  const ensureComboShape = (d: OrderDetailDTO) => {
    const s0: any = d.service?.[0];
    if (s0?.serviceComboCatalog || s0) return d;
    return { ...d, service: [buildEmptyComboItem()] };
  };

  const handleServiceChange = (index: number, updated: ServiceDTO) => {
    if (mode === "COMBO") {
      if (index !== 0) return;
      setDetail((d) => {
        const normalized = ensureComboShape({ ...d, orderType: "COMBO" });
        const next = [...(normalized.service ?? [])];
        next[0] = {
          ...buildEmptyComboItem(),
          ...(next[0] as any),
          ...(updated as any),
          serviceCatalog: null, // combo không dùng serviceCatalog
          serviceComboCatalog:
            (updated as any).serviceComboCatalog ??
            (next[0] as any).serviceComboCatalog,
        };
        return { ...normalized, service: next } as any;
      });
      return;
    }

    // SERVICE
    setDetail((d) => {
      const prevServices = d.service ?? [];
      if (index < 0 || index >= prevServices.length) return d;
      const next = [...prevServices];
      next[index] = updated;
      return { ...d, orderType: "SERVICE", service: next };
    });
  };

  const addService = (newService: ServiceDTO) => {
    if (mode === "COMBO") {
      // COMBO: replace service[0]
      setDetail(
        (d) =>
          ({
            ...d,
            orderType: "COMBO",
            service: [
              {
                ...(newService as any),
                serviceCatalog: null,
                serviceComboCatalog:
                  (newService as any).serviceComboCatalog ?? null,
              },
            ],
          } as any)
      );
      return;
    }

    setDetail((prevDetail) => {
      const prevServices = prevDetail.service ?? [];
      // Tránh tạo array mới nếu không cần
      if (prevServices.includes(newService)) return prevDetail; // optional

      const nextServices = [...prevServices, newService];

      // Chỉ thay đổi service, giữ nguyên các field khác
      if (prevDetail.service === nextServices) return prevDetail; // hiếm xảy ra

      return {
        ...prevDetail,
        service: nextServices,
      };
    });
  };

  const removeServiceAt = (index: number) => {
    if (mode === "COMBO") {
      if (index !== 0) return;
      setDetail((d) => ({ ...d, orderType: "COMBO", service: [] } as any));
      return;
    }

    // SERVICE
    setDetail((d) => {
      const prevServices = d.service ?? [];
      if (index < 0 || index >= prevServices.length) return d;
      return {
        ...d,
        orderType: "SERVICE",
        service: prevServices.filter((_, i) => i !== index),
      };
    });
  };

  // =====================
  // Promotion
  // =====================
  const { getActivePromotionForOrder } = usePromotionServices();

  const customerId =
    selectedCustomer?.id || (formData.customer as any)?.id || "";
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

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  useEffect(() => {
    setSelectedPromotion(null);
    setFormData((prev) => ({ ...prev, discount: 0, promotionId: null as any }));
  }, [customerId]);

  const usablePromotions = useMemo(
    () => promotions.filter((p) => p.usable),
    [promotions]
  );

  const applyPromotion = useCallback(
    (promo: PromotionApiItem | null, opts?: { skipUsableCheck?: boolean }) => {
      if (!customerId) return;

      if (!opts?.skipUsableCheck && promo && promo.usable === false) return;
      setSelectedPromotion(promo);

      if (!promo) {
        setFormData((prev) => ({
          ...prev,
          discount: 0,
          promotionId: null as any,
        }));
        return;
      }

      if (promo.promoType === "BILL_PERCENT") {
        setFormData((prev) => ({
          ...prev,
          discount: promo.value ?? 0,
          promotionId: promo.promoId ?? null,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          discount: 0,
          promotionId: promo.promoId ?? null,
        }));
      }
    },
    [customerId]
  );

  // =====================
  // Hydrate order từ backend -> UI (dùng cho edit)
  // =====================
  const hydrateFromOrder = useCallback((order: OrderResponseDTO) => {
    const detail = (order.orderDetails?.[0] ??
      buildEmptyDetail()) as OrderDetailDTO;
    const orderType: CreateOrderMode =
      detail.orderType === "COMBO" ? "COMBO" : "SERVICE";

    setMode(orderType);
    setSelectedCustomer((order.customer ?? null) as any);
    setVehicle((detail.vehicle ?? null) as any);

    setFormData({
      ...(order as any),
      date: toDateInput(order.date),
      checkIn: toTimeInput(order.checkIn),
      checkOut: toTimeInput(order.checkOut as any),
      orderDetails: [{ ...(detail as any), orderType }],
    });
  }, []);

  // =====================
  // BUILD PAYLOAD (create/update)
  // =====================
  const buildFinalData = useCallback((): OrderResponseDTO => {
    const detail = getDetail();

    const base: OrderResponseDTO = {
      ...(formData as OrderResponseDTO),
      id: (formData as any).id ?? "",
      code: (formData as any).code ?? "",
      tip: (formData as any).tip ?? 0,
      totalPrice: currentTotalPrice,
      date: (formData as any).date
        ? `${(formData as any).date}T00:00:00`
        : new Date().toISOString(),
      checkIn: (formData as any).checkIn as string,
      checkOut: (formData as any).checkOut as string,
      paymentType: (formData as any).paymentType ?? "Transfer",
      paymentStatus: (formData as any).paymentStatus ?? "PENDING",
      vat: (formData as any).vat ?? 0,
      discount: (formData as any).discount ?? 0,
      note: (formData as any).note ?? null,
      customer: (selectedCustomer ?? (formData as any).customer) as CustomerDTO,
      deleteFlag: (formData as any).deleteFlag ?? false,
      promotion: selectedPromotion,
      orderDetails: [],
    } as OrderResponseDTO;

    if (mode === "COMBO") {
      if (!base.customer?.id)
        throw new Error("Mua combo yêu cầu chọn khách hàng");

      const combo = getComboItem(detail);
      const comboCode = combo?.serviceComboCatalog?.catalogCode;

      if (!comboCode) throw new Error("Vui lòng chọn combo để mua");

      base.orderDetails = [
        {
          ...detail,
          orderType: "COMBO",
          vehicle: (detail.vehicle ?? vehicle) as VehicleDTO,
          service: [
            {
              serviceComboCatalog: { catalogCode: comboCode } as any,
              serviceCatalog: null as any,
              adjustedPrice: combo?.adjustedPrice ?? 0,
              adjustedPriceFlag: !!combo?.adjustedPriceFlag,
              adjustedPriceReason: combo?.adjustedPriceReason ?? "",
            } as any,
          ],
        } as any,
      ];

      return base;
    }

    // SERVICE
    base.orderDetails = [
      {
        ...detail,
        orderType: "SERVICE",
        vehicle: (detail.vehicle ?? vehicle) as VehicleDTO,
        service:
          detail.service?.map((s) => ({
            ...s,
            serviceCatalog: (s as any).serviceCatalog ?? null,
            adjustedPrice: (s as any).adjustedPrice ?? 0,
            adjustedPriceFlag: !!(s as any).adjustedPriceFlag,
            adjustedPriceReason: (s as any).adjustedPriceReason ?? "",
            serviceComboCatalog: null, // chặn combo
          })) || [],
      } as any,
    ];

    return base;
  }, [
    currentTotalPrice,
    formData,
    mode,
    selectedCustomer,
    selectedPromotion,
    vehicle,
  ]);

  // =====================
  // Create
  // =====================
  const createNewOrder = async (): Promise<string> => {
    const finalData = buildFinalData();
    return await createOrder(finalData);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsNavigating(true);
    try {
      await createNewOrder();
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được tạo!",
        color: "success",
      });
      router.push("/order/table");
    } catch (err: any) {
      console.error(err);
      addToast({
        title: "Lỗi",
        description: err?.message || "Không thể tạo hóa đơn",
        color: "danger",
      });
      setIsNavigating(false);
    }
  };

  const handleNavigateToPayment = async () => {
    setIsNavigating(true);
    try {
      const orderId = await createNewOrder();
      addToast({
        title: "Thành công",
        description: "Hóa đơn đã được tạo!",
        color: "success",
      });

      router.push(
        mode === "COMBO"
          ? `/order/${orderId}/paymentCombo`
          : `/order/${orderId}/payment`
      );
    } catch (err: any) {
      console.error(err);
      addToast({
        title: "Lỗi",
        description: err?.message || "Không thể tạo hóa đơn",
        color: "danger",
      });
      setIsNavigating(false);
    }
  };

  return {
    mode,
    setMode,

    formData,
    setFormData,
    selectedCustomer,
    vehicle,
    isNavigating,
    currentTotalPrice,

    hydrateFromOrder,
    buildFinalData,

    getDetail,
    buildEmptyDetail,

    handleCustomerChange,
    handleVehicleChange,

    handleServiceChange,
    addService,
    removeServiceAt,

    handleStatusChange,
    handleEmployeeChange,
    handleNoteChange,

    handleSubmit,
    handleNavigateToPayment,

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
