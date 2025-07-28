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
import { Service } from "@/types/Service";

interface ServiceTableProp {
  service: Service[];
  onEditService: (service: Service) => void;
}

export function ServiceTable({
  service,
  onEditService,
}: ServiceTableProp) {
  if (service.length === 0) {
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
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Mã dịch vụ</TableHead>
            <TableHead>Tên dịch vụ</TableHead>
            <TableHead>Thời lượng</TableHead>
            <TableHead>Mã loại dịch vụ</TableHead>
            <TableHead>Tên loại dịch vụ</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {service.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-muted-foreground"
              >
                Không tìm thấy dịch vụ nào.
              </TableCell>
            </TableRow>
          ) : (
            service.map((service) => (
              <TableRow key={String(service.id)}>
                <TableCell className="font-medium">{service.id}</TableCell>
                <TableCell>{service.code}</TableCell>
                <TableCell>{service.serviceName}</TableCell>
                <TableCell>{service.duration}</TableCell>
                <TableCell>{service.serviceType?.code}</TableCell>
                <TableCell>{service.serviceType?.serviceTypeName}</TableCell>
                <TableCell>{service.note || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditEmployee(service)}
                    aria-label={`Chỉnh sửa ${service.serviceName}`}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
