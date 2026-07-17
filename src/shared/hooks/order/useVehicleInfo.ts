"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addToast } from "@heroui/toast";
import { useBrandManager } from "@/services/useBrandManager";
import { useModelManager } from "@/services/useModelManager";
import { useVehicleService } from "@/services/useVehicleService";
import type {
  BrandDTO,
  CustomerDTO,
  ModelDTO,
  VehicleDTO,
} from "@/types/OrderResponse";
import { isValidLicensePlate } from "@/shared/utils/checkValidate";

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
  const [plateBlocked, setPlateBlocked] = useState(false);

  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode } = useModelManager();
  const { linkCustomerToVehicle, transferVehicleOwnership } = useVehicleService();

  // Biển số hiện đang gán cho vehicle.id — dùng để bỏ qua kiểm tra trùng khi không đổi biển số
  const committedPlateRef = useRef<string>("");
  const committedIdRef = useRef<string>("");

  useEffect(() => {
    if (vehicle.id && vehicle.id !== committedIdRef.current) {
      committedIdRef.current = vehicle.id;
      committedPlateRef.current = vehicle.licensePlate;
    } else if (!vehicle.id) {
      committedIdRef.current = "";
      committedPlateRef.current = "";
    }
  }, [vehicle.id, vehicle.licensePlate]);

  // Khi initialVehicle (từ edit order) thay đổi -> set lại state vehicle
  useEffect(() => {
    if (!initialVehicle) return;

    setVehicle((prev) => {
      if (prev === initialVehicle) return prev;
      const same =
        prev.id === initialVehicle.id &&
        prev.licensePlate === initialVehicle.licensePlate &&
        prev.brandCode === initialVehicle.brandCode &&
        prev.modelCode === initialVehicle.modelCode &&
        prev.size === initialVehicle.size;
      if (same) return prev;
      return initialVehicle;
    });

    if (initialVehicle.brandCode) {
      const brand = brands.find((b) => b.code === initialVehicle.brandCode);
      if (brand) setSelectedBrand(brand);
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
    setPlateBlocked(false);
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

  // Xe trùng biển số nhưng chưa gắn khách hàng -> liên kết thay vì tạo mới
  const handleVehicleLinked = async (vehicleId: string, linkedVehicle: VehicleDTO) => {
    selectExistingVehicle(linkedVehicle);
    if (customer?.id) {
      try {
        await linkCustomerToVehicle(vehicleId, customer.id);
        addToast({
          title: "Đã liên kết",
          description: "Xe đã được liên kết với khách hàng hiện tại.",
          color: "success",
        });
      } catch {
        addToast({
          title: "Lỗi",
          description: "Không thể liên kết xe với khách hàng.",
          color: "danger",
        });
      }
    }
  };

  // Xe trùng biển số đã có chủ -> chuyển quyền sở hữu sang khách hàng hiện tại
  const handleTransferRequested = async (vehicleId: string, otherVehicle: VehicleDTO) => {
    if (!customer?.id) {
      addToast({
        title: "Chưa chọn khách hàng",
        description: "Vui lòng chọn hoặc tạo khách hàng trước khi chuyển quyền sở hữu xe.",
        color: "warning",
      });
      return;
    }
    try {
      await transferVehicleOwnership(vehicleId, customer.id);
      selectExistingVehicle(otherVehicle);
      addToast({
        title: "Đã chuyển quyền sở hữu",
        description: "Xe đã được chuyển sang khách hàng hiện tại.",
        color: "success",
      });
    } catch {
      addToast({
        title: "Lỗi",
        description: "Không thể chuyển quyền sở hữu xe.",
        color: "danger",
      });
    }
  };

  const handlePlateConfirmed = () => {
    // Biển số hợp lệ, không trùng — không cần xử lý thêm
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
    plateBlocked,
    brandOptions,
    modelOptions,
    excludePlate: committedPlateRef.current || undefined,
    // actions
    updateVehicle,
    handleBrandSelect,
    handleModelSelect,
    selectExistingVehicle,
    validateLicensePlate,
    handleLicensePlateChange,
    handleVehicleLinked,
    handleTransferRequested,
    handlePlateConfirmed,
    setPlateBlocked,
    resetVehicle,
  };
}
