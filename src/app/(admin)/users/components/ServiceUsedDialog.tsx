"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ServiceUsedDTO } from "@/types/CarUser";

interface Props {
  data: ServiceUsedDTO | null;
  open: boolean;
  onClose: () => void;
  onSave: (d: Omit<ServiceUsedDTO, "id">) => void;
}

export function ServiceUsedDialog({ data, open, onClose, onSave }: Props) {
  if (!open) return null;

  // TODO: thay Input form thực tế vào đây
  const handleSave = () => {
    const mock: Omit<ServiceUsedDTO, "id"> = {
      licensePlate: data?.licensePlate || "XX-0000",
      vehicleName: data?.vehicleName || "Xe mới",
      customerName: data?.customerName || "Khách mới",
      customerId: data?.customerId,
      phone: data?.phone || "",
      serviceUsage: data?.serviceUsage || 0,
      note: data?.note,
      checkinTime: data?.checkinTime,
    };
    onSave(mock);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{data ? "Cập nhật" : "Thêm mới"} xe/dịch vụ</DialogTitle>
          <DialogDescription>
            Nhập thông tin xe và khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">TODO: Form nhập dữ liệu</div>

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