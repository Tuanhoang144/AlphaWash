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
import { Employee } from "@/types/Employee";

interface EmployeeTableProps {
  employees: Employee[];
  onEditEmployee: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  onEditEmployee,
}: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Không có nhân viên nào để hiển thị.
      </div>
    );
  }
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Điện thoại</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-4 text-muted-foreground"
              >
                Không tìm thấy nhân viên nào.
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={String(employee.id)}>
                <TableCell className="font-medium">{employee.id}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.note || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditEmployee(employee)}
                    aria-label={`Chỉnh sửa ${employee.name}`}
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
