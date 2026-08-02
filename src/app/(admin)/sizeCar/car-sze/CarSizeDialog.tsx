"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarSize } from "@/types/CarSize";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

interface CarSizeDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">,
    id?: number,
  ) => void;
  initialData?: CarSize | null;
}

export function CarSizeDialog({
  open,
  onClose,
  onSubmit,
  initialData,
}: CarSizeDialogProps) {
  const [modelCode, setModelCode] = useState("");
  const [size, setSize] = useState("");
  const [note, setNote] = useState("");
  console.log(initialData?.id);
  useEffect(() => {
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
          <DialogTitle>
            {initialData ? "Sửa size xe" : "Thêm size xe"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Hãng xe</Label>
            <Input
              id="brand-name"
              disabled
              placeholder="Hãng xe"
              value={initialData?.brandName}
              onChange={(e) => setModelCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="model-name">Dòng xe</Label>
            <Input
              id="model-name"
              disabled
              placeholder="Dòng xe"
              value={initialData?.modelName}
              onChange={(e) => setModelCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Size xe</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger id="size" className="w-full">
                <SelectValue placeholder="Chọn size xe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="M">M</SelectItem>
                <SelectItem value="L">L</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Input
              id="note"
              placeholder="Ghi chú"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>{"Lưu"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
