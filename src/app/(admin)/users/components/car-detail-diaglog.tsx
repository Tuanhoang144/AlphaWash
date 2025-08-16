"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car } from "@/types/CarUser";

interface CarDetailDialogProps {
  car: Car | null;
  open: boolean;
  onClose: () => void;
}

export function CarDetailDialog({ car, open, onClose }: CarDetailDialogProps) {
  if (!car) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết xe</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p><strong>Biển số:</strong> {car.licensePlate}</p>
          <p><strong>Tên xe:</strong> {car.vehicleName}</p>
          <p><strong>Số lần SD:</strong> {car.serviceUsage}</p>
          <p><strong>Ngày vào:</strong> {car.checkinTime}</p>
          <p><strong>Tên khách:</strong> {car.customerName}</p>
          <p><strong>Số ĐT:</strong> {car.phone}</p>
          <p><strong>Ghi chú:</strong> {car.note || "-"}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}