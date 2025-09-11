"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceDetailResponse } from "@/types/CarUser";

interface Props {
  data: ServiceDetailResponse | null;
  open: boolean;
  onClose: () => void;
}

export function ServiceUsedDetailDialog({ data, open, onClose }: Props) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Chi tiết xe/dịch vụ</DialogTitle>
        </DialogHeader>

        {/* Thông tin khách + xe */}
        <div className="grid grid-cols-2 gap-6 border p-4 rounded-md">
          <div>
            <p>
              <span className="font-semibold">Tên:</span> {data.customerName}
            </p>
            <p>
              <span className="font-semibold">Số ĐT:</span> {data.phone}
            </p>
          </div>

          <div>
            <p>
              <span className="font-semibold">Biển số:</span> {data.licensePlate}
            </p>
            <p>
              <span className="font-semibold">Tên xe:</span> {data.vehicleName}
            </p>
          </div>
        </div>

        {/* Bảng dịch vụ */}
        <div className="mt-4">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-yellow-100">
              <tr>
                <th className="border border-gray-300 px-2 py-1 w-12">STT</th>
                <th className="border border-gray-300 px-2 py-1">Tên dịch vụ</th>
                <th className="border border-gray-300 px-2 py-1 w-40">Ngày vào trạm</th>
              </tr>
            </thead>
            <tbody>
              {data.services?.map((service, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-1">{service.name}</td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {service.checkinTime}
                  </td>
                </tr>
              ))}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="border border-gray-300 text-center">&nbsp;</td>
                  <td className="border border-gray-300">&nbsp;</td>
                  <td className="border border-gray-300">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}