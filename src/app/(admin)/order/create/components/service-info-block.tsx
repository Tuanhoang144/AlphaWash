"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, Trash2 } from "lucide-react"
import ServiceCatalogSelector from "./service-catalog-selector"

interface ServiceInfoBlockProps {
  service: {
    id: number
    serviceCode: string
    serviceName: string
    serviceTypeCode: string
    serviceCatalog: {
      id: number
      code: string
      size: string
      price: number
    }
  }
  onServiceChange: (service: any) => void
  onRemove?: () => void
  vehicleSize: string
  canRemove?: boolean
  serviceIndex: number
}

export default function ServiceInfoBlock({
  service,
  onServiceChange,
  onRemove,
  vehicleSize,
  canRemove = false,
  serviceIndex,
}: ServiceInfoBlockProps) {
  const updateService = (field: string, value: any) => {
    if (field === "service") {
      onServiceChange(value)
    } else if (field === "serviceCatalog") {
      onServiceChange({
        ...service,
        serviceCatalog: value,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Dịch Vụ #{serviceIndex + 1}
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
      <CardContent className="space-y-2">
        {/* Service Selection */}
        <ServiceCatalogSelector
          service={service}
          serviceCatalog={service.serviceCatalog}
          vehicleSize={vehicleSize}
          onServiceChange={(newService) => updateService("service", newService)}
          onServiceCatalogChange={(catalog) => updateService("serviceCatalog", catalog)}
        />

        {/* Price Display
        {service.serviceCatalog?.price && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Giá dịch vụ:</span>
              <span className="font-semibold text-green-800">
                {service.serviceCatalog.price.toLocaleString("vi-VN")} VNĐ
              </span>
            </div>
          </div>
        )} */}
      </CardContent>
    </Card>
  )
}
