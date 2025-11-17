"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Trash2, AlertTriangle } from "lucide-react";
import type { ServiceDTO } from "@/types/OrderResponse";
import ServiceCatalogSelector from "./ServiceCatalogSelector";
import { useServiceManager } from "@/shared/hooks/order/useService";

interface ServiceInfoBlockProps {
  service: ServiceDTO;
  allServices: ServiceDTO[];
  loadingServices: boolean;
  onServiceChange: (service: ServiceDTO) => void;
  onRemove?: () => void;
  vehicleSize: string;
  canRemove?: boolean;
  serviceIndex: number;
  selectedServiceIds?: number[];
  onValidationChange?: (isValid: boolean) => void;
}

export default function ServiceInfoBlock({
  service,
  allServices,
  loadingServices,
  onServiceChange,
  onRemove,
  vehicleSize,
  canRemove = false,
  serviceIndex,
  selectedServiceIds,
  onValidationChange,
}: ServiceInfoBlockProps) {
  const {
    service: managedService,
    serviceOptions,
    catalogOptions,
    loadingCatalogs,
    priceDiff,
    priceValidationError,
    isPriceChangeValid,
    selectService,
    selectCatalog,
    toggleAdjustedPrice,
    setAdjustedPrice,
    setAdjustedPriceReason,
  } = useServiceManager(service, allServices, loadingServices, vehicleSize);

  // Báo validation lên cha
  useEffect(() => {
    onValidationChange?.(isPriceChangeValid);
  }, [isPriceChangeValid, onValidationChange]);

  // Khi service thay đổi trong hook -> báo ngược lên cha (giống VehicleInfoSection)
  useEffect(() => {
    if (managedService) onServiceChange(managedService);
  }, [managedService, onServiceChange]);

  return (
    <Card
      className={`${
        managedService.adjustedPriceFlag ? "border-orange-200 bg-orange-50" : ""
      } ${!isPriceChangeValid ? "border-red-200" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Dịch Vụ #{serviceIndex + 1}
            {managedService.adjustedPriceFlag && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            {!isPriceChangeValid && (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
          </CardTitle>

          {canRemove && onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
              aria-label={`Xóa dịch vụ #${serviceIndex + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ServiceCatalogSelector
          service={managedService}
          selectedServiceIds={selectedServiceIds ?? []}
          serviceOptions={serviceOptions}
          catalogOptions={catalogOptions}
          loadingServices={loadingServices}
          loadingCatalogs={loadingCatalogs}
          priceDiff={priceDiff}
          priceValidationError={priceValidationError}
          onSelectService={selectService}
          onSelectCatalog={selectCatalog}
          onToggleAdjustedPrice={toggleAdjustedPrice}
          onSetAdjustedPrice={setAdjustedPrice}
          onSetAdjustedPriceReason={setAdjustedPriceReason}
        />
      </CardContent>
    </Card>
  );
}
