"use client";

import { useEffect } from "react";
import type { CustomerDTO, VehicleDTO } from "@/types/OrderResponse";
import VehicleInfo from "./ui/VehicleInfo";
import { useVehicleManager } from "@/shared/hooks/order/useVehicleInfo";

interface Props {
  value: VehicleDTO;
  onChange: (v: VehicleDTO) => void;
  customer?: CustomerDTO;
}

export default function VehicleInfoSection({
  value,
  onChange,
  customer,
}: Props) {
  // Lấy dữ liệu xe và các hàm điều khiển từ hook
  const {
    vehicle,
    brandOptions,
    modelOptions,
    loadingBrands,
    loadingModels,
    selectedBrand,
    plateError,
    handleLicensePlateChange,
    validateLicensePlate,
    handleBrandSelect,
    handleModelSelect,
    selectExistingVehicle,
  } = useVehicleManager(value, customer);

  // Khi vehicle thay đổi -> báo ngược lên cha
  useEffect(() => {
    if (vehicle) onChange(vehicle);
  }, [vehicle]);

  return (
    <VehicleInfo
      vehicle={vehicle}
      customerVehicles={customer?.vehicles ?? []}
      brandOptions={brandOptions.map((option) => ({
        ...option,
        label: option.label ?? "",
      }))}
      modelOptions={modelOptions}
      loadingBrands={loadingBrands}
      loadingModels={loadingModels}
      selectedBrandCode={selectedBrand?.code ?? ""}
      plateError={plateError}
      // handlers
      onLicenseChange={handleLicensePlateChange}
      onLicenseBlur={validateLicensePlate}
      onBrandChange={handleBrandSelect}
      onModelChange={handleModelSelect}
      onSelectExisting={selectExistingVehicle}
    />
  );
}
