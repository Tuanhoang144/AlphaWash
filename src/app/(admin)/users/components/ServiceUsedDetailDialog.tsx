"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceUsedDTO } from "@/types/CarUser";

interface Props {
  data: ServiceUsedDTO | null;
  open: boolean;
  onClose: () => void;
}

export function ServiceUsedDetailDialog({ data, open, onClose }: Props) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết xe/dịch vụ</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p><strong>Biển số:</strong> {data.licensePlate}</p>
          <p><strong>Tên xe:</strong> {data.vehicleName}</p>
          <p><strong>Số lần SD:</strong> {data.serviceUsage}</p>
          <p><strong>Ngày vào:</strong> {data.checkinTime || "-"}</p>
          <p><strong>Tên khách:</strong> {data.customerName}</p>
          <p><strong>Số ĐT:</strong> {data.phone}</p>
          <p><strong>Ghi chú:</strong> {data.note || "-"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}