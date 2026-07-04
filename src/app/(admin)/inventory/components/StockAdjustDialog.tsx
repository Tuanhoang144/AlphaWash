"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/types/Product";
import { useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSubmit: (data: { productCode: string; quantity: number; type: string; notes?: string }) => void;
};

export function StockAdjustDialog({ open, onOpenChange, products, onSubmit }: Props) {
  const [productCode, setProductCode] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("STOCK_IN");
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    if (!productCode || !quantity) return;
    onSubmit({ productCode, quantity: Number(quantity), type, notes: notes || undefined });
    setProductCode(""); setQuantity(""); setType("STOCK_IN"); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium">Sản phẩm *</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((p) => (
                <option key={p.code} value={p.code}>{p.productName} ({p.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Loại giao dịch *</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="STOCK_IN">Nhập kho</option>
              <option value="STOCK_OUT">Xuất kho</option>
              <option value="ADJUSTMENT">Điều chỉnh (set số lượng)</option>
              <option value="RETURN">Trả hàng</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Số lượng *</label>
            <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" min="0" />
          </div>
          <div>
            <label className="text-sm font-medium">Ghi chú</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Lý do điều chỉnh..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Xác nhận</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
