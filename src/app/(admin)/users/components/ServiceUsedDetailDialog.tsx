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
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="font-semibold">Biển số</div>
          <div>{data.licensePlate}</div>

          <div className="font-semibold">Tên xe</div>
          <div>{data.vehicleName}</div>

          <div className="font-semibold">Số lần SD</div>
          <div>{data.serviceUsage}</div>

          <div className="font-semibold">Ngày vào</div>
          <div>{data.checkinTime || "-"}</div>

          <div className="font-semibold">Tên khách</div>
          <div>{data.customerName}</div>

          <div className="font-semibold">Số ĐT</div>
          <div>{data.phone}</div>

          <div className="font-semibold">Ghi chú</div>
          <div>{data.note || "-"}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
