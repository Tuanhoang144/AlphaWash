"use client";

import { useCallback, useEffect, useState } from "react";
import useApiService from "@/config/useApi";
import type { ComboApiItem } from "@/shared/types/ComboApi";

export function useComboForm() {
  const { callApi } = useApiService();
  const [combos, setCombos] = useState<ComboApiItem[]>([]);
  const [loadingCombos, setLoadingCombos] = useState(false);

  const fetchCombos = useCallback(async () => {
    setLoadingCombos(true);
    try {
      const response = await callApi("get", "/combo/");
      const data = response?.data ?? [];
      const list = Array.isArray(data) ? (data as ComboApiItem[]) : [];
      setCombos(list);
      return list;
    } catch {
      setCombos([]);
      return [];
    } finally {
      setLoadingCombos(false);
    }
  }, [callApi]);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  return { combos, loadingCombos, fetchCombos };
}
