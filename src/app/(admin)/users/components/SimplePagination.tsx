"use client";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function SimplePagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center space-x-2 mt-4">
      <Button
        variant="outline"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Trang trước
      </Button>

      <span className="flex items-center">
        Trang {page} / {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Trang sau
      </Button>
    </div>
  );
}