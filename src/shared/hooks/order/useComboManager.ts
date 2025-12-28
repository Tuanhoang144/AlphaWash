"use client";

import { useCallback, useMemo, useState } from "react";
import type { ComboApiItem, ComboApiCatalog, OrderComboDTO } from "@/shared/types/ComboApi";

export function useComboManager(
  combo: OrderComboDTO,
  allCombos: ComboApiItem[],
  loadingCombos: boolean,
  vehicleSize: string
) {
  const [managedCombo, setManagedCombo] = useState<OrderComboDTO>(combo);

  // ========== options cho select combo ==========
  const comboOptions = useMemo(() => {
    return allCombos.map((c) => ({
      id: c.comboCode,
      value: c.comboCode,
      label: `${c.comboName} (${c.comboCode})`,
      durationDays: c.durationDays,
      status: c.status,
    }));
  }, [allCombos]);

  const selectedComboTemplate = useMemo(() => {
    if (!managedCombo.comboCode) return null;
    return allCombos.find((c) => c.comboCode === managedCombo.comboCode) ?? null;
  }, [allCombos, managedCombo.comboCode]);

  // ========== catalogs theo size ==========
  const catalogOptions = useMemo(() => {
    const catalogs = selectedComboTemplate?.catalogs ?? [];
    // nếu vehicleSize có thì ưu tiên filter theo size (giống service)
    const filtered = vehicleSize ? catalogs.filter((x) => x.size === vehicleSize) : catalogs;

    return filtered.map((c: ComboApiCatalog) => ({
      id: c.catalogCode,
      value: c.catalogCode,
      label: `Size ${c.size}`,
      size: c.size,
      listedPrice: c.price,
      priceIncludeTax: c.priceIncludeTax,
      services: c.services,
    }));
  }, [selectedComboTemplate, vehicleSize]);

  // ========== chọn combo template ==========
  const selectCombo = useCallback(
    (comboCode: string) => {
      const tpl = allCombos.find((c) => c.comboCode === comboCode);
      if (!tpl) return;

      // reset catalog khi đổi combo
      setManagedCombo((prev) => ({
        ...prev,
        comboCode: tpl.comboCode,
        comboName: tpl.comboName,
        catalogCode: undefined,
        size: undefined,
        listedPrice: undefined,
        // reset chỉnh giá ngoại lệ khi đổi combo
        adjustedPriceFlag: false,
        adjustedPrice: 0,
        adjustedPriceReason: "",
      }));
    },
    [allCombos]
  );

  // ========== chọn catalog theo size ==========
  const selectCatalog = useCallback(
    (catalogCode: string) => {
      const opt = catalogOptions.find((x) => x.value === catalogCode);
      if (!opt) return;

      setManagedCombo((prev) => ({
        ...prev,
        catalogCode: opt.value,
        size: opt.size,
        listedPrice: opt.listedPrice,
        // nếu chưa bật chỉnh giá, có thể auto set adjustedPrice = listedPrice (tuỳ bạn)
        adjustedPrice: prev.adjustedPriceFlag ? prev.adjustedPrice ?? 0 : opt.listedPrice,
      }));
    },
    [catalogOptions]
  );

  // ========== chỉnh giá ==========
  const toggleAdjustedPrice = useCallback((enabled: boolean) => {
    setManagedCombo((prev) => ({
      ...prev,
      adjustedPriceFlag: enabled,
      adjustedPrice: enabled ? (prev.adjustedPrice ?? prev.listedPrice ?? 0) : (prev.listedPrice ?? 0),
      adjustedPriceReason: enabled ? (prev.adjustedPriceReason ?? "") : "",
    }));
  }, []);

  const setAdjustedPrice = useCallback((price: number) => {
    setManagedCombo((prev) => ({ ...prev, adjustedPrice: price }));
  }, []);

  const setAdjustedPriceReason = useCallback((reason: string) => {
    setManagedCombo((prev) => ({ ...prev, adjustedPriceReason: reason }));
  }, []);

  // ========== price diff + validate ==========
  const listedPrice = managedCombo.listedPrice ?? 0;
  const adjustedPrice = managedCombo.adjustedPrice ?? 0;

  const priceDiff = useMemo(() => adjustedPrice - listedPrice, [adjustedPrice, listedPrice]);

  const priceValidationError = useMemo(() => {
    if (!managedCombo.adjustedPriceFlag) return "";
    if (!managedCombo.catalogCode) return "Vui lòng chọn bảng giá (size) trước khi chỉnh giá";
    if (adjustedPrice <= 0) return "Giá ngoại lệ phải > 0";
    if (!managedCombo.adjustedPriceReason || managedCombo.adjustedPriceReason.trim().length < 3) {
      return "Vui lòng nhập lý do chỉnh sửa giá (tối thiểu 3 ký tự)";
    }
    return "";
  }, [managedCombo.adjustedPriceFlag, managedCombo.catalogCode, adjustedPrice, managedCombo.adjustedPriceReason]);

  const isPriceChangeValid = useMemo(() => priceValidationError === "", [priceValidationError]);

  // expose setter cho cha (để cha sync state)
  const commit = useCallback((next: OrderComboDTO) => setManagedCombo(next), []);

  return {
    combo: managedCombo,
    comboOptions,
    catalogOptions,
    loadingCatalogs: loadingCombos, // combo response đã chứa catalogs, nên “loadingCatalogs” = loadingCombos
    priceDiff,
    priceValidationError,
    isPriceChangeValid,
    selectCombo,
    selectCatalog,
    toggleAdjustedPrice,
    setAdjustedPrice,
    setAdjustedPriceReason,
    commit,
  };
}
