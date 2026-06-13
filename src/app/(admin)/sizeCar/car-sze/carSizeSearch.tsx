"use client";

import { Input } from "@/components/ui/input";

interface CarSizeSearchProps {
  onSearch: (keyword: string) => void;
}

export function CarSizeSearch({ onSearch }: CarSizeSearchProps) {
  return (
    <Input
      placeholder="Tìm kiếm theo mã xe hoặc ghi chú..."
      className="w-72"
      onChange={(e) => onSearch(e.target.value)}
    />
  );
}