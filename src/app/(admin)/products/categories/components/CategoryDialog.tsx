"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductCategory } from "@/types/Product";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ProductCategory | null;
  onSubmit: (data: Partial<ProductCategory>) => void;
};

export function CategoryDialog({ open, onOpenChange, editing, onSubmit }: Props) {
  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editing) {
      setCategoryName(editing.categoryName || "");
      setColor(editing.color || "#3b82f6");
      setDisplayOrder(editing.displayOrder?.toString() || "0");
      setIsActive(editing.isActive ?? true);
    } else {
      setCategoryName("");
      setColor("#3b82f6");
      setDisplayOrder("0");
      setIsActive(true);
    }
  }, [editing, open]);

  const handleSubmit = () => {
    if (!categoryName.trim()) return;
    onSubmit({ categoryName, color, displayOrder: Number(displayOrder), isActive });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Chỉnh sửa danh mục" : "Thêm danh mục"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Tên danh mục *</label>
            <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Tên danh mục" />
          </div>
          <div>
            <label className="text-sm font-medium">Màu sắc</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded border" />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Thứ tự hiển thị</label>
            <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
            <label className="text-sm">Hoạt động</label>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>{editing ? "Cập nhật" : "Thêm mới"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
