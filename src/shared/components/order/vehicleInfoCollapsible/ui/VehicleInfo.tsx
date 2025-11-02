"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { VehicleDTO } from "@/types/OrderResponse";
import { Select } from "antd";
const { Option } = Select;

type BrandOption = { value: string; label: string };
type ModelOption = { value: string; label: string; size?: string };

interface Props {
  vehicle: VehicleDTO;
  customerVehicles: VehicleDTO[];

  brandOptions: BrandOption[];
  modelOptions: ModelOption[];

  loadingBrands: boolean;
  loadingModels: boolean;

  selectedBrandCode: string;
  plateError: string | null;

  onLicenseChange: (plate: string) => void;
  onLicenseBlur: (plate: string) => boolean;
  onBrandChange: (brandCode: string) => void;
  onModelChange: (modelCode: string) => void;
  onSelectExisting: (v: VehicleDTO) => void;
}

export default function VehicleInfo({
  vehicle,
  customerVehicles,
  brandOptions,
  modelOptions,
  loadingBrands,
  loadingModels,
  selectedBrandCode,
  plateError,
  onLicenseChange,
  onLicenseBlur,
  onBrandChange,
  onModelChange,
  onSelectExisting,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5" />
          Thông Tin Xe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customerVehicles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Xe đã đăng ký:</Label>
              <div className="flex flex-wrap gap-2">
                {customerVehicles.map((v) => (
                  <Badge
                    key={`${v.id}-${v.licensePlate}`}
                    variant={vehicle.id === v.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onSelectExisting(v)}
                  >
                    {v.licensePlate} - {v.brandName} {v.modelName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Biển số */}
            <div className="space-y-2">
              <Label>Biển số xe *</Label>
              <Input
                placeholder="29A-12345"
                value={vehicle?.licensePlate ?? ""}
                onChange={(e) => onLicenseChange(e.target.value)}
                onBlur={(e) => onLicenseBlur(e.target.value)}
                required
              />
              {plateError && (
                <p className="text-sm text-red-600 mt-1">{plateError}</p>
              )}
            </div>

            {/* Hãng xe */}
            <div className="space-y-2">
              <Label>Hãng xe *</Label>
              <Select
                showSearch
                placeholder={loadingBrands ? "Đang tải..." : "Chọn hãng xe"}
                options={brandOptions}
                value={selectedBrandCode || undefined}
                onChange={onBrandChange}
                loading={loadingBrands}
                size="large"
                style={{ width: "100%" }}
                filterOption={(input, option) =>
                  ((option?.label as string) || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mẫu xe */}
            <div className="space-y-2">
              <Label>Mẫu xe *</Label>
              <Select
                showSearch
                placeholder={
                  !selectedBrandCode
                    ? "Chọn hãng xe trước"
                    : loadingModels
                    ? "Đang tải..."
                    : "Chọn mẫu xe"
                }
                value={vehicle?.modelCode || undefined}
                onChange={onModelChange}
                disabled={!selectedBrandCode || loadingModels}
                loading={loadingModels}
                size="large"
                style={{ width: "100%" }}
                filterOption={(input, option) =>
                  ((option?.label as string) || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {modelOptions.map((model) => (
                  <Option value={model.value} label={model.label}>
                    <div className="flex justify-between items-center">
                      <span>{model.label}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {model.size}
                      </Badge>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label>Kích thước xe</Label>
              <div className="p-2 bg-gray-50 rounded-md font-medium border">
                {vehicle?.size || "Chọn mẫu xe để xem kích thước"}
              </div>
            </div>
          </div>

          {!selectedBrandCode && brandOptions.length > 0 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              💡 Vui lòng chọn hãng xe để xem danh sách các mẫu xe
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
