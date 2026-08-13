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

/**
 * New-system service (từ GET /services) có embedded prices và không có serviceTypeCode.
 * Detect bằng cách kiểm tra có ít nhất 1 embedded price field.
 */
function isNewSystemService(s: ServiceDTO): boolean {
  return (
    s.priceS != null ||
    s.priceM != null ||
    s.priceL != null ||
    s.priceSEDAN != null ||
    s.priceSUV != null ||
    s.priceOverSize != null
  );
}

/** Build synthetic ServiceCatalogDTO[] từ embedded prices của new-system service */
function buildSyntheticCatalogs(s: ServiceDTO): ServiceCatalogDTO[] {
  const entries: { size: string; price?: number }[] = [
    { size: "S",            price: s.priceS },
    { size: "M",            price: s.priceM },
    { size: "L",            price: s.priceL },
    { size: "SEDAN",        price: s.priceSEDAN },
    { size: "SUV",          price: s.priceSUV },
    { size: "SUV Full Size",price: s.priceOverSize },
  ];
  return entries
    .filter((e) => e.price != null && e.price > 0)
    .map((e, i) => ({
      id: -(i + 1),                    // synthetic negative IDs — tránh xung đột với old system
      code: `SYNTHETIC_${e.size.replace(/\s+/g, "_")}`,
      size: e.size,
      listedPrice: e.price!,
    }));
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
        prev.adjustedPriceReason === initialService.adjustedPriceReason &&
        prev.quantity === initialService.quantity;
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

    // New-system service với ID âm → không có catalog entry trong BE, dùng synthetic luôn
    if (service.id < 0) {
      if (isNewSystemService(service)) {
        // Có embedded prices (service mới chọn từ danh sách) → build synthetic từ prices
        setCatalogs(buildSyntheticCatalogs(service));
      } else if (service.serviceCatalog?.listedPrice != null) {
        // Load từ BE khi edit order: converter đã set serviceCatalog.code = "SI_<uuid>",
        // listedPrice và size. Build 1 synthetic catalog từ dữ liệu đó để UI hiển thị giá.
        setCatalogs([{
          id: -1,
          code: service.serviceCatalog.code ?? "",
          size: service.serviceCatalog.size ?? "",
          listedPrice: service.serviceCatalog.listedPrice,
        }]);
      } else {
        setCatalogs([]);
      }
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
        if (!mounted) return;
        if (normalized.length > 0) {
          setCatalogs(normalized);
        } else if (isNewSystemService(service)) {
          // Catalog API trả về rỗng (404 / service chưa có catalog entry):
          // Fallback sang synthetic catalogs từ embedded prices.
          // Các code SYNTHETIC_* sẽ bị mapper filter ra, không gửi lên BE.
          setCatalogs(buildSyntheticCatalogs(service));
        } else {
          setCatalogs([]);
        }
      } catch (e: any) {
        // 404 là expected cho new-system services (chưa có catalog entry trong old system)
        // Dùng warn thay vì error để tránh Next.js dev overlay
        const status = e?.response?.status ?? e?.status;
        if (status !== 404) {
          console.warn("[useServiceManager] Unexpected error loading service catalogs:", e);
        }
        if (!mounted) return;
        if (isNewSystemService(service)) {
          setCatalogs(buildSyntheticCatalogs(service));
        } else {
          setCatalogs([]);
        }
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
    if (!catalogs.length) return;

    // Ưu tiên catalog khớp size xe; fallback sang catalog đầu nếu không match
    // (dùng cho new-system service load từ BE khi edit: chỉ có 1 catalog duy nhất)
    const matched = matchCatalogByVehicleSize(catalogs, vehicleSize) ?? (catalogs.length === 1 ? catalogs[0] : null);
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

  // Chọn dịch vụ (dropdown 1) — nhận object trực tiếp từ picker, không lookup lại bằng id
  const selectService = useCallback(
    (found: ServiceDTO) => {
      setAdjustedPriceTouched(false);
      setPriceValidationError("");
      setService({
        ...found,
        serviceCode: found.serviceCode || (found as any).code,
        serviceCatalog: { id: 0, code: "", size: "", listedPrice: 0 },
        adjustedPriceFlag: false,
        adjustedPrice: 0,
        adjustedPriceReason: "",
        quantity: 1,
      });
    },
    []
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

  const setQuantity = useCallback((qty: number) => {
    const safeQty = Number.isFinite(qty) && qty >= 1 ? Math.floor(qty) : 1;
    setService((prev) => (prev ? { ...prev, quantity: safeQty } : prev));
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
        code: s.serviceCode || (s as any).code,
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
    setQuantity,
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
    quantity: 1,
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
