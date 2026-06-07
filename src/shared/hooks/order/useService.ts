"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ServiceDTO, ServiceCatalogDTO } from "@/types/OrderResponse";
import { useServiceCatalogManager } from "@/services/userServiceCatalogManager";

/** Map đồng nghĩa kích thước -> chuẩn hoá */
const SIZE_ALIASES: Record<string, string> = {
  s: "S",
  small: "S",
  m: "M",
  medium: "M",
  l: "L",
  large: "L",
  xl: "XL",
  "x-l": "XL",
  "2xl": "2XL",
  xxl: "2XL",
};

function normalizeSize(input?: string) {
  if (!input) return "";
  const key = input.replace(/\s+/g, "").toLowerCase();
  return SIZE_ALIASES[key] ?? input.toUpperCase().trim();
}

/** Tìm catalog khớp kích thước xe */
function matchCatalogByVehicleSize(
  catalogs: ServiceCatalogDTO[],
  vehicleSize?: string
): ServiceCatalogDTO | null {
  const target = normalizeSize(vehicleSize);
  if (!target) return null;
  const exact = catalogs.find((c) => normalizeSize(c.size) === target);
  return exact ?? null;
}

/**
 * Hook trung tâm (theo style useVehicleManager):
 * - Quản lý state service nội bộ
 * - Load danh sách service (mount)
 * - Load catalog theo service.id
 * - Auto-chọn catalog khớp vehicleSize
 * - Quản lý logic ngoại lệ giá + validation
 */
