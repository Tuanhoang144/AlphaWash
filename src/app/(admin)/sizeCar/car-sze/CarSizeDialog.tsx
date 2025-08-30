"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CarSize } from "@/types/CarSize";
import { useEffect, useState } from "react";

interface CarSizeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">, id?: number) => void;
  initialData?: CarSize | null;
}

export function CarSizeDialog({ open, onClose, onSubmit, initialData }: CarSizeDialogProps) {
  const [modelCode, setModelCode] = useState("");
  const [size, setSize] = useState("");
  const [note, setNote] = useState("");
  console.log(initialData?.id)
  useEffect(  () => {
    if (initialData) {
      setModelCode(initialData.modelCode);
      setSize(initialData.size);
      setNote(initialData.note || "");
    } else {
      setModelCode("");
      setSize("");
      setNote("");
    }
  }, [initialData]);

  const handleSubmit = () => {
    onSubmit({ modelCode, size, note }, initialData?.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Sửa size xe" : "Thêm size xe"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input disabled placeholder="Mã xe" value={modelCode} onChange={(e) => setModelCode(e.target.value)} />
          <Input placeholder="Size xe" value={size} onChange={(e) => setSize(e.target.value)} />
          <Input placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button onClick={handleSubmit}>{ "Lưu"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}