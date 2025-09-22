"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Trash2, AlertTriangle } from "lucide-react";
import ServiceCatalogSelector from "./service-catalog-selector";
import type { ServiceDTO } from "@/types/OrderResponse";

interface ServiceInfoBlockProps {
  service: ServiceDTO;
  onServiceChange: (service: ServiceDTO) => void;
  onRemove?: () => void;
  vehicleSize: string;
  canRemove?: boolean;
  serviceIndex: number;
  selectedServiceIds?: number[];
}

export default function ServiceInfoBlock({
  service,
  onServiceChange,
  onRemove,
  vehicleSize,
  canRemove = false,
  serviceIndex,
  selectedServiceIds,
}: ServiceInfoBlockProps) {
  const updateService = (field: string, value: any) => {
    if (field === "service") {
      onServiceChange(value);
    } else if (field === "serviceCatalog") {
      onServiceChange({
        ...service,
        serviceCatalog: value,
      });
    } else {
      onServiceChange({
        ...service,
        [field]: value,
      });
    }
  };

  const finalPrice =
    service.serviceCatalog?.isException &&
    service.serviceCatalog?.exceptionPrice
      ? service.serviceCatalog.exceptionPrice
      : service.serviceCatalog?.price || 0;

  return (
    <Card
      className={
        service.serviceCatalog?.isException
          ? "border-orange-200 bg-orange-50"
          : ""
      }
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Dịch Vụ #{serviceIndex + 1}
            {service.serviceCatalog?.isException && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </CardTitle>
          {canRemove && onRemove && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ServiceCatalogSelector
          service={service}
          serviceCatalog={service.serviceCatalog}
          vehicleSize={vehicleSize}
          onServiceChange={(newService) => updateService("service", newService)}
          onServiceCatalogChange={(catalog) =>
            updateService("serviceCatalog", catalog)
          }
          selectedServiceIds={selectedServiceIds}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-700">
              Giá dịch vụ{" "}
              {service.serviceCatalog?.isException ? "(Đã chỉnh sửa)" : ""}:
            </span>
            <span className="font-semibold text-blue-800">
              {finalPrice.toLocaleString("vi-VN")} VNĐ
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
