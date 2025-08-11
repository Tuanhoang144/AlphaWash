// File: components/header.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";

interface ServiceHeaderProp {
  onAddService: () => void;
  onSearch: (searchTerm: string) => void;
}

export default function ServiceManagementHeader({ onAddService, onSearch }: ServiceHeaderProp) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <Input
        type="text"
        placeholder="Tìm kiếm theo tên dịch vụ"
        className="max-w-sm w-full"
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button disabled variant="default" onClick={onAddService} className="w-full md:w-auto text-white">
        <PlusIcon className="mr-2 h-4 w-4" />
        Thêm dịch vụ mới
      </Button>
    </div>
  );
}