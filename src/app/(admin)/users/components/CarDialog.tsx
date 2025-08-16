"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Car } from "@/types/CarUser";

interface CarDialogProps {
  car: Car | null;
  open: boolean;
  onClose: () => void;
}

export function CarDialog({ car, open, onClose }: CarDialogProps) {
  if (!car) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Thông tin chi tiết</DialogTitle>
          <DialogDescription>
            Thông tin xe và khách hàng
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <p className="text-sm text-gray-500">Biển số</p>
            <p className="font-medium">{car.licensePlate}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tên xe</p>
            <p className="font-medium">{car.vehicleName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Số lần sử dụng</p>
            <p className="font-medium">{car.serviceUsage}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ngày vào</p>
            <p className="font-medium">{car.checkinTime}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Khách hàng</p>
            <p className="font-medium">{car.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Số điện thoại</p>
            <p className="font-medium">{car.phone}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-500">Ghi chú</p>
            <p className="font-medium">{car.note || "-"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}