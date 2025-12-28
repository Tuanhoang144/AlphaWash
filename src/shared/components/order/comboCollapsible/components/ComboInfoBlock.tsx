"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Trash2, AlertTriangle } from "lucide-react";
import type { ComboApiItem, OrderComboDTO } from "@/shared/types/ComboApi";
import ComboCatalogSelector from "./ComboCatalogSelector";
import { useComboManager } from "@/shared/hooks/order/useComboManager";

type Props = {
  combo: OrderComboDTO;
  allCombos: ComboApiItem[];
  loadingCombos: boolean;
  onComboChange: (combo: OrderComboDTO) => void;
  onRemove?: () => void;
  vehicleSize: string;
  canRemove?: boolean;
  comboIndex: number;
  onValidationChange?: (isValid: boolean) => void;
};

export default function ComboInfoBlock({
  combo,
  allCombos,
  loadingCombos,
  onComboChange,
  onRemove,
  vehicleSize,
  canRemove = false,
  comboIndex,
  onValidationChange,
}: Props) {
  const {
    combo: managedCombo,
    comboOptions,
    catalogOptions,
    loadingCatalogs,
    priceDiff,
    priceValidationError,
    isPriceChangeValid,
    selectCombo,
    selectCatalog,
    toggleAdjustedPrice,
    setAdjustedPrice,
    setAdjustedPriceReason,
  } = useComboManager(combo, allCombos, loadingCombos, vehicleSize);

  // báo validation lên cha
  useEffect(() => {
    onValidationChange?.(isPriceChangeValid);
  }, [isPriceChangeValid, onValidationChange]);

  // báo combo lên cha khi managedCombo đổi
  useEffect(() => {
    onComboChange(managedCombo);
  }, [managedCombo, onComboChange]);

  return (
    <Card
      className={`${
        managedCombo.adjustedPriceFlag ? "border-orange-200 bg-orange-50" : ""
      } ${!isPriceChangeValid ? "border-red-200" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Combo #{comboIndex + 1}
            {managedCombo.adjustedPriceFlag ? (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            ) : null}
            {!isPriceChangeValid ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : null}
          </CardTitle>

          {canRemove && onRemove ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              aria-label={`Xóa combo #${comboIndex + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ComboCatalogSelector
          combo={managedCombo}
          comboOptions={comboOptions}
          catalogOptions={catalogOptions}
          loadingCombos={loadingCombos}
          loadingCatalogs={loadingCatalogs}
          priceDiff={priceDiff}
          priceValidationError={priceValidationError}
          onSelectCombo={selectCombo}
          onSelectCatalog={selectCatalog}
          onToggleAdjustedPrice={toggleAdjustedPrice}
          onSetAdjustedPrice={setAdjustedPrice}
          onSetAdjustedPriceReason={setAdjustedPriceReason}
        />
      </CardContent>
    </Card>
  );
}
