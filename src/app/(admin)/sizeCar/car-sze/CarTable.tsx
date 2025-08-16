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
import { CarSize } from "@/types/CarSize";

interface CarSizeTableProps {
  carSizes: CarSize[];
  onEdit: (carSize: CarSize) => void;
  onDelete: (id: number) => void;
}

export function CarSizeTable({ carSizes, onEdit, onDelete }: CarSizeTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">STT</TableHead>
            <TableHead className="text-center">Mã hãng</TableHead>
            <TableHead className="text-center">Mã xe</TableHead>
            <TableHead className="text-center">Hãng</TableHead>
            <TableHead className="text-center">Tên xe</TableHead>
            <TableHead className="text-center">Size xe</TableHead>
            <TableHead className="text-center">Ghi chú</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {carSizes.map((c, index) => (
            <TableRow key={c.id}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="text-center">{c.brandCode}</TableCell>
              <TableCell className="text-center">{c.modelCode}</TableCell>
              <TableCell className="text-center">{c.brandName}</TableCell>
              <TableCell className="text-center">{c.modelName}</TableCell>
              <TableCell className="text-center">{c.size}</TableCell>
              <TableCell className="text-center">{c.note || "-"}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(c)}>
                    <EditIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(c.id)}>
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