"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, UserX, UserPlus } from "lucide-react";
import { useCustomerManager } from "@/services/useCustomerManager";
import { useBrandManager } from "@/services/useBrandManager";
import { useModelManager } from "@/services/useModelManager";
import { useVehicleService } from "@/services/useVehicleService";
import { CustomerDTO, VehicleDTO } from "@/types/OrderResponse";
import LicensePlateInput from "@/shared/components/vehicle/LicensePlateInput";

interface QuickCustomerModalProps {
  open: boolean;
  defaultPlate: string;
  onClose: () => void;
  onCreated: (vehicle: VehicleDTO, customer: CustomerDTO | null) => void;
}

interface BrandItem {
  id: number;
  code: string;
  brandName: string;
}

interface ModelItem {
  id: number;
  code: string;
  modelName: string;
  size: string;
}

export default function QuickCustomerModal({
  open,
  defaultPlate,
  onClose,
  onCreated,
}: QuickCustomerModalProps) {
  const { createCustomer } = useCustomerManager();
  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode } = useModelManager();
  const { linkCustomerToVehicle, transferVehicleOwnership } = useVehicleService();

  const [walkIn, setWalkIn] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState(defaultPlate);
  const [brandCode, setBrandCode] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Duplicate-plate handling
  const [linkedVehicle, setLinkedVehicle] = useState<VehicleDTO | null>(null);
  const [pendingTransfer, setPendingTransfer] = useState<VehicleDTO | null>(null);
  const [plateBlocked, setPlateBlocked] = useState(false);
  const pendingModelCodeRef = useRef<string | null>(null);

  useEffect(() => {
    setPlate(defaultPlate);
  }, [defaultPlate]);

  useEffect(() => {
    if (open) {
      getAllBrands().then((data: BrandItem[]) => setBrands(data || []));
    } else {
      setLinkedVehicle(null);
      setPendingTransfer(null);
      setPlateBlocked(false);
    }
  }, [open, getAllBrands]);

  useEffect(() => {
    if (brandCode) {
      getModelsByBrandCode(brandCode).then((data: ModelItem[]) => {
        setModels(data || []);
        if (pendingModelCodeRef.current) {
          setModelCode(pendingModelCodeRef.current);
          pendingModelCodeRef.current = null;
        } else {
          setModelCode("");
        }
      });
    } else {
      setModels([]);
      setModelCode("");
    }
  }, [brandCode, getModelsByBrandCode]);

  const selectedModel = models.find((m) => m.code === modelCode);

  const adoptExistingVehicle = (vehicle: VehicleDTO) => {
    setPlate(vehicle.licensePlate);
    if (vehicle.brandCode && vehicle.brandCode === brandCode) {
      setModelCode(vehicle.modelCode || "");
    } else {
      pendingModelCodeRef.current = vehicle.modelCode || null;
      setBrandCode(vehicle.brandCode || "");
    }
  };

  const handleVehicleLinked = (_vehicleId: string, vehicle: VehicleDTO) => {
    setLinkedVehicle(vehicle);
    setPendingTransfer(null);
    adoptExistingVehicle(vehicle);
  };

  const handlePlateConfirmed = () => {
    setLinkedVehicle(null);
    setPendingTransfer(null);
  };

  const handleTransferRequested = (_vehicleId: string, vehicle: VehicleDTO) => {
    setPendingTransfer(vehicle);
    setLinkedVehicle(null);
    adoptExistingVehicle(vehicle);
  };

  async function handleSave() {
    if (!plate.trim()) {
      setError("Vui lòng nhập biển số xe");
      return;
    }
    if (!walkIn && (!name.trim() || !phone.trim())) {
      setError("Vui lòng điền tên và số điện thoại khách hàng");
      return;
    }
    if (plateBlocked && !pendingTransfer) {
      setError(
        "Biển số này đã có chủ sở hữu. Vui lòng liên kết hoặc chuyển quyền sở hữu trước khi tiếp tục."
      );
      return;
    }
    if (pendingTransfer && walkIn) {
      setError("Cần thông tin khách hàng để chuyển quyền sở hữu xe.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      let customerResult: CustomerDTO | null = null;

      if (!walkIn) {
        const customerData = await createCustomer({
          customerName: name.trim(),
          phone: phone.trim(),
          note: "",
        });
        if (!customerData) {
          setError("Không thể tạo khách hàng");
          return;
        }
        customerResult = {
          id: customerData.id,
          name: customerData.customerName || name.trim(),
          phone: customerData.phone || phone.trim(),
        };
      }

      const existingVehicle = linkedVehicle || pendingTransfer;

      if (customerResult && existingVehicle) {
        try {
          if (pendingTransfer) {
            await transferVehicleOwnership(pendingTransfer.id, customerResult.id);
          } else if (linkedVehicle) {
            await linkCustomerToVehicle(linkedVehicle.id, customerResult.id);
          }
        } catch {
          setError(
            pendingTransfer
              ? "Không thể chuyển quyền sở hữu xe"
              : "Không thể liên kết xe với khách hàng"
          );
          return;
        }
      }

      const selectedBrand = brands.find((b) => b.code === brandCode);
      const vehicle: VehicleDTO = existingVehicle
        ? {
            ...existingVehicle,
            customerId: customerResult?.id,
          }
        : {
            id: "",
            licensePlate: plate.trim(),
            brandId: selectedBrand?.id || 0,
            brandCode: brandCode,
            brandName: selectedBrand?.brandName || "",
            modelId: selectedModel?.id || 0,
            modelCode: modelCode,
            modelName: selectedModel?.modelName || "",
            size: selectedModel?.size || "M",
            imageUrl: "",
            customerId: customerResult?.id,
          };

      onCreated(vehicle, customerResult);
      setName("");
      setPhone("");
      setBrandCode("");
      setModelCode("");
      setWalkIn(false);
      setError("");
      setLinkedVehicle(null);
      setPendingTransfer(null);
      setPlateBlocked(false);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tạo");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Xe mới</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        {/* Walk-in toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWalkIn(false)}
            className={`flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              !walkIn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <UserPlus className="h-4 w-4" />
            Có khách hàng
          </button>
          <button
            type="button"
            onClick={() => setWalkIn(true)}
            className={`flex-1 h-11 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              walkIn
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <UserX className="h-4 w-4" />
            Khách vãng lai
          </button>
        </div>

        <div className="space-y-3">
          {/* Vehicle fields — always shown */}
          <LicensePlateInput
            value={plate}
            onChange={setPlate}
            onVehicleLinked={handleVehicleLinked}
            onPlateConfirmed={handlePlateConfirmed}
            onTransferRequested={handleTransferRequested}
            onBlockChange={setPlateBlocked}
            label="Biển số *"
            required
          />
          <div>
            <label className="text-sm font-medium text-muted-foreground">Hãng xe</label>
            <select
              value={brandCode}
              onChange={(e) => setBrandCode(e.target.value)}
              className="w-full h-12 px-4 mt-1 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Chọn hãng xe</option>
              {brands.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.brandName}
                </option>
              ))}
            </select>
          </div>
          {brandCode && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dòng xe</label>
              <select
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                className="w-full h-12 px-4 mt-1 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Chọn dòng xe</option>
                {models.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.modelName} (Size {m.size})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer fields — only when not walk-in */}
          {!walkIn && (
            <>
              <div className="border-t pt-3">
                <label className="text-sm font-medium text-muted-foreground">Tên khách hàng *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full h-12 px-4 mt-1 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Số điện thoại *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  className="w-full h-12 px-4 mt-1 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || (plateBlocked && !pendingTransfer)}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? "Đang tạo..." : walkIn ? "Tiếp tục" : "Tạo & Tiếp tục"}
        </button>
      </div>
    </div>
  );
}
