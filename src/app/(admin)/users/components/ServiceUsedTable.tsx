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
import { ServiceUsedDTO } from "@/types/CarUser";

interface Props {
  data: ServiceUsedDTO[];
  onEdit: (item: ServiceUsedDTO) => void;
  onDelete: (id: number) => void;
  onViewDetail: (item: ServiceUsedDTO) => void;
  page: number;
  pageSize: number;
}

export function ServiceUsedTable({
  data,
  onEdit,
  onDelete,
  onViewDetail,
  page,
  pageSize,
}: Props) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">STT</TableHead>
            <TableHead className="text-center">Biển số</TableHead>
            <TableHead className="text-center">Tên xe</TableHead>
            <TableHead className="text-center">Số lần SD</TableHead>
            <TableHead className="text-center">Ngày vào</TableHead>
            <TableHead className="text-center">Tên khách</TableHead>
            <TableHead className="text-center">Số ĐT</TableHead>
            <TableHead className="text-center">Ghi chú</TableHead>
            {/* <TableHead className="text-center">Thao tác</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c, index) => (
            <TableRow key={c.id}>
              <TableCell className="text-center">
                {(page - 1) * pageSize + index + 1}
              </TableCell>
              <TableCell>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => onViewDetail(c)}
                >
                  {c.licensePlate}
                </button>
              </TableCell>
              <TableCell className="text-center">{c.vehicleName}</TableCell>
              <TableCell className="text-center">{c.serviceUsage}</TableCell>
              <TableCell className="text-center">{c.checkinTime || "-"}</TableCell>
              <TableCell>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => onViewDetail(c)}
                >
                  {c.customerName}
                </button>
              </TableCell>
              <TableCell className="text-center">{c.phone}</TableCell>
              <TableCell className="text-center">{c.note || "-"}</TableCell>
              {/* <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button disabled variant="ghost" size="icon" onClick={() => onEdit(c)}>
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    onClick={() => onDelete(c.id)}
                  >
                    <TrashIcon className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}