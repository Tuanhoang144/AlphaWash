"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ServiceDTO, ServiceCatalogDTO } from "@/types/OrderResponse";
import { useServiceCatalogManager } from "@/services/userServiceCatalogManager";
import { useServiceManager as useServiceManagerService } from "@/services/useServiceManager";

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
  if (exact) return exact;
  return null;
}

// Guard nông để tránh setState khi không đổi
function shallowEqualService(a: ServiceDTO, b: ServiceDTO) {
  return (
    a.id === b.id &&
    a.adjustedPriceFlag === b.adjustedPriceFlag &&
    a.adjustedPrice === b.adjustedPrice &&
    a.adjustedPriceReason === b.adjustedPriceReason &&
    a.serviceCatalog?.id === b.serviceCatalog?.id
  );
}

/**
 * Hook trung tâm:
 * - Load danh sách dịch vụ (mount)
 * - Load catalog theo service.id
 * - Auto-chọn catalog khớp vehicleSize
 * - Expose appliedPrice / priceDiff & các handlers
 *
 * - Added price validation tracking and optimization to prevent double API calls
 */
export function useServiceManager(
  service: ServiceDTO,
  onServiceChange: (service: ServiceDTO) => void,
  vehicleSize?: string
) {
  // ===== State & API =====
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [catalogs, setCatalogs] = useState<ServiceCatalogDTO[]>([]);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [adjustedPriceTouched, setAdjustedPriceTouched] = useState(false);
  const [priceValidationError, setPriceValidationError] = useState<string>("");

  const { getServiceCatalogByServiceId } = useServiceCatalogManager();
  const { getAllServices } = useServiceManagerService();

  // Ref để đánh dấu đã auto-apply cho cặp (service.id|vehicleSize)
  const autoAppliedKeyRef = useRef<string | null>(null);

  // ===== Load tất cả services khi mount =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingServices(true);
      try {
        const data = await getAllServices();
        if (mounted) setServices(data);
      } catch (e) {
        console.error("Error loading services:", e);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // Thêm getAllServices vào deps
  }, [getAllServices]);

  // ===== Load catalogs khi service.id đổi =====
  useEffect(() => {
    if (!service?.id) {
      setCatalogs([]);
      return;
    }

    let mounted = true;
    const serviceId = service.id;
    (async () => {
      setLoadingCatalogs(true);
      try {
        const raw = await getServiceCatalogByServiceId(serviceId);
        const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const normalized = arr.map((c: any) => ({
          ...c,
          listedPrice: c.listedPrice ?? c.price ?? 0,
        }));
        if (mounted) setCatalogs(normalized);
      } catch (e) {
        console.error("Error loading service catalogs:", e);
        if (mounted) setCatalogs([]);
      } finally {
        if (mounted) setLoadingCatalogs(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // thêm getServiceCatalogByServiceId vào deps
  }, [service?.id, getServiceCatalogByServiceId]);

  // updateService có guard: không gọi onServiceChange nếu không đổi
  const updateService = useCallback(
    (updated: ServiceDTO) => {
      if (shallowEqualService(service, updated)) return;
      onServiceChange(updated);
    },
    [onServiceChange, service]
  );

  // ===== Auto-chọn catalog khớp vehicleSize =====
  useEffect(() => {
    if (!catalogs.length) return;
    const matched = matchCatalogByVehicleSize(catalogs, vehicleSize);
    if (!matched) return;

    const current = service?.serviceCatalog;
    const currentSize = normalizeSize(current?.size);
    const targetSize = normalizeSize(vehicleSize);

    const hasNoCatalogSelected = !current?.id;
    const hasMismatchedSize =
      targetSize && currentSize && currentSize !== targetSize;
    const shouldAutoSelect = hasNoCatalogSelected || hasMismatchedSize;

    // khóa theo cặp (service.id|size) để chỉ auto 1 lần
    const key = `${service?.id ?? "0"}|${targetSize || "-"}`;
    if (autoAppliedKeyRef.current === key) return;

    if (shouldAutoSelect && matched.id !== current?.id) {
      autoAppliedKeyRef.current = key;
      updateService({
        ...service,
        serviceCatalog: matched,
        ...(service.adjustedPriceFlag
          ? {}
          : { adjustedPrice: matched?.listedPrice ?? 0 }),
      });
    }
    // thêm service, updateService vào deps
  }, [catalogs, vehicleSize, service, updateService]);

  // ===== Khi listedPrice đổi & đang bật ngoại lệ mà chưa sửa tay -> sync adjustedPrice
  useEffect(() => {
    if (!service.adjustedPriceFlag) return;
    if (!service.serviceCatalog) return;
    if (adjustedPriceTouched) return;

    const lp = service.serviceCatalog.listedPrice ?? 0;

    // nếu adjustedPrice đã bằng listedPrice -> không update nữa (tránh vòng lặp)
    if (service.adjustedPrice == null) {
      updateService({ ...service, adjustedPrice: lp });
      return;
    }
    if (service.adjustedPrice === lp) return;

    // Nếu khác thì thôi, người dùng đã sửa tay
  }, [service, adjustedPriceTouched, updateService]);

  // ===== Handlers cập nhật =====
  // Handler bật/tắt ngoại lệ giá
  const toggleAdjustedPrice = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        const fallback = service.serviceCatalog?.listedPrice ?? 0;
        const nextAdjusted = service.adjustedPrice ?? fallback;

        setAdjustedPriceTouched(false);
        setPriceValidationError("");
        updateService({
          ...service,
          adjustedPriceFlag: true,
          adjustedPrice: nextAdjusted,
          adjustedPriceReason: service.adjustedPriceReason || "",
        });
      } else {
        updateService({
          ...service,
          adjustedPriceFlag: false,
          adjustedPrice: service.serviceCatalog?.listedPrice ?? 0,
          adjustedPriceReason: "",
        });
        setPriceValidationError("");
      }
    },
    [service, updateService]
  );

  // Handler cập nhật giá với validation lý do
  const setAdjustedPrice = useCallback(
    (price: number) => {
      // Đánh dấu người dùng đã tương tác với giá
      setAdjustedPriceTouched(true);
      const newPrice = Number.isFinite(price) ? price : 0;

      const originalPrice = service.serviceCatalog?.listedPrice ?? 0;
      const priceChanged = newPrice !== originalPrice;
      const reason = service.adjustedPriceReason?.trim() ?? "";

      // Nếu giá có thay đổi nhưng chưa nhập lý do → hiển thị lỗi & KHÔNG cập nhật giá
      if (priceChanged && !reason) {
        setPriceValidationError(
          "Vui lòng nhập lý do thay đổi giá trước khi cập nhật giá mới"
        );
        return; // Dừng lại, không gọi updateService
      }

      // Nếu có lý do hoặc không thay đổi giá → reset lỗi và cập nhật
      setPriceValidationError("");
      updateService({
        ...service,
        adjustedPrice: newPrice,
      });
    },
    [service, updateService]
  );

  // Handler cập nhật lý do với logic reset giá nếu cần
  const setAdjustedPriceReason = useCallback(
    (reason: string) => {
      const trimmed = reason.trim();
      const originalPrice = service.serviceCatalog?.listedPrice ?? 0;
      const currentAdjustedPrice = service.adjustedPrice ?? 0;
      const priceChanged = currentAdjustedPrice !== originalPrice;

      // Nếu người dùng xóa hết lý do mà đang có giá thay đổi → reset về giá niêm yết
      if (!trimmed && priceChanged) {
        setPriceValidationError("");
        updateService({
          ...service,
          adjustedPrice: originalPrice,
          adjustedPriceReason: "",
        });
        return;
      }

      // Nếu có lý do, xoá lỗi và giữ giá người dùng nhập
      if (trimmed && priceChanged) {
        setPriceValidationError("");
      }

      // Nếu không có thay đổi giá thì chỉ update lý do
      updateService({
        ...service,
        adjustedPriceReason: reason,
      });
    },
    [service, updateService]
  );

  // ===== Derived (tính sẵn cho UI) =====
  const priceDiff = useMemo(() => {
    const listed = service.serviceCatalog?.listedPrice ?? 0;
    const adjusted = service.adjustedPrice ?? 0;
    return adjusted - listed;
  }, [service.adjustedPrice, service.serviceCatalog?.listedPrice]);

  const isPriceChangeValid = useMemo(() => {
    if (!service.adjustedPriceFlag) return true;

    const originalPrice = service.serviceCatalog?.listedPrice ?? 0;
    const currentPrice = service.adjustedPrice ?? 0;
    const priceChanged = currentPrice !== originalPrice;
    const hasReason = !!service.adjustedPriceReason?.trim();

    return !priceChanged || hasReason;
  }, [
    service.adjustedPrice,
    service.adjustedPriceFlag,
    service.adjustedPriceReason,
    service.serviceCatalog?.listedPrice,
  ]);

  // ===== Options cho Select =====
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
        duration: (s as any).duration,
        raw: s,
      })),
    [services]
  );

  return {
    // data
    services,
    catalogs,
    serviceOptions,
    catalogOptions,

    // loading
    loadingServices,
    loadingCatalogs,

    // giá tính sẵn
    priceDiff,

    priceValidationError,
    isPriceChangeValid,

    // handlers
    updateService,
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
    serviceCatalog: {
      id: 0,
      code: "",
      size: "",
      listedPrice: 0,
    },
  };
}
