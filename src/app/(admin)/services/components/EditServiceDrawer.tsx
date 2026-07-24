"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
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
  service: ServiceItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<ServiceItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

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

export function EditServiceDrawer({ open, service, onOpenChange, onSave, onDelete }: Props) {
  const [form, setForm] = useState<Partial<ServiceItem>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (service) setForm({ ...service });
  }, [service]);

  const set = <K extends keyof ServiceItem>(key: K, value: ServiceItem[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!service) return;
    setSaving(true);
    try {
      await onSave(service.id, form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    if (!confirm(`Xóa dịch vụ "${service.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(service.id);
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!service) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chỉnh sửa dịch vụ</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          {/* Tên */}
          <div className="col-span-2 space-y-1">
            <Label>Tên dịch vụ *</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <Label>Danh mục *</Label>
            <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
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
            />
          </div>

          {/* Loại */}
          <div className="space-y-1">
            <Label>Loại</Label>
            <Input
              value={form.typeDetail ?? ""}
              onChange={(e) => set("typeDetail", e.target.value)}
            />
          </div>

          {/* Bảo hành */}
          <div className="space-y-1">
            <Label>Bảo hành</Label>
            <Input
              value={form.warranty ?? ""}
              onChange={(e) => set("warranty", e.target.value)}
            />
          </div>

          {/* Thứ tự */}
          <div className="space-y-1">
            <Label>Thứ tự hiển thị</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder ?? 0}
              onChange={(e) => set("sortOrder", Number(e.target.value))}
            />
          </div>

          {/* Giá S/M/L */}
          <div className="col-span-2">
            <p className="text-sm font-medium mb-2">Giá theo kích cỡ S/M/L</p>
            <div className="grid grid-cols-3 gap-2">
              <PriceInput label="Giá S" value={form.priceS} onChange={(v) => set("priceS", v)} />
              <PriceInput label="Giá M" value={form.priceM} onChange={(v) => set("priceM", v)} />
              <PriceInput label="Giá L" value={form.priceL} onChange={(v) => set("priceL", v)} />
            </div>
          </div>

          {/* Giá Sedan/SUV/Oversize */}
          <div className="col-span-2">
            <p className="text-sm font-medium mb-2">Giá theo loại xe</p>
            <div className="grid grid-cols-3 gap-2">
              <PriceInput label="Giá Sedan" value={form.priceSEDAN} onChange={(v) => set("priceSEDAN", v)} />
              <PriceInput label="Giá SUV" value={form.priceSUV} onChange={(v) => set("priceSUV", v)} />
              <PriceInput label="Giá Oversize" value={form.priceOverSize} onChange={(v) => set("priceOverSize", v)} />
            </div>
          </div>

          {/* Mô tả */}
          <div className="col-span-2 space-y-1">
            <Label>Mô tả</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-canBeBonus"
              checked={form.canBeBonus ?? false}
              onCheckedChange={(v) => set("canBeBonus", !!v)}
            />
            <Label htmlFor="edit-canBeBonus">Có thể tặng kèm</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-active"
              checked={form.active ?? true}
              onCheckedChange={(v) => set("active", !!v)}
            />
            <Label htmlFor="edit-active">Đang hoạt động</Label>
          </div>
        </div>

        <SheetFooter className="flex justify-between gap-2 pt-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting || saving}
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={saving || deleting}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
