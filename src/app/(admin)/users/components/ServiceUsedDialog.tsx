"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ServiceUsedDTO } from "@/types/CarUser";

interface Props {
  data: ServiceUsedDTO | null;
  open: boolean;
  onClose: () => void;
  onSave: (d: any) => void; // schema update
}

export function ServiceUsedDialog({ data, open, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    licensePlate: data?.licensePlate || "",
    brandCode: "",
    modelCode: "",
    checkinTime: data?.checkinTime || "",
    customerName: data?.customerName || "",
    customerPhone: data?.phone || "",
    note: data?.note || "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{data ? "Cập nhật" : "Thêm mới"} xe/dịch vụ</DialogTitle>
          <DialogDescription>Nhập thông tin xe và khách hàng</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Input
            placeholder="Biển số"
            value={form.licensePlate}
            onChange={(e) => handleChange("licensePlate", e.target.value)}
          />
          <Input
            placeholder="Brand Code"
            value={form.brandCode}
            onChange={(e) => handleChange("brandCode", e.target.value)}
          />
          <Input
            placeholder="Model Code"
            value={form.modelCode}
            onChange={(e) => handleChange("modelCode", e.target.value)}
          />
          <Input
            type="datetime-local"
            value={form.checkinTime}
            onChange={(e) => handleChange("checkinTime", e.target.value)}
          />
          <Input
            placeholder="Tên khách hàng"
            value={form.customerName}
            onChange={(e) => handleChange("customerName", e.target.value)}
          />
          <Input
            placeholder="Số điện thoại"
            value={form.customerPhone}
            onChange={(e) => handleChange("customerPhone", e.target.value)}
          />
          <Input
            placeholder="Ghi chú"
            value={form.note}
            onChange={(e) => handleChange("note", e.target.value)}
          />
        </div>

        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleSave}
        >
          Lưu
        </button>
      </DialogContent>
    </Dialog>
  );
}