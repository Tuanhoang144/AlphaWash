"use client";

import { useEffect, useMemo, useState } from "react";
import { useBrandManager } from "@/services/useBrandManager";
import { useModelManager } from "@/services/useModelManager";
import { isValidLicensePlate } from "@/shared/utils/checkValidate";
import { BrandDTO, ModelDTO, VehicleDTO } from "@/types/vehicle/VehicleDTO";
import { CustomerDTO } from "@/types/customer/CustomerDTO";

export function useVehicleManager(
  initialVehicle: VehicleDTO,
  customer?: CustomerDTO
) {
  const [vehicle, setVehicle] = useState<VehicleDTO>(initialVehicle);
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [models, setModels] = useState<ModelDTO[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandDTO | null>(null);
  const [plateError, setPlateError] = useState<string | null>(null);

  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode } = useModelManager();

  // Khi initialVehicle (từ edit order) thay đổi -> set lại state vehicle
  useEffect(() => {
    if (!initialVehicle) return;
    setVehicle(initialVehicle);

    // Nếu có brandCode, chọn lại brand tương ứng
    if (initialVehicle.brandCode) {
      const brand = brands.find((b) => b.code === initialVehicle.brandCode);
      if (brand) {
        setSelectedBrand(brand);
      }
    }
  }, [initialVehicle, brands]);

  //Lấy danh sach brand khi mount
  useEffect(() => {
    (async () => {
      setLoadingBrands(true);
      try {
        const data = await getAllBrands();
        setBrands(data);
      } finally {
        setLoadingBrands(false);
      }
    })();
  }, []);

  // khi đổi brand -> load models
  useEffect(() => {
    if (!selectedBrand) {
      setModels([]);
      return;
    }
    (async () => {
      setLoadingModels(true);
      try {
        const data = await getModelsByBrandCode(selectedBrand.code);
        setModels(data);
      } finally {
        setLoadingModels(false);
      }
    })();
  }, [selectedBrand]);

  // Tự động chọn xe có sẵn nếu biển số trùng
  useEffect(() => {
    if (!customer?.vehicles?.length || !vehicle?.licensePlate) return;
    const norm = (s: string) => s.replace(/\s/g, "").toLowerCase();
    const matched = customer.vehicles.find(
      (v) => norm(v.licensePlate) === norm(vehicle.licensePlate)
    );
    if (matched) selectExistingVehicle(matched);
  }, [brands]); // chờ brands xong để set selectedBrand

  // tự động điền size khi có modelCode và models đã load
  useEffect(() => {
    if (models.length && vehicle.modelCode && !vehicle.size) {
      const matched = models.find((m) => m.code === vehicle.modelCode);
      if (matched) {
        updateVehicle({ size: matched.size });
      }
    }
  }, [models]);

  // options cho hãng xe
  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.code, label: b.brandName, raw: b })),
    [brands]
  );

  // options cho mẫu xe
  const modelOptions = useMemo(
    () =>
      models.map((m) => ({
        value: m.code,
        label: m.modelName,
        size: m.size,
        raw: m,
      })),
    [models]
  );

  const updateVehicle = (patch: Partial<VehicleDTO>) =>
    setVehicle((prev) => ({ ...prev, ...patch }));

  const handleBrandSelect = (brandCode: string) => {
    const brand = brands.find((b) => b.code === brandCode) || null;
    setSelectedBrand(brand);
    updateVehicle({
      brandId: brand?.id ?? 0,
      brandCode: brand?.code ?? "",
      brandName: brand?.brandName ?? "",
      modelId: 0,
      modelCode: "",
      modelName: "",
      size: "",
    });
  };

  const handleModelSelect = (modelCode: string) => {
    const model = models.find((m) => m.code === modelCode);
    if (!model) return;
    updateVehicle({
      modelId: model.id,
      modelCode: model.code,
      modelName: model.modelName,
      size: model.size || "M",
    });
  };

  const selectExistingVehicle = (v: VehicleDTO) => {
    const brand = brands.find((b) => b.code === v.brandCode) || null;
    setSelectedBrand(brand || null);
    setVehicle(v);
  };

  const validateLicensePlate = (plate: string) => {
    if (plate && !isValidLicensePlate(plate)) {
      setPlateError("Biển số không đúng định dạng Việt Nam");
      return false;
    }
    setPlateError(null);
    return true;
  };

  const handleLicensePlateChange = (plate: string) => {
    setPlateError(null);
    updateVehicle({ licensePlate: plate });
  };

  const resetVehicle = (): VehicleDTO => ({
    id: "",
    licensePlate: "",
    brandId: 0,
    brandCode: "",
    brandName: "",
    modelId: 0,
    modelCode: "",
    modelName: "",
    size: "",
    imageUrl: "",
  });

  return {
    // state
    vehicle,
    brands,
    models,
    loadingBrands,
    loadingModels,
    selectedBrand,
    plateError,
    brandOptions,
    modelOptions,
    // actions
    updateVehicle,
    handleBrandSelect,
    handleModelSelect,
    selectExistingVehicle,
    validateLicensePlate,
    handleLicensePlateChange,
    resetVehicle,
  };
}
