"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Employee } from "@/types/Employee";

interface EmployeeTableProps {
  employees: Employee[];
  onEditEmployee: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  onEditEmployee,
}: EmployeeTableProps) {
  const workStatusOptions = [
    { value: "Working", label: "Đang làm việc" },
    { value: "OnLeave", label: "Nghỉ phép" },
    { value: "Resigned", label: "Đã nghỉ việc" },
  ];

  const getWorkStatusLabel = (value?: string) => {
    if (!value) return "-";
    const found = workStatusOptions.find((o) => o.value === value);
    return found ? found.label : value;
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Logic lọc nhân viên theo tên và số điện thoại
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm)
    );
  }, [employees, searchTerm]);

  // Logic phân trang
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset về trang 1 khi tìm kiếm hoặc thay đổi số bản ghi/trang
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Tính toán dải số trang hiển thị (tối đa 5 trang, có ... nếu cần)
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let pages = [];
    if (currentPage <= 3) {
      pages = [1, 2, 3, 4, "...", totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    } else {
      pages = [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
    return pages;
  };

  if (employees.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Không có nhân viên nào để hiển thị.
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Table */}
      <div className="rounded-md border w-full">
        <div>
          <div>
            <Table className="w-full table-auto border-collapse sticky top-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    ID
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Tên
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Điện thoại
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Ngân hàng
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Số tài khoản
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Ngày sinh
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    CMND/CCCD
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Ngày vào làm
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Trạng thái
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm">
                    Ghi chú
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white z-20 shadow-sm text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((employee) => (
                  <TableRow key={employee.id}>
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
                    <TableCell>
                      {getWorkStatusLabel(employee.workStatus)}
                    </TableCell>
                    <TableCell>{employee.note || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEditEmployee(employee)}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination - UI rõ ràng theo mẫu */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 text-sm">
          <span>Hiển thị</span>
          <select
            className="border rounded px-2 py-1 focus:outline-none"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>bản ghi</span>
          <span className="ml-4">
            Tổng: <b>{filteredEmployees.length}</b> kết quả
          </span>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              aria-label="Trang đầu"
            >
              {"<<"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              aria-label="Trước"
            >
              {"<"}
            </Button>
            {/* Số trang, tối đa 5 số, có ... nếu cần */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={"ellipsis-" + idx}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                  aria-label={`Trang ${page}`}
                  className={
                    page === currentPage ? "font-bold border-primary" : ""
                  }
                >
                  {page}
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              aria-label="Sau"
            >
              {">"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              aria-label="Trang cuối"
            >
              {">>"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
