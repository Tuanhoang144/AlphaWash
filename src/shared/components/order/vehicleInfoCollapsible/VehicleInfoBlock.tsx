"use client";

import { useEffect, useRef } from "react";
import type { CustomerDTO, VehicleDTO } from "@/types/OrderResponse";
import VehicleInfo from "./ui/VehicleInfo";
import { useVehicleManager } from "@/shared/hooks/order/useVehicleInfo";

interface Props {
  value: VehicleDTO;
  onChange: (v: VehicleDTO) => void;
  customer?: CustomerDTO;
  /** Called whenever this vehicle's plate is blocked (belongs to another customer) or unblocked. */
  onBlockChange?: (blocked: boolean) => void;
}

export default function VehicleInfoSection({
  value,
  onChange,
  customer,
  onBlockChange,
}: Props) {
  const {
    vehicle,
    brandOptions,
    modelOptions,
    loadingBrands,
    loadingModels,
    selectedBrand,
    plateError,
    plateBlocked,
    excludePlate,
    handleLicensePlateChange,
    validateLicensePlate,
    handleBrandSelect,
    handleModelSelect,
    selectExistingVehicle,
    handleVehicleLinked,
    handleTransferRequested,
    handlePlateConfirmed,
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

  const onBlockChangeRef = useRef(onBlockChange);
  useEffect(() => {
    onBlockChangeRef.current = onBlockChange;
  });
  useEffect(() => {
    onBlockChangeRef.current?.(plateBlocked);
  }, [plateBlocked]);

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
      excludePlate={excludePlate}
      // handlers
      onLicenseChange={handleLicensePlateChange}
      onLicenseBlur={validateLicensePlate}
      onBrandChange={handleBrandSelect}
      onModelChange={handleModelSelect}
      onSelectExisting={selectExistingVehicle}
      onVehicleLinked={handleVehicleLinked}
      onPlateConfirmed={handlePlateConfirmed}
      onTransferRequested={handleTransferRequested}
    />
  );
}
