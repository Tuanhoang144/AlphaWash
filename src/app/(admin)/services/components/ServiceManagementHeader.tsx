"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";

interface Props {
  onAddService: () => void;
  onSearch: (searchTerm: string) => void;
}

export function ServiceManagementHeader({ onAddService, onSearch }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <Input
        type="text"
        placeholder="Tìm kiếm theo tên hoặc mã dịch vụ..."
        className="max-w-sm flex-grow mr-4"
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button onClick={onAddService}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Thêm dịch vụ mới
      </Button>
    </div>
  );
}
