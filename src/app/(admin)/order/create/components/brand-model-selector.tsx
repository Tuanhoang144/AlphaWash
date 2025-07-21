"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import { Select } from "antd";
import { useBrandManager } from "@/services/useBrandManager";
import { useModelManager } from "@/services/useModelManager";
import {
  BrandDTO,
  CustomerDTO,
  ModelDTO,
  VehicleDTO,
} from "@/types/OrderResponse";

const { Option } = Select;

interface BrandModelSelectorProps {
  vehicle: VehicleDTO;
  onVehicleChange: (vehicle: VehicleDTO) => void;
  customer?: CustomerDTO;
}

export default function BrandModelSelector({
  vehicle,
  onVehicleChange,
  customer,
}: BrandModelSelectorProps) {
  const [brands, setBrands] = useState<BrandDTO[]>([]);
  const [models, setModels] = useState<ModelDTO[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<BrandDTO | null>(null);
  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode } = useModelManager();

  // Load brands on component mount
  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    console.log("Selected vehicle:", vehicle);
    console.log("Customer vehicles:", customer?.vehicles);
    if (!customer?.vehicles || !vehicle?.licensePlate) return;

    const matched = customer.vehicles.find(
      (v) =>
        v.licensePlate.replace(/\s/g, "").toLowerCase() ===
        vehicle.licensePlate.replace(/\s/g, "").toLowerCase()
    );

    if (matched) {
      selectExistingVehicle(matched);
    }
  }, [brands]);

  // Load models when brand changes
  useEffect(() => {
    if (selectedBrand) {
      loadModels(selectedBrand.code);
    } else {
      setModels([]);
    }
  }, [selectedBrand]);

  const loadBrands = async () => {
    setLoadingBrands(true);
    try {
      const brandsData = await getAllBrands();
      //map code => brandCode
      const mappedBrands = brandsData.map((brand: BrandDTO) => ({
        ...brand,
        brandCode: brand.code || "", // Ensure brandCode is set
      }));
      setBrands(mappedBrands);
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadModels = async (brandCode: string) => {
    setLoadingModels(true);
    try {
      const modelsData = await getModelsByBrandCode(brandCode);
      setModels(modelsData);
      return modelsData;
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setLoadingModels(false);
    }
  };

  const updateVehicle = (field: keyof VehicleDTO, value: string | number) => {
    onVehicleChange({
      ...vehicle,
      [field]: value,
    });
  };

  const selectExistingVehicle = async (existingVehicle: VehicleDTO) => {
    const loadedModels = await loadModels(existingVehicle.brandCode);
    const model = loadedModels.find(
      (m: ModelDTO) => m.code === existingVehicle.modelCode
    );

    const enrichedVehicle = {
      ...existingVehicle,
      size: existingVehicle.size || model?.size || "",
    };

    onVehicleChange(enrichedVehicle);

    const brand = brands.find((b) => b.code === existingVehicle.brandCode);
    if (brand) {
      setSelectedBrand(brand);
    }
  };

  const handleBrandSelect = (brandCode: string) => {
    const brand = brands.find((b) => b.code === brandCode);
    if (brand) {
      setSelectedBrand(brand);

      const nextVehicle = {
        ...vehicle,
        brandId: brand.id,
        brandCode: brand.code || "",
        brandName: brand.brandName || "",

        // reset model khi đổi hãng
        modelId: 0,
        modelCode: "",
        modelName: "",
        size: "",
      };

      onVehicleChange(nextVehicle);
    }
  };

  const handleModelSelect = (modelCode: string) => {
    const model = models.find((m) => m.code === modelCode);

    if (model) {
      const nextVehicle = {
        ...vehicle,
        modelId: model.id,
        modelCode: model.code || "",
        modelName: model.modelName || "",
        size: model.size || "M",
      };

      onVehicleChange(nextVehicle);
    }
  };

  const filterBrandOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  };

  const filterModelOption = (input: string, option: any) => {
    return (option?.label ?? "").toLowerCase().includes(input.toLowerCase());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Car className="h-4 w-4" />
        <Label className="font-medium">Thông tin xe</Label>
      </div>

      {customer?.vehicles && customer.vehicles.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm">Xe đã đăng ký:</Label>
          <div className="flex flex-wrap gap-2">
            {customer.vehicles.map((existingVehicle) => (
              <Badge
                key={existingVehicle.licensePlate}
                variant={
                  vehicle.id === existingVehicle.id ? "default" : "outline"
                }
                className="cursor-pointer"
                onClick={() => selectExistingVehicle(existingVehicle)}
              >
                {existingVehicle.licensePlate} - {existingVehicle.brandName}{" "}
                {existingVehicle.modelName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Biển số xe *</Label>
          <Input
            placeholder="29A-12345"
            value={vehicle.licensePlate ?? ""}
            onChange={(e) => updateVehicle("licensePlate", e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Hãng xe *</Label>
          <Select
            showSearch
            placeholder={loadingBrands ? "Đang tải..." : "Chọn hãng xe"}
            optionFilterProp="label"
            filterOption={filterBrandOption}
            value={vehicle.brandCode ?? undefined}
            onChange={handleBrandSelect}
            loading={loadingBrands}
            style={{ width: "100%" }}
            size="large"
          >
            {brands.map((brand) => (
              <Option key={brand.id} value={brand.code} label={brand.brandName}>
                {brand.brandName}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mẫu xe *</Label>
          <Select
            showSearch
            placeholder={
              !selectedBrand
                ? "Chọn hãng xe trước"
                : loadingModels
                ? "Đang tải..."
                : "Chọn mẫu xe"
            }
            optionFilterProp="label"
            filterOption={filterModelOption}
            value={vehicle.modelCode ?? undefined}
            onChange={handleModelSelect}
            disabled={!selectedBrand || loadingModels}
            loading={loadingModels}
            style={{ width: "100%" }}
            size="large"
          >
            {models.map((model) => (
              <Option key={model.id} value={model.code} label={model.modelName}>
                <div className="flex justify-between items-center">
                  <span>{model.modelName}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {model.size}
                  </Badge>
                </div>
              </Option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Kích thước xe</Label>
          <div className="p-2 bg-gray-50 rounded-md font-medium border">
            {vehicle.size || "Chọn mẫu xe để xem kích thước"}
          </div>
        </div>
      </div>

      {!selectedBrand && brands.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          💡 Vui lòng chọn hãng xe để xem danh sách các mẫu xe
        </div>
      )}
    </div>
  );
}
