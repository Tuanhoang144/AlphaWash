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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceItem } from "@/types/Service";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "WASHING", label: "Rửa xe" },
  { value: "INTERIOR", label: "Nội thất" },
  { value: "POLISHING", label: "Đánh bóng" },
  { value: "GLASS", label: "Kính & Ceramic" },
  { value: "PPF", label: "PPF" },
  { value: "COMBO", label: "Combo" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<ServiceItem, "id">) => Promise<void>;
}

const emptyForm = (): Omit<ServiceItem, "id"> => ({
  name: "",
  category: "",
  brand: "",
  typeDetail: "",
  warranty: "",
  priceS: undefined,
  priceM: undefined,
  priceL: undefined,
  priceSEDAN: undefined,
  priceSUV: undefined,
  priceOverSize: undefined,
  canBeBonus: false,
  active: true,
  description: "",
  sortOrder: 0,
});

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (v?: number) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        placeholder="—"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        className="h-8 text-sm"
      />
    </div>
  );
}

export function AddServiceDialog({ open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.name || !form.category) return;
    setSaving(true);
    try {
      await onSave(form);
      setForm(emptyForm());
      onOpenChange(false);
    } catch {
      // Error already caught and toasted in page.tsx handleAdd.
      // Swallow here so dialog stays open and no unhandled rejection hides the toast.
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm dịch vụ mới</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">
          {/* Tên */}
          <div className="col-span-2 space-y-1">
            <Label>
              Tên dịch vụ <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="VD: Rửa xe cơ bản"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>
              Danh mục <span className="text-red-500">*</span>
            </Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thương hiệu */}
          <div className="space-y-1">
            <Label>Thương hiệu</Label>
            <Input
              value={form.brand ?? ""}
              onChange={(e) => set("brand", e.target.value)}
              placeholder="VD: Meguiar's"
            />
          </div>

          {/* Loại */}
          <div className="space-y-1">
            <Label>Loại</Label>
            <Input
              value={form.typeDetail ?? ""}
              onChange={(e) => set("typeDetail", e.target.value)}
              placeholder="VD: Foam, Nano, ..."
            />
          </div>

          {/* Bảo hành */}
          <div className="space-y-1">
            <Label>Bảo hành</Label>
            <Input
              value={form.warranty ?? ""}
              onChange={(e) => set("warranty", e.target.value)}
              placeholder="VD: 6 tháng"
            />
          </div>

          {/* Thứ tự */}
          <div className="space-y-1">
            <Label>Thứ tự hiển thị</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </div>

          {/* Giá S/M/L */}
          <div className="col-span-2">
            <p className="text-sm font-medium mb-2">Giá theo kích cỡ S/M/L</p>
            <div className="grid grid-cols-3 gap-3">
              <PriceInput
                label="Giá S"
                value={form.priceS}
                onChange={(v) => set("priceS", v)}
              />
              <PriceInput
                label="Giá M"
                value={form.priceM}
                onChange={(v) => set("priceM", v)}
              />
              <PriceInput
                label="Giá L"
                value={form.priceL}
                onChange={(v) => set("priceL", v)}
              />
            </div>
          </div>

          {/* Giá Sedan/SUV/Oversize */}
          <div className="col-span-2">
            <p className="text-sm font-medium mb-2">Giá theo loại xe</p>
            <div className="grid grid-cols-3 gap-3">
              <PriceInput
                label="Giá Sedan"
                value={form.priceSEDAN}
                onChange={(v) => set("priceSEDAN", v)}
              />
              <PriceInput
                label="Giá SUV"
                value={form.priceSUV}
                onChange={(v) => set("priceSUV", v)}
              />
              <PriceInput
                label="Giá Oversize"
                value={form.priceOverSize}
                onChange={(v) => set("priceOverSize", v)}
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="col-span-2 space-y-1">
            <Label>Mô tả</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              placeholder="Mô tả dịch vụ..."
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="canBeBonus"
              checked={form.canBeBonus}
              onCheckedChange={(v) => set("canBeBonus", !!v)}
            />
            <Label htmlFor="canBeBonus">Có thể tặng kèm</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="active"
              checked={form.active}
              onCheckedChange={(v) => set("active", !!v)}
            />
            <Label htmlFor="active">Đang hoạt động</Label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.category}>
            {saving ? "Đang lưu..." : "Thêm dịch vụ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
