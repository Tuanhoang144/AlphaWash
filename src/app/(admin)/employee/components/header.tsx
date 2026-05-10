"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";

interface EmployeeManagementHeaderProps {
  onAddEmployee: () => void;
  onSearch: (searchTerm: string) => void;
}

export function EmployeeManagementHeader({
  onAddEmployee,
  onSearch,
}: EmployeeManagementHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <Input
        type="text"
        placeholder="Tìm kiếm theo tên, SĐT, CMND, trạng thái..."
        className="max-w-sm flex-grow mr-4"
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button onClick={onAddEmployee}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Thêm nhân viên mới
      </Button>
    </div>
  );
}