export function useServiceManager(
  initialService: ServiceDTO,
  services: ServiceDTO[],
  loadingServices: boolean,
  vehicleSize?: string
) {
  // ===== STATE CHÍNH =====
  const [service, setService] = useState<ServiceDTO>(initialService);
  const [catalogs, setCatalogs] = useState<ServiceCatalogDTO[]>([]);

  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  const [adjustedPriceTouched, setAdjustedPriceTouched] = useState(false);
  const [priceValidationError, setPriceValidationError] = useState<string>("");

  const { getServiceCatalogByServiceId } = useServiceCatalogManager();

  // ===== ĐỒNG BỘ KHI initialService (từ cha) THAY ĐỔI (edit order, reset, ...) =====
  useEffect(() => {
    setService((prev) => {
      if (prev === initialService) return prev;
      const same =
        prev.id === initialService.id &&
        prev.serviceCatalog?.id === initialService.serviceCatalog?.id &&
        prev.adjustedPrice === initialService.adjustedPrice &&
        prev.adjustedPriceFlag === initialService.adjustedPriceFlag &&
        prev.adjustedPriceReason === initialService.adjustedPriceReason;
      if (same) return prev;
      return initialService;
    });
  }, [initialService]);

  // ===== LOAD CATALOGS KHI service.id ĐỔI =====
  useEffect(() => {
    if (!service?.id) {
      setCatalogs([]);
      return;
    }

    let mounted = true;

    (async () => {
      setLoadingCatalogs(true);
      try {
        const raw = await getServiceCatalogByServiceId(service.id);
        const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const normalized = arr.map((c: any) => ({
          ...c,
          listedPrice: c.listedPrice ?? c.price ?? 0,
        }));
        if (mounted) setCatalogs(normalized);
      } catch (e) {
        console.error("[useServiceManager] Error loading service catalogs:", e);
        if (mounted) setCatalogs([]);
      } finally {
        if (mounted) setLoadingCatalogs(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [service?.id, getServiceCatalogByServiceId]);

  // ===== AUTO-CHỌN CATALOG TRÙNG KÍCH THƯỚC XE =====
  useEffect(() => {
    if (!catalogs.length || !vehicleSize) return;

    const matched = matchCatalogByVehicleSize(catalogs, vehicleSize);
    if (!matched) return;

    setService((prev) => {
      if (!prev) return prev;

      const current = prev.serviceCatalog;
      const currentSize = normalizeSize(current?.size);
      const targetSize = normalizeSize(vehicleSize);

      const hasNoCatalog = !current?.id;
      const hasMismatchedSize =
        currentSize && targetSize && currentSize !== targetSize;
      const hasDifferentCatalog =
        current?.id && matched.id && current.id !== matched.id;

      const shouldAutoSelect =
        hasNoCatalog || hasMismatchedSize || hasDifferentCatalog;

      if (!shouldAutoSelect) return prev;

      return {
        ...prev,
        serviceCatalog: matched,
        ...(prev.adjustedPriceFlag
          ? {}
          : { adjustedPrice: matched.listedPrice ?? 0 }),
      };
    });
  }, [catalogs, vehicleSize]);

  // ===== SYNC adjustedPrice KHI BẬT CỜ NGOẠI LỆ GIÁ =====
  useEffect(() => {
    if (!service.adjustedPriceFlag) return;
    if (!service.serviceCatalog) return;
    if (adjustedPriceTouched) return;

    const lp = service.serviceCatalog.listedPrice ?? 0;

    if (service.adjustedPrice == null) {
      setService((prev) => ({ ...prev, adjustedPrice: lp }));
      return;
    }
    // Nếu đã bằng listedPrice rồi thì thôi, coi như ok
  }, [
    service.adjustedPriceFlag,
    service.serviceCatalog,
    service.adjustedPrice,
    adjustedPriceTouched,
  ]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  // Chọn dịch vụ (dropdown 1)
  const selectService = useCallback(
    (serviceId: number) => {
      const found = services.find((s) => s.id === serviceId);
      if (!found) return;

      setAdjustedPriceTouched(false);
      setPriceValidationError("");

      setService((prev) => ({
        ...prev,
        id: found.id,
        serviceCode: found.serviceCode,
        serviceName: found.serviceName,
        serviceTypeCode: found.serviceTypeCode,
        // reset catalog + giá khi đổi dịch vụ
        serviceCatalog: {
          id: 0,
          code: "",
          size: "",
          listedPrice: 0,
        },
        adjustedPriceFlag: false,
        adjustedPrice: 0,
        adjustedPriceReason: "",
      }));
    },
    [services]
  );

  // Chọn catalog (dropdown 2)
  const selectCatalog = useCallback(
    (catalogId: number) => {
      const found = catalogs.find((c) => c.id === catalogId);
      if (!found) return;

      setService((prev) => ({
        ...prev,
        serviceCatalog: found,
        ...(prev.adjustedPriceFlag
          ? {}
          : { adjustedPrice: found.listedPrice ?? 0 }),
      }));
    },
    [catalogs]
  );

  // Bật / tắt ngoại lệ giá
  const toggleAdjustedPrice = useCallback((enabled: boolean) => {
    setService((prev) => {
      if (!prev) return prev;
      if (enabled) {
        const fallback = prev.serviceCatalog?.listedPrice ?? 0;
        const nextAdjusted = prev.adjustedPrice ?? fallback;

        setAdjustedPriceTouched(false);
        setPriceValidationError("");

        return {
          ...prev,
          adjustedPriceFlag: true,
          adjustedPrice: nextAdjusted,
          adjustedPriceReason: prev.adjustedPriceReason || "",
        };
      }

      // Tắt ngoại lệ -> reset về giá niêm yết & xoá lý do
      setPriceValidationError("");
      return {
        ...prev,
        adjustedPriceFlag: false,
        adjustedPrice: prev.serviceCatalog?.listedPrice ?? 0,
        adjustedPriceReason: "",
      };
    });
  }, []);

  // Đặt giá ngoại lệ (kèm validate lý do)
  const setAdjustedPrice = useCallback((price: number) => {
    setAdjustedPriceTouched(true);

    setService((prev) => {
      if (!prev) return prev;

      const newPrice = Number.isFinite(price) ? price : 0;
      const originalPrice = prev.serviceCatalog?.listedPrice ?? 0;
      const priceChanged = newPrice !== originalPrice;
      const reason = prev.adjustedPriceReason?.trim() ?? "";

      if (priceChanged && !reason) {
        setPriceValidationError(
          "Vui lòng nhập lý do thay đổi giá trước khi cập nhật giá mới"
        );
        return prev;
      }

      setPriceValidationError("");
      return {
        ...prev,
        adjustedPrice: newPrice,
      };
    });
  }, []);

  // Đặt lý do điều chỉnh giá
  const setAdjustedPriceReason = useCallback((reason: string) => {
    const trimmed = reason.trim();

    setService((prev) => {
      if (!prev) return prev;

      const originalPrice = prev.serviceCatalog?.listedPrice ?? 0;
      const currentAdjustedPrice = prev.adjustedPrice ?? 0;
      const priceChanged = currentAdjustedPrice !== originalPrice;

      // Xoá hết lý do trong khi giá đang chênh -> reset giá về niêm yết
      if (!trimmed && priceChanged) {
        setPriceValidationError("");
        return {
          ...prev,
          adjustedPrice: originalPrice,
          adjustedPriceReason: "",
        };
      }

      if (trimmed && priceChanged) {
        setPriceValidationError("");
      }

      return {
        ...prev,
        adjustedPriceReason: reason,
      };
    });
  }, []);

  // =========================================================================
  // DERIVED DATA CHO UI
  // =========================================================================

  const priceDiff = useMemo(() => {
    const listed = service.serviceCatalog?.listedPrice ?? 0;
    const adjusted = service.adjustedPrice ?? listed;
    return adjusted - listed;
  }, [service.serviceCatalog?.listedPrice, service.adjustedPrice]);

  const isPriceChangeValid = useMemo(() => {
    if (!service.adjustedPriceFlag) return true;

    const originalPrice = service.serviceCatalog?.listedPrice ?? 0;
    const currentPrice = service.adjustedPrice ?? 0;
    const priceChanged = currentPrice !== originalPrice;
    const hasReason = !!service.adjustedPriceReason?.trim();

    return !priceChanged || hasReason;
  }, [
    service.adjustedPriceFlag,
    service.serviceCatalog?.listedPrice,
    service.adjustedPrice,
    service.adjustedPriceReason,
  ]);

  const catalogOptions = useMemo(
    () =>
      catalogs.map((c) => ({
        id: c.id,
        label: `Kích thước ${c.size}`,
        value: c.id,
        listedPrice: c.listedPrice ?? 0,
        matchedWithVehicle:
          normalizeSize(c.size) === normalizeSize(vehicleSize),
        raw: c,
      })),
    [catalogs, vehicleSize]
  );

  const serviceOptions = useMemo(
    () =>
      services.map((s) => ({
        id: s.id,
        label: s.serviceName,
        value: s.id,
        code: s.serviceCode,
        duration: (s as any).duration,
        raw: s,
      })),
    [services]
  );

  return {
    // state
    service,
    services,
    catalogs,

    // options cho UI
    serviceOptions,
    catalogOptions,

    // loading
    loadingServices,
    loadingCatalogs,

    // giá
    priceDiff,
    priceValidationError,
    isPriceChangeValid,

    // handlers
    selectService,
    selectCatalog,
    toggleAdjustedPrice,
    setAdjustedPrice,
    setAdjustedPriceReason,
  };
}

/** Factory tiện khởi tạo service rỗng */
export function createNewService(): ServiceDTO {
  return {
    id: 0,
    serviceCode: "",
    serviceName: "",
    serviceTypeCode: "",
    adjustedPrice: 0,
    adjustedPriceFlag: false,
    adjustedPriceReason: "",
    duration: undefined,
    note: undefined,
    serviceCatalog: {
      id: 0,
      code: "",
      size: "",
      listedPrice: 0,
    },
  };
}
