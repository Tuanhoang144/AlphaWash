"use client";

import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function BulkActionBar({ selectedCount, onClear, onDelete, onExport }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between rounded-xl border bg-primary/5 border-primary/20 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="size-6" onClick={onClear}>
          <X className="size-4" />
        </Button>
        <span className="text-sm font-medium">Đã chọn {selectedCount} khách hàng</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="size-3.5" /> Xuất đã chọn
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="size-3.5" /> Xóa đã chọn
        </Button>
      </div>
    </div>
  );
}
