"use client";

import { useEffect, useRef } from "react";
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

  const prevVehicleRef = useRef<VehicleDTO | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    if (!vehicle) return;
    const prev = prevVehicleRef.current;
    const hasChanged =
      !prev ||
      prev.id !== vehicle.id ||
      prev.licensePlate !== vehicle.licensePlate ||
      prev.brandCode !== vehicle.brandCode ||
      prev.modelCode !== vehicle.modelCode ||
      prev.size !== vehicle.size;
    if (hasChanged) {
      prevVehicleRef.current = vehicle;
      onChangeRef.current(vehicle);
    }
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
