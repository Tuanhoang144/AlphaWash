"use client";

import { useEffect, useState } from "react";
import { addToast } from "@heroui/react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerService } from "@/services/useCustomerService";
import { useBrandManager, type BrandResponse } from "@/services/useBrandManager";
import { useModelManager, type ModelWithoutBrand } from "@/services/useModelManager";
import type { VehicleDTO } from "@/types/OrderResponse";

interface EditVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  vehicle: VehicleDTO | null;
  onUpdated: () => void;
}

export function EditVehicleDialog({
  open,
  onOpenChange,
  customerId,
  vehicle,
  onUpdated,
}: EditVehicleDialogProps) {
  const { updateVehicle } = useCustomerService();
  const { getAllBrands } = useBrandManager();
  const { getModelsByBrandCode } = useModelManager();

  const [licensePlate, setLicensePlate] = useState("");
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [models, setModels] = useState<ModelWithoutBrand[]>([]);
  const [brandId, setBrandId] = useState<number | undefined>(undefined);
  const [modelId, setModelId] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  // Load brands once
  useEffect(() => {
    if (open && brands.length === 0) {
      getAllBrands().then(setBrands).catch(() => {});
    }
  }, [open, getAllBrands, brands.length]);

  // Populate form when vehicle changes
  useEffect(() => {
    if (open && vehicle) {
      setLicensePlate(vehicle.licensePlate ?? "");
      setBrandId(vehicle.brandId || undefined);
      setModelId(vehicle.modelId || undefined);
      setModels([]);
      if (vehicle.brandCode) {
        getModelsByBrandCode(vehicle.brandCode)
          .then((data) => {
            setModels(data);
          })
          .catch(() => {});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, vehicle]);

  const handleBrandChange = async (val: string) => {
    const id = Number(val);
    setBrandId(id);
    setModelId(undefined);
    setModels([]);
    const brand = brands.find((b) => b.id === id);
    if (brand) {
      try {
        const data = await getModelsByBrandCode(brand.code);
        setModels(data);
      } catch {}
    }
  };

  const handleSave = async () => {
    if (!vehicle || !licensePlate.trim()) return;
    setSaving(true);
    try {
      await updateVehicle(customerId, vehicle.id, {
        licensePlate: licensePlate.trim(),
        brandId,
        modelId,
      });
      addToast({ title: "Thành công", description: "Đã cập nhật thông tin xe.", color: "success" });
      onOpenChange(false);
      onUpdated();
    } catch (error: any) {
      addToast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật xe.",
        color: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Sửa thông tin xe</DialogTitle>
          <DialogDescription>
            Cập nhật biển số, hãng xe và dòng xe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Biển số xe <span className="text-red-500">*</span>
            </Label>
            <Input
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="VD: 51G-123.45"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Hãng xe</Label>
              <Select
                value={brandId ? String(brandId) : ""}
                onValueChange={handleBrandChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Chọn hãng" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Dòng xe</Label>
              <Select
                value={modelId ? String(modelId) : ""}
                onValueChange={(v) => setModelId(Number(v))}
                disabled={!brandId || models.length === 0}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={!brandId ? "Chọn hãng trước" : "Chọn dòng"} />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || !licensePlate.trim()}>
            {saving && <Loader2 className="size-3.5 animate-spin" />}
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
