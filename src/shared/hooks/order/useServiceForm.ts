"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServiceDTO } from "@/types/OrderResponse";
import type { ServiceItem } from "@/types/Service";
import { useServiceCatalog } from "@/services/useServiceCatalog";

/**
 * Tạo ID âm ổn định từ UUID string.
 * Dùng cho new-system services (ServiceItem có UUID id, không có integer id trong old system).
 * ID âm → catalog loading effect sẽ dùng synthetic catalogs ngay, không gọi API.
 */
function stableNegativeId(uuid: string): number {
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    hash = (Math.imul(31, hash) + uuid.charCodeAt(i)) | 0;
  }
  return hash < 0 ? hash : -(hash + 1); // đảm bảo < 0
}

function adaptServiceItem(item: ServiceItem): ServiceDTO {
  return {
    id: stableNegativeId(item.id),  // ID âm duy nhất mỗi service → effect dùng synthetic branch
    serviceCode: item.id,           // UUID đầy đủ → dùng làm serviceItemId khi submit
    serviceName: item.name,
    category: item.category,
    adjustedPrice: 0,
    adjustedPriceFlag: false,
    adjustedPriceReason: "",
    quantity: 1,
    duration: undefined,
    note: item.description,
    serviceCatalog: { id: 0, code: "", size: "", listedPrice: 0 },
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
  const { getServices } = useServiceCatalog();

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const items: ServiceItem[] = await getServices();
      setServices(
        items
          .filter((item) => item.active)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map(adaptServiceItem)
      );
    } catch (e) {
      console.error("[useServiceForm] Error loading services:", e);
    } finally {
      setLoadingServices(false);
    }
  }, [getServices]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, loadingServices, serviceTypeNames: {}, refetchServices: fetchServices };
}
