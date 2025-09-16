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
            <TableHead>ID</TableHead>
            <TableHead>Tên</TableHead>
            <TableHead>Điện thoại</TableHead>
            <TableHead>Ngân hàng</TableHead>
            <TableHead>Số tài khoản</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead>CMND/CCCD</TableHead>
            <TableHead>Ngày vào làm</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ghi chú</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee, id) => (
            <TableRow key={id + 1}>
              <TableCell>{employee.id}</TableCell>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.phone}</TableCell>
              <TableCell>{employee.bankName}</TableCell>
              <TableCell>{employee.bankAccount}</TableCell>
              <TableCell>
                {employee.dateOfBirth
                  ? new Date(employee.dateOfBirth).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>{employee.identityNumber}</TableCell>
              <TableCell>
                {employee.joinDate
                  ? new Date(employee.joinDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>{employee.workStatus}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
