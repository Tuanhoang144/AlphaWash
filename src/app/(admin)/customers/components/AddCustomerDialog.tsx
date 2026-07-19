"use client";

import { useState } from "react";
import { addToast } from "@heroui/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import LicensePlateInput from "@/shared/components/vehicle/LicensePlateInput";
import { useCustomerService } from "@/services/useCustomerService";
import { isValidVietnamesePhone } from "@/shared/utils/checkValidate";
import { CUSTOMER_GENDER_LABELS, type CreateCustomerPayload, type CustomerDetail, type CustomerGender } from "@/types/Customer";
import type { VehicleDTO } from "@/types/OrderResponse";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: CustomerDetail) => void;
}

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  gender: "" as CustomerGender | "",
  birthday: "",
  address: "",
  note: "",
};

export function AddCustomerDialog({ open, onOpenChange, onCreated }: AddCustomerDialogProps) {
  const { createCustomer, loading } = useCustomerService();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; vehicle?: string }>({});

  const [includeVehicle, setIncludeVehicle] = useState(false);
  const [plate, setPlate] = useState("");
  const [linkVehicleId, setLinkVehicleId] = useState<string | undefined>(undefined);
  const [plateBlocked, setPlateBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setIncludeVehicle(false);
    setPlate("");
    setLinkVehicleId(undefined);
    setPlateBlocked(false);
    onOpenChange(false);
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!form.name.trim()) next.name = "Tên khách hàng là bắt buộc";
    if (!form.phone.trim()) next.phone = "Số điện thoại là bắt buộc";
    else if (!isValidVietnamesePhone(form.phone)) next.phone = "Số điện thoại không hợp lệ";
    if (includeVehicle) {
      if (!plate.trim()) next.vehicle = "Vui lòng nhập biển số xe";
      else if (plateBlocked) next.vehicle = "Biển số này đã thuộc về khách hàng khác";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload: CreateCustomerPayload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        gender: form.gender || undefined,
        birthday: form.birthday || undefined,
        address: form.address.trim() || undefined,
        note: form.note.trim() || undefined,
        vehicle: includeVehicle
          ? { licensePlate: plate.trim(), linkVehicleId }
          : undefined,
      };
      const created = await createCustomer(payload);
      if (created) {
        addToast({
          title: "Thành công",
          description: "Đã tạo khách hàng mới.",
          color: "success",
        });
        onCreated(created);
        resetAndClose();
      }
    } catch (error: any) {
      addToast({
        title: "Lỗi",
        description: error?.message || "Không thể tạo khách hàng.",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : resetAndClose())}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm khách hàng mới</DialogTitle>
          <DialogDescription>Các trường có dấu * là bắt buộc.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-medium border-b pb-1.5">Thông tin khách hàng</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">
                  Tên khách hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="0912345678"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">Giới tính</Label>
                <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CUSTOMER_GENDER_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium">Ngày sinh</Label>
                <Input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => update("birthday", e.target.value)}
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-medium">Địa chỉ</Label>
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Địa chỉ khách hàng"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-medium">Ghi chú</Label>
                <Textarea
                  value={form.note}
                  onChange={(e) => update("note", e.target.value)}
                  placeholder="Ghi chú (tùy chọn)"
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-1.5">
              <h3 className="text-sm font-medium">Thêm xe cho khách hàng</h3>
              <Switch checked={includeVehicle} onCheckedChange={setIncludeVehicle} />
            </div>

            {includeVehicle && (
              <LicensePlateInput
                value={plate}
                onChange={(v) => {
                  setPlate(v);
                  setLinkVehicleId(undefined);
                }}
                onVehicleLinked={(vehicleId: string, _vehicle: VehicleDTO) => setLinkVehicleId(vehicleId)}
                onPlateConfirmed={() => setLinkVehicleId(undefined)}
                onTransferRequested={() =>
                  addToast({
                    title: "Không thể chuyển quyền",
                    description:
                      "Vui lòng tạo khách hàng trước, sau đó dùng chức năng chuyển quyền sở hữu xe từ trang chỉnh sửa.",
                    color: "warning",
                  })
                }
                onBlockChange={setPlateBlocked}
                error={errors.vehicle}
              />
            )}
          </div>
        </div>

        <DialogFooter className="pt-3 border-t">
          <Button variant="outline" onClick={resetAndClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Tạo khách hàng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
