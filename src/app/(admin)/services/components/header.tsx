import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";

interface ServiceHeaderProp {
  onAddService: () => void;
  onSearch: (searchTerm: string) => void;
}

export default function ServiceManagementHeader({onAddService, onSearch}: ServiceHeaderProp) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* Thay thế h1 bằng Input */}
      <Input
        type="text"
        placeholder="Tìm kiếm theo mã dịch vụ"
        className="max-w-sm flex-grow mr-4" // Make it long and take available space
        onChange={(e) => onSearch(e.target.value)}
      />
      <Button onClick={onAddService}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Thêm dịch vụ mới
      </Button>
    </div>
  );
}
