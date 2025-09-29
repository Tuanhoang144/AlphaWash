"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, DollarSign } from "lucide-react";
import { Select } from "antd";
import { useServiceManager } from "@/services/useServiceManager";
import { useServiceCatalogManager } from "@/services/userServiceCatalogManager";
import type { ServiceCatalogDTO, ServiceDTO } from "@/types/OrderResponse";
import { tool } from "@/utils/tool";

const { Option } = Select;

interface ServiceCatalogSelectorProps {
  service: ServiceDTO;
  serviceCatalog: ServiceCatalogDTO;
  vehicleSize: string;
  selectedServiceIds?: number[];
  onServiceChange: (service: ServiceDTO) => void;
  onServiceCatalogChange: (catalog: ServiceCatalogDTO) => void;
}

export default function ServiceCatalogSelector({
  service,
  serviceCatalog,
  vehicleSize,
  selectedServiceIds,
  onServiceChange,
  onServiceCatalogChange,
}: ServiceCatalogSelectorProps) {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [catalogs, setCatalogs] = useState<ServiceCatalogDTO[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const { getServiceCatalogByServiceId } = useServiceCatalogManager();
  const { getAllServices } = useServiceManager();
  const {
    formatNumber,
    parseFormattedNumber,
    validateNumericInput,
    handleNumericInput,
  } = tool();

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (service.id) {
      loadServiceCatalogs(service.id);
    } else {
      setCatalogs([]);
    }
  }, [service.id]);

  useEffect(() => {
    if (catalogs.length > 0 && vehicleSize) {
      const matchingCatalog = catalogs.find(
        (catalog) => catalog.size === vehicleSize
      );
      if (matchingCatalog && matchingCatalog.id !== serviceCatalog?.id) {
        onServiceCatalogChange(matchingCatalog);
      }
    }
  }, [catalogs, vehicleSize, serviceCatalog?.id, onServiceCatalogChange]);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const servicesData = await getAllServices();
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  //
  const loadServiceCatalogs = async (id: number) => {
    setLoadingCatalogs(true);
    try {
      const catalogsData = await getServiceCatalogByServiceId(id);
      setCatalogs(catalogsData);
    } catch (error) {
      console.error("Error loading service catalogs:", error);
    } finally {
      setLoadingCatalogs(false);
    }
  };

  const handleServiceSelect = (serviceId: number) => {
    const selectedService = services.find((s) => s.id === serviceId);
    if (selectedService) {
      onServiceChange(selectedService);
    }
  };

  const handleCatalogSelect = (catalogId: number) => {
    const selectedCatalog = catalogs.find((c) => c.id === catalogId);
    if (selectedCatalog) {
      onServiceCatalogChange(selectedCatalog);
    }
  };

  const handleExceptionToggle = (checked: boolean) => {
    const updatedService = {
      ...service,
      adjustedPriceFlag: checked,
      adjustedPrice: checked ? serviceCatalog.listedPrice ?? 0 : 0,
      adjustedPriceReason: checked ? "" : "",
    } as ServiceDTO;
    onServiceChange(updatedService);
  };

  const handleExceptionPriceChange = (value: string) => {
    const price = Number.parseFloat(value) || 0;
    const updatedService = {
      ...service,
      adjustedPrice: price,
    } as ServiceDTO;
    onServiceChange(updatedService);
  };

  const handleExceptionReasonChange = (value: string) => {
    const updatedService = {
      ...service,
      adjustedPriceReason: value,
    } as ServiceDTO;
    onServiceChange(updatedService);
  };

  const filterServiceOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  };

  const filterCatalogOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  };

  const priceDifference =
    service.adjustedPriceFlag && service.adjustedPriceReason
      ? (service.adjustedPrice ?? 0) - (serviceCatalog?.listedPrice ?? 0)
      : 0;

  console.log("priceDifference", priceDifference);

  return (
    <div className="space-y-4">
      {/* Service Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Chọn dịch vụ *</Label>
          <Select
            showSearch
            placeholder={loadingServices ? "Đang tải..." : "Chọn dịch vụ"}
            optionFilterProp="label"
            filterOption={filterServiceOption}
            value={service.id || undefined}
            onChange={handleServiceSelect}
            loading={loadingServices}
            style={{ width: "100%" }}
            size="large"
          >
            {services.map((serviceItem) => {
              const isDisabled = selectedServiceIds?.includes(serviceItem.id);
              return (
                <Option
                  key={serviceItem.serviceCode}
                  value={serviceItem.id}
                  label={serviceItem.serviceName}
                  disabled={isDisabled}
                >
                  <div className="flex justify-between items-center w-full">
                    <span
                      className={`font-medium ${
                        isDisabled ? "text-gray-400" : ""
                      }`}
                    >
                      {serviceItem.serviceName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {serviceItem.duration}
                    </span>
                  </div>
                </Option>
              );
            })}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Bảng giá theo kích thước</Label>
          <Select
            showSearch
            placeholder={
              !service.serviceCode
                ? "Chọn dịch vụ trước"
                : loadingCatalogs
                ? "Đang tải..."
                : "Chọn kích thước"
            }
            optionFilterProp="label"
            filterOption={filterCatalogOption}
            value={serviceCatalog?.id || undefined}
            onChange={handleCatalogSelect}
            disabled={!service.serviceCode || loadingCatalogs}
            loading={loadingCatalogs}
            style={{ width: "100%" }}
            size="large"
          >
            {catalogs.map((catalog) => (
              <Option
                key={catalog.id}
                value={catalog.id}
                label={`Kích thước ${catalog.size}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span>Kích thước {catalog.size}</span>
                  <span className="font-medium text-green-600 ml-2">
                    {catalog.listedPrice?.toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {serviceCatalog?.id > 0 && (
        <div className="border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <Label className="font-medium">Chỉnh sửa giá ngoại lệ</Label>
            </div>
            <Switch
              checked={service.adjustedPriceFlag || false}
              onCheckedChange={handleExceptionToggle}
            />
          </div>

          {service.adjustedPriceFlag && (
            <div className="space-y-4 bg-orange-50 p-4 rounded-md border border-orange-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá gốc</Label>
                  <div className="p-2 bg-gray-100 rounded-md font-medium text-gray-600">
                    {serviceCatalog.listedPrice.toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Giá ngoại lệ *</Label>
                  {/* <Input
                    type="number"
                    onChange={(e) => handleExceptionPriceChange(e.target.value)}
                    placeholder="Nhập giá mới"
                    className="border-orange-300 focus:border-orange-500"
                  /> */}
                  <Input
                    type="text"
                    placeholder="Nhập giá mới"
                    value={formatNumber(service.adjustedPrice)}
                    onKeyDown={handleNumericInput}
                    className="border-orange-300 focus:border-orange-500"
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Validate chỉ cho phép số và dấu chấm
                      if (!validateNumericInput(inputValue)) {
                        return;
                      }
                      const value = parseFormattedNumber(inputValue);
                      // Chỉ cho phép số dương hoặc 0
                      if (value >= 0) {
                        handleExceptionPriceChange(String(value));
                      }
                    }}
                    onBlur={(e) => {
                      // Double check khi blur
                      const value = parseFormattedNumber(e.target.value);
                      if (value < 0) {
                        handleExceptionPriceChange("0");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Lý do chỉnh sửa giá *</Label>
                <Textarea
                  value={service.adjustedPriceReason || ""}
                  onChange={(e) => handleExceptionReasonChange(e.target.value)}
                  placeholder="Nhập lý do chỉnh sửa giá (VD: Khuyến mãi, khách VIP, tình trạng xe đặc biệt...)"
                  className="border-orange-300 focus:border-orange-500"
                  rows={3}
                />
              </div>

              {service.adjustedPrice && (
                <div className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <span className="text-sm font-medium">Chênh lệch giá:</span>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span
                      className={`font-bold ${
                        priceDifference >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {priceDifference >= 0 ? "+" : ""}
                      {priceDifference.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {serviceCatalog?.id > 0 && (
        <div
          className={`p-3 rounded-md border ${
            service.adjustedPriceFlag
              ? "bg-orange-50 border-orange-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {service.adjustedPriceFlag && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Ngoại lệ
                </Badge>
              )}
              <span className="text-sm font-medium">Giá áp dụng:</span>
            </div>
            <span
              className={`text-lg font-bold ${
                service.adjustedPriceFlag ? "text-orange-600" : "text-green-600"
              }`}
            >
              {(service.adjustedPriceFlag && service.adjustedPriceReason
                ? service.adjustedPrice
                : serviceCatalog.listedPrice
              )?.toLocaleString("vi-VN")}{" "}
              VNĐ
            </span>
          </div>
          {service.adjustedPriceFlag && service.adjustedPriceReason && (
            <div className="mt-2 text-xs text-orange-700 bg-orange-100 p-2 rounded">
              <strong>Lý do:</strong> {service.adjustedPriceReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
