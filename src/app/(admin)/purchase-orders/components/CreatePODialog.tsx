"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Supplier, Product } from "@/types/Product";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type POItem = { productCode: string; quantity: number; unitCost: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suppliers: Supplier[];
  products: Product[];
  onSubmit: (data: { supplierCode: string; invoiceNumber?: string; notes?: string; items: POItem[] }) => void;
};

export function CreatePODialog({ open, onOpenChange, suppliers, products, onSubmit }: Props) {
  const [supplierCode, setSupplierCode] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POItem[]>([{ productCode: "", quantity: 1, unitCost: 0 }]);

  const addItem = () => setItems([...items, { productCode: "", quantity: 1, unitCost: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof POItem, value: string | number) => {
    const updated = [...items];
    (updated[idx] as Record<string, unknown>)[field] = value;
    setItems(updated);
  };

  const handleSubmit = () => {
    if (!supplierCode || items.length === 0 || items.some((i) => !i.productCode)) return;
    onSubmit({
      supplierCode,
      invoiceNumber: invoiceNumber || undefined,
      notes: notes || undefined,
      items: items.map((i) => ({ ...i, quantity: Number(i.quantity), unitCost: Number(i.unitCost) })),
    });
    setSupplierCode(""); setInvoiceNumber(""); setNotes("");
    setItems([{ productCode: "", quantity: 1, unitCost: 0 }]);
  };

  const total = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unitCost), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nhập hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nhà cung cấp *</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={supplierCode}
                onChange={(e) => setSupplierCode(e.target.value)}
              >
                <option value="">Chọn NCC</option>
                {suppliers.map((s) => (
                  <option key={s.code} value={s.code}>{s.supplierName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Số hóa đơn</label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="HD-xxx" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Danh sách sản phẩm</label>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Thêm dòng</Button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    className="flex-1 border rounded-md px-2 py-1.5 text-sm"
                    value={item.productCode}
                    onChange={(e) => updateItem(idx, "productCode", e.target.value)}
                  >
                    <option value="">Chọn SP</option>
                    {products.map((p) => (
                      <option key={p.code} value={p.code}>{p.productName}</option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    className="w-20"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    min="1"
                    placeholder="SL"
                  />
                  <Input
                    type="number"
                    className="w-28"
                    value={item.unitCost}
                    onChange={(e) => updateItem(idx, "unitCost", e.target.value)}
                    placeholder="Đơn giá"
                  />
                  <span className="text-sm w-24 text-right">
                    {new Intl.NumberFormat("vi-VN").format(Number(item.quantity) * Number(item.unitCost))}
                  </span>
                  {items.length > 1 && (
                    <Button size="icon" variant="ghost" onClick={() => removeItem(idx)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="text-right mt-2 font-semibold">
              Tổng: {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(total)}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Ghi chú</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[60px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
          <Button onClick={handleSubmit}>Tạo đơn</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
