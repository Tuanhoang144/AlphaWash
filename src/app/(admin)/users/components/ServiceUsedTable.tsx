"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceUsedDTO } from "@/types/CarUser";
import { EditIcon, TrashIcon } from "lucide-react";

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
  onViewDetail,
  page,
  onEdit,
  onDelete,
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c, index) => (
            <TableRow key={index + 1}>
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
              <TableCell className="text-center"> 
                <div className="flex justify-center space-x-2"> 
                {/* <Button disabled variant="ghost" size="icon" onClick={() => onEdit(c)}> <EditIcon className="h-4 w-4" /> </Button> 
                <Button variant="ghost" size="icon" disabled onClick={() => onDelete(index + 1)} > <TrashIcon className="h-4 w-4 text-red-500" /> </Button> */}
                 </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}