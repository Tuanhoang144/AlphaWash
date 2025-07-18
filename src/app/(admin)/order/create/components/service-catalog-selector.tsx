"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wrench, Clock, FileText } from "lucide-react"
import { Select } from "antd"
import type { Service, ServiceCatalog } from "../types/invoice"
import { useServiceManager } from "@/services/useServiceManager"
import { useServiceCatalogManager } from "@/services/userServiceCatalogManager"

const { Option } = Select

interface ServiceCatalogSelectorProps {
  service: Service
  serviceCatalog: ServiceCatalog
  vehicleSize: string
  onServiceChange: (service: Service) => void
  onServiceCatalogChange: (catalog: ServiceCatalog) => void
}

export default function ServiceCatalogSelector({
  service,
  serviceCatalog,
  vehicleSize,
  onServiceChange,
  onServiceCatalogChange,
}: ServiceCatalogSelectorProps) {
  const [services, setServices] = useState<Service[]>([])
  const [catalogs, setCatalogs] = useState<ServiceCatalog[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingCatalogs, setLoadingCatalogs] = useState(false)
  const { getServiceCatalogByServiceId } = useServiceCatalogManager()
  const { getAllServices } = useServiceManager()

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    if (service.id) {
      loadServiceCatalogs(service.id)
    } else {
      setCatalogs([])
    }
  }, [service.id])

  // Auto-select catalog based on vehicle size
  useEffect(() => {
    if (catalogs.length > 0 && vehicleSize) {
      const matchingCatalog = catalogs.find((catalog) => catalog.size === vehicleSize)
      if (matchingCatalog && matchingCatalog.id !== serviceCatalog?.id) {
        onServiceCatalogChange(matchingCatalog)
      }
    }
  }, [catalogs, vehicleSize, serviceCatalog?.id, onServiceCatalogChange])

  const loadServices = async () => {
    setLoadingServices(true)
    try {
      const servicesData = await getAllServices()
      setServices(servicesData)
    } catch (error) {
      console.error("Error loading services:", error)
    } finally {
      setLoadingServices(false)
    }
  }

  // Changed to accept serviceId (number)
  const loadServiceCatalogs = async (id: number) => {
    setLoadingCatalogs(true)
    try {
      const catalogsData = await getServiceCatalogByServiceId(id) // Call apiService directly
      setCatalogs(catalogsData)
    } catch (error) {
      console.error("Error loading service catalogs:", error)
    } finally {
      setLoadingCatalogs(false)
    }
  }

  const handleServiceSelect = (serviceId: number) => {
    const selectedService = services.find((s) => s.id === serviceId)
    console.log("Selected Service:", selectedService);
    
    if (selectedService) {
      onServiceChange(selectedService)
    }
  }

  const handleCatalogSelect = (catalogId: number) => {
    const selectedCatalog = catalogs.find((c) => c.id === catalogId)
    if (selectedCatalog) {
      onServiceCatalogChange(selectedCatalog)
    }
  }

  const selectPredefinedService = (selectedService: Service) => {
    onServiceChange(selectedService)
  }

  const filterServiceOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
  }

  const filterCatalogOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4" />
        <Label className="font-medium">Dịch vụ</Label>
      </div>
      {/* Quick Service Selection */}
      <div className="space-y-2">
        <Label className="text-sm">Dịch vụ có sẵn:</Label>
        <div className="flex flex-wrap gap-2">
          {services.map((predefinedService) => (
            <Badge
              key={predefinedService.id}
              variant={service.id === predefinedService.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => selectPredefinedService(predefinedService)}
            >
              {predefinedService.serviceName}
            </Badge>
          ))}
        </div>
      </div>
      {/* Service Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chọn dịch vụ *</Label>
          <Select
            showSearch
            placeholder={loadingServices ? "Đang tải..." : "Chọn dịch vụ"}
            optionFilterProp="label" // Changed to label
            filterOption={filterServiceOption}
            value={service.id || undefined}
            onChange={handleServiceSelect}
            loading={loadingServices}
            style={{ width: "100%" }}
            size="large"
          >
            {services.map((serviceItem) => (
              <Option
                key={serviceItem.code}
                value={serviceItem.id}
                label={serviceItem.serviceName} 
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium">{serviceItem.serviceName}</span>
                  <span className="text-xs text-gray-500">{serviceItem.duration}</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bảng giá theo kích thước</Label>
          <Select
            showSearch
            placeholder={!service.code ? "Chọn dịch vụ trước" : loadingCatalogs ? "Đang tải..." : "Chọn kích thước"}
            optionFilterProp="label" 
            filterOption={filterCatalogOption}
            value={serviceCatalog?.id || undefined}
            onChange={handleCatalogSelect}
            disabled={!service.code || loadingCatalogs}
            loading={loadingCatalogs}
            style={{ width: "100%" }}
            size="large"
          >
            {catalogs.map((catalog) => (
              <Option
                key={catalog.id}
                value={catalog.id}
                label={`Kích thước ${catalog.size}`} // Added label prop
              >
                <div className="flex justify-between items-center w-full">
                  <span>Kích thước {catalog.size}</span>
                  <span className="font-medium text-green-600 ml-2">{catalog.price.toLocaleString("vi-VN")}đ</span>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Price Display */}
      {serviceCatalog?.id > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Kích thước xe</Label>
            <div className="p-2 bg-gray-50 rounded-md font-medium border">{vehicleSize || "Chưa xác định"}</div>
          </div>
          <div className="space-y-2">
            <Label>Giá dịch vụ</Label>
            <div className="p-2 bg-green-50 rounded-md font-semibold text-green-600 border border-green-200">
              {serviceCatalog.price.toLocaleString("vi-VN")} VNĐ
            </div>
          </div>
        </div>
      )}
      {/* Auto-pricing notification */}
      {vehicleSize && serviceCatalog?.size === vehicleSize && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
          ✅ Giá đã được tự động cập nhật theo kích thước xe ({vehicleSize})
        </div>
      )}
    </div>
  )
}
