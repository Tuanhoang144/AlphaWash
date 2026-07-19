"use client";

import { useEffect, useState } from "react";
import type { ServiceDTO } from "@/types/OrderResponse";
import { useServiceManager as useServiceManagerService } from "@/services/useServiceAll";

// 🔥 Hàm tự động lấy số từ STxxxx
function extractTypeOrder(code: string) {
  const match = code.match(/ST(\d+)/);
  return match ? Number(match[1]) : 9999; // nếu không match → đẩy xuống cuối
}

export function useServiceForm() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceTypeNames, setServiceTypeNames] = useState<Record<string, string>>({});
  const { getAllServiceCode, getAllServiceType } = useServiceManagerService();

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingServices(true);
      try {
        const [data, types] = await Promise.all([
          getAllServiceCode(),
          getAllServiceType(),
        ]);

        if (mounted) {
          const sorted = [...data].sort(
            (a, b) =>
              extractTypeOrder(a.serviceTypeCode) -
              extractTypeOrder(b.serviceTypeCode)
          );
          setServices(sorted);

          if (Array.isArray(types)) {
            const map: Record<string, string> = {};
            for (const t of types) {
              map[t.code] = t.serviceTypeName || t.code;
            }
            setServiceTypeNames(map);
          }
        }
      } catch (e) {
        console.error("[useServiceForm] Error loading services:", e);
      } finally {
        if (mounted) setLoadingServices(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [getAllServiceCode, getAllServiceType]);

  return { services, loadingServices, serviceTypeNames };
}
