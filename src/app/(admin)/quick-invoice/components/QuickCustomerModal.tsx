"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useCustomerManager } from "@/services/useCustomerManager";
import { useBrandManager } from "@/services/useBrandManager";
import { useModelManager } from "@/services/useModelManager";
import { CustomerDTO, VehicleDTO } from "@/types/OrderResponse";

interface QuickCustomerModalProps {
  open: boolean;
  defaultPlate: string;
  onClose: () => void;
  onCreated: (vehicle: VehicleDTO, customer: CustomerDTO) => void;
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

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState(defaultPlate);
  const [brandCode, setBrandCode] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [models, setModels] = useState<ModelItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlate(defaultPlate);
  }, [defaultPlate]);

  useEffect(() => {
    if (open) {
      getAllBrands().then((data: BrandItem[]) => setBrands(data || []));
    }
  }, [open, getAllBrands]);

  useEffect(() => {
    if (brandCode) {
      getModelsByBrandCode(brandCode).then((data: ModelItem[]) => setModels(data || []));
    } else {
      setModels([]);
    }
    setModelCode("");
  }, [brandCode, getModelsByBrandCode]);

  const selectedModel = models.find((m) => m.code === modelCode);

  async function handleSave() {
    if (!name.trim() || !phone.trim() || !plate.trim()) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const customerData = await createCustomer({
        customerName: name.trim(),
        phone: phone.trim(),
        note: "",
      });
      if (!customerData) {
        setError("Không thể tạo khách hàng");
        return;
      }

      const selectedBrand = brands.find((b) => b.code === brandCode);
      const vehicle: VehicleDTO = {
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
        customerId: customerData.id,
      };

      const customer: CustomerDTO = {
        id: customerData.id,
        name: customerData.customerName || name.trim(),
        phone: customerData.phone || phone.trim(),
      };

      onCreated(vehicle, customer);
      setName("");
      setPhone("");
      setBrandCode("");
      setModelCode("");
      setError("");
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tạo khách hàng");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Khách hàng mới</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Biển số *</label>
            <input
              type="text"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              className="w-full h-12 px-4 mt-1 rounded-xl border border-input bg-background text-base focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
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
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {saving ? "Đang tạo..." : "Tạo & Tiếp tục"}
        </button>
      </div>
    </div>
  );
}
