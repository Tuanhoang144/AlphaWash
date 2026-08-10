"use client";

import { useCallback, useEffect, useState } from "react";
import type { ServiceDTO } from "@/types/OrderResponse";
import type { ServiceItem } from "@/types/Service";
import { useServiceCatalog } from "@/services/useServiceCatalog";

function adaptServiceItem(item: ServiceItem): ServiceDTO {
  const parsedId = parseInt(item.id, 10);
  return {
    id: Number.isFinite(parsedId) ? parsedId : 0,
    serviceCode: item.id,
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
