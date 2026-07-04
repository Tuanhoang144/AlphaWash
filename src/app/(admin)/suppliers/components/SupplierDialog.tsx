"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Supplier } from "@/types/Product";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Supplier | null;
  onSubmit: (data: Partial<Supplier>) => void;
};

export function SupplierDialog({ open, onOpenChange, editing, onSubmit }: Props) {
  const [supplierName, setSupplierName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (editing) {
      setSupplierName(editing.supplierName || "");
      setPhone(editing.phone || "");
      setEmail(editing.email || "");
      setAddress(editing.address || "");
      setTaxId(editing.taxId || "");
      setNotes(editing.notes || "");
      setIsActive(editing.isActive ?? true);
    } else {
      setSupplierName(""); setPhone(""); setEmail("");
      setAddress(""); setTaxId(""); setNotes(""); setIsActive(true);
    }
  }, [editing, open]);

  const handleSubmit = () => {
    if (!supplierName.trim()) return;
    onSubmit({ supplierName, phone, email, address, taxId, notes, isActive });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">Tên nhà cung cấp *</label>
            <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Tên NCC" />
          </div>
          <div>
            <label className="text-sm font-medium">Điện thoại</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0xxx..." />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@..." />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">Địa chỉ</label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Địa chỉ" />
          </div>
          <div>
            <label className="text-sm font-medium">Mã số thuế</label>
            <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="MST" />
          </div>
          <div className="flex items-center gap-2 self-end">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4" />
            <label className="text-sm">Hoạt động</label>
          </div>
          <div className="col-span-2">
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
          <Button onClick={handleSubmit}>{editing ? "Cập nhật" : "Thêm mới"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
