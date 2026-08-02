"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Select } from "antd";
import { CreateCarSizeRequest } from "@/types/CarSize";

//Dùng để hiển thị ở Select
interface Brand {
  id: string;
  name: string;
}

interface CarSizeCreateDialogProps {
  open: boolean;
  onClose: () => void;
  brands: Brand[];
  onSubmit: (data: CreateCarSizeRequest) => void;
}

const SIZE_OPTIONS = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
];

export function CarSizeCreateDialog({
  open,
  onClose,
  onSubmit,
  brands,
}: CarSizeCreateDialogProps) {
  const [brandCode, setBrandCode] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [size, setSize] = useState("");
  const [note, setNote] = useState("");
  const [isManualBrand, setIsManualBrand] = useState(false);

  const reset = () => {
    setBrandCode(null);
    setBrandName("");
    setIsManualBrand(false);
    setModelName("");
    setSize("");
    setNote("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!brandName.trim()) return;
    if (!modelName.trim()) return;
    if (!size) return;

    onSubmit({
      brandCode: brandCode,
      brandName: brandName.trim(),
      modelName: modelName.trim(),
      size,
      note: note.trim(),
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Thêm Size xe</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Hãng xe</Label>

            {!isManualBrand ? (
              <>
                <Select
                  showSearch
                  optionFilterProp="label"
                  className="w-full"
                  placeholder="Chọn hãng xe..."
                  getPopupContainer={(trigger) =>
                    trigger.closest(".ant-select")!
                  }
                  value={brandCode ?? undefined}
                  onChange={(value) => {
                    const brand = brands.find((b) => b.id === value);

                    setBrandCode(brand?.id ?? null);
                    setBrandName(brand?.name ?? "");
                  }}
                  options={brands.map((b) => ({
                    value: b.id,
                    label: b.name,
                  }))}
                />

                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    setBrandCode(null);
                    setBrandName("");
                    setIsManualBrand(true);
                  }}
                >
                  Không tìm thấy hãng xe? Nhập thủ công
                </button>
              </>
            ) : (
              <>
                <Input
                  placeholder="Nhập tên hãng xe..."
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />

                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    setBrandCode(null);
                    setBrandName("");
                    setIsManualBrand(false);
                  }}
                >
                  ← Chọn từ danh sách
                </button>
              </>
            )}
          </div>

          <div>
            <Label className="mb-2">Tên xe</Label>

            <Input
              placeholder="Ví dụ: Camry, CX-5..."
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-2">Size</Label>

            <Select
              className="w-full"
              placeholder="Chọn size"
              getPopupContainer={(trigger) => trigger.closest(".ant-select")!}
              value={size || undefined}
              onChange={setSize}
              options={SIZE_OPTIONS}
            />
          </div>

          <div>
            <Label className="mb-2">Ghi chú</Label>

            <Input
              placeholder="Nhập ghi chú..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>

          <Button onClick={handleSubmit}>Thêm mới</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
