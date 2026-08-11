"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ServiceDTO } from "@/types/OrderResponse";
import type { ServiceItem } from "@/types/Service";
import { useServiceManager as useServiceManagerService } from "@/services/useServiceAll";
import { useServiceCatalog } from "@/services/useServiceCatalog";

// 🔥 Hàm tự động lấy số từ STxxxx
function extractTypeOrder(code: string | null | undefined) {
  if (!code) return 9999;
  const match = code.match(/ST(\d+)/);
  return match ? Number(match[1]) : 9999; // nếu không match → đẩy xuống cuối
}

/**
 * Chuyển ServiceItem (new system — GET /services) sang shape tương thích ServiceDTO cho picker.
 * - id: dùng parseInt nếu numeric string, ngược lại dùng fallbackId âm (tránh trùng old system)
 * - category: giữ nguyên = category code → getServiceCategoryCode() đọc đúng
 */
function adaptServiceItem(item: ServiceItem, fallbackId: number): ServiceDTO {
  const parsedId = parseInt(item.id, 10);
  return {
    id: Number.isFinite(parsedId) ? parsedId : fallbackId,
    serviceCode: item.id,          // dùng id string làm code (unique)
    serviceName: item.name,
    serviceTypeCode: undefined,    // không thuộc old service-type
    category: item.category,       // ← category CODE — getServiceCategoryCode() đọc field này
    adjustedPrice: 0,
    adjustedPriceFlag: false,
    adjustedPriceReason: "",
    quantity: 1,
    duration: undefined,
    note: item.description,
    serviceCatalog: { id: 0, code: "", size: "", listedPrice: 0 },
    // Copy embedded prices để useService.ts build synthetic catalogs
    priceS: item.priceS,
    priceM: item.priceM,
    priceL: item.priceL,
    priceSEDAN: item.priceSEDAN,
    priceSUV: item.priceSUV,
    priceOverSize: item.priceOverSize,
  };
}

export function useServiceForm() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceTypeNames, setServiceTypeNames] = useState<Record<string, string>>({});

  const { getAllServiceCode, getAllServiceType } = useServiceManagerService();
  const { getServices: getNewServices } = useServiceCatalog();

  // Giữ ref stable để tránh infinite loop khi hook deps không stable
  const getNewServicesRef = useRef(getNewServices);
  useEffect(() => { getNewServicesRef.current = getNewServices; }, [getNewServices]);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      // allSettled: một endpoint fail không làm mất data của endpoint kia
      const [oldDataResult, typesResult, newDataResult] = await Promise.allSettled([
        getAllServiceCode(),
        getAllServiceType(),
        getNewServicesRef.current(),
      ]);

      // ── Old system (GET /service/) ──
      const oldData: ServiceDTO[] =
        oldDataResult.status === "fulfilled" ? oldDataResult.value : [];

      const sorted = [...oldData].sort(
        (a, b) =>
          extractTypeOrder(a.serviceTypeCode) -
          extractTypeOrder(b.serviceTypeCode)
      );

      // Service type names cho tab cũ
      if (typesResult.status === "fulfilled" && Array.isArray(typesResult.value)) {
        const map: Record<string, string> = {};
        for (const t of typesResult.value) {
          map[t.code] = t.serviceTypeName || t.code;
        }
        setServiceTypeNames(map);
      }

      // ── New system (GET /services) ──
      // Chỉ thêm service active, bỏ qua nếu đã có trong old system (theo serviceCode/id)
      const existingCodes = new Set(sorted.map((s) => s.serviceCode));
      const newAdapted: ServiceDTO[] = [];

      if (newDataResult.status === "fulfilled") {
        const items: ServiceItem[] = newDataResult.value;
        let fallbackId = -1;
        items.forEach((item) => {
          if (!item.active) return;
          if (existingCodes.has(item.id)) return; // đã có → bỏ qua
          newAdapted.push(adaptServiceItem(item, fallbackId--));
        });
      }

      setServices([...sorted, ...newAdapted]);
    } catch (e) {
      console.error("[useServiceForm] Error loading services:", e);
    } finally {
      setLoadingServices(false);
    }
  }, [getAllServiceCode, getAllServiceType]);
  // getNewServicesRef là ref nên không cần trong deps

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loadingServices, serviceTypeNames, refetchServices: fetchServices };
}
