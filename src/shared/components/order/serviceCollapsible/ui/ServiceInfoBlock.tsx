"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Trash2, AlertTriangle } from "lucide-react";
import type { ServiceDTO } from "@/types/OrderResponse";
import ServiceCatalogSelector from "./ServiceCatalogSelector";
import { useServiceManager } from "@/shared/hooks/order/useService";

interface ServiceInfoBlockProps {
  service: ServiceDTO;
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
  onServiceChange,
  onRemove,
  vehicleSize,
  canRemove = false,
  serviceIndex,
  selectedServiceIds,
  onValidationChange,
}: ServiceInfoBlockProps) {
  const {
    serviceOptions,
    catalogOptions,
    loadingServices,
    loadingCatalogs,
    priceDiff,
    priceValidationError,
    isPriceChangeValid,
    updateService,
    toggleAdjustedPrice,
    setAdjustedPrice,
    setAdjustedPriceReason,
  } = useServiceManager(service, onServiceChange, vehicleSize);

  useEffect(() => {
    onValidationChange?.(isPriceChangeValid);
  }, [isPriceChangeValid, onValidationChange]);

  return (
    <Card
      className={`${
        service.adjustedPriceFlag ? "border-orange-200 bg-orange-50" : ""
      } ${!isPriceChangeValid ? "border-red-200" : ""}`}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Dịch Vụ #{serviceIndex + 1}
            {service.adjustedPriceFlag && (
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
          service={service}
          vehicleSize={vehicleSize}
          selectedServiceIds={selectedServiceIds ?? []}
          onServiceChange={updateService}
          onToggleAdjustedPrice={toggleAdjustedPrice}
          onSetAdjustedPrice={setAdjustedPrice}
          onSetAdjustedPriceReason={setAdjustedPriceReason}
          serviceOptions={serviceOptions}
          catalogOptions={catalogOptions}
          loadingServices={loadingServices}
          loadingCatalogs={loadingCatalogs}
          priceDiff={priceDiff}
          priceValidationError={priceValidationError}
          isPriceChangeValid={isPriceChangeValid}
        />
      </CardContent>
    </Card>
  );
}

import React, { useEffect } from "react";
