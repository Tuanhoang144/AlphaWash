// File: components/table.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditIcon, TrashIcon } from "lucide-react";
import { Service } from "@/types/Service";

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

export function ServiceTable({ services, onEdit, onDelete }: ServiceTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">STT</TableHead>
            <TableHead className="text-center">Tên loại DV</TableHead>
            <TableHead className="text-center">Mã loại DV</TableHead>
            <TableHead className="text-center">Tên DV</TableHead>
            <TableHead className="text-center">Mã DV</TableHead>
            <TableHead className="text-center">Giá tiền</TableHead>
            <TableHead className="text-center">Size</TableHead>
            <TableHead className="text-center">Thời lượng</TableHead>
            <TableHead className="text-center">Ghi chú</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s, index) => (
            <TableRow key={s.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="text-center">{s.serviceType.serviceTypeName}</TableCell>
              <TableCell className="text-center">{s.serviceType.code}</TableCell>
              <TableCell className="text-center">{s.serviceName}</TableCell>
              <TableCell className="text-center">{s.code}</TableCell>
              <TableCell className="text-center">{s.price.toLocaleString()} đ</TableCell>
              <TableCell className="text-center">{s.size}</TableCell>
              <TableCell className="text-center">{s.duration} phút</TableCell>
              <TableCell className="text-center">{s.note || "-"}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(s)}
                    aria-label={`Chỉnh sửa ${s.serviceName}`}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(s.id)}
                    aria-label={`Xóa ${s.serviceName}`}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
