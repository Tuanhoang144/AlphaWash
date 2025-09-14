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
import { EditIcon } from "lucide-react";
import { ServiceAll } from "@/types/ServiceAll";

interface Props {
  services: ServiceAll[];
  onEditService: (service: ServiceAll) => void;
}

export function ServiceTable({ services, onEditService }: Props) {
  if (services.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Không có dịch vụ nào để hiển thị.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Tên loại DV</TableHead>
            <TableHead>Mã loại DV</TableHead>
            <TableHead>Tên DV</TableHead>
            <TableHead>Mã DV</TableHead>
            <TableHead>Giá tiền</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Thời lượng</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((s, idx) => (
            <TableRow key={idx+ 1}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{s.serviceTypeName}</TableCell>
              <TableCell>{s.serviceTypeCode}</TableCell>
              <TableCell>{s.serviceName}</TableCell>
              <TableCell>{s.serviceCode}</TableCell>
              <TableCell>{s.price}</TableCell>
              <TableCell>{s.size}</TableCell>
              <TableCell>{s.duration}</TableCell>
              <TableCell>{s.note || "-"}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditService(s)}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
