"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product, ProductCategory } from "@/types/Product";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Product | null;
  categories: ProductCategory[];
  onSubmit: (data: Partial<Product>) => void;
};

export function ProductDialog({ open, onOpenChange, editing, categories, onSubmit }: Props) {
  const [productName, setProductName] = useState("");
  const [barcode, setBarcode] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [brand, setBrand] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [currentStock, setCurrentStock] = useState("");
  const [minStock, setMinStock] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [trackInventory, setTrackInventory] = useState(true);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editing) {
      setProductName(editing.productName || "");
      setBarcode(editing.barcode || "");
      setCategoryCode(editing.categoryCode || "");
      setBrand(editing.brand || "");
      setCostPrice(editing.costPrice?.toString() || "");
      setSellingPrice(editing.sellingPrice?.toString() || "");
      setMinPrice(editing.minPrice?.toString() || "");
      setCurrentStock(editing.currentStock?.toString() || "");
      setMinStock(editing.minStock?.toString() || "");
      setUnit(editing.unit || "");
      setLocation(editing.location || "");
      setTrackInventory(editing.trackInventory ?? true);
      setDescription(editing.description || "");
    } else {
      resetForm();
    }
  }, [editing, open]);

  const resetForm = () => {
    setProductName("");
    setBarcode("");
    setCategoryCode("");
    setBrand("");
    setCostPrice("");
    setSellingPrice("");
    setMinPrice("");
    setCurrentStock("0");
    setMinStock("5");
    setUnit("cái");
    setLocation("");
    setTrackInventory(true);
    setDescription("");
  };

  const handleSubmit = () => {
    if (!productName.trim()) return;
    onSubmit({
      productName,
      barcode: barcode || undefined,
      categoryCode: categoryCode || undefined,
      brand: brand || undefined,
      costPrice: costPrice ? Number(costPrice) : undefined,
      sellingPrice: sellingPrice ? Number(sellingPrice) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      currentStock: currentStock ? Number(currentStock) : 0,
      minStock: minStock ? Number(minStock) : 5,
      unit: unit || undefined,
      location: location || undefined,
      trackInventory,
      description: description || undefined,
      isActive: true,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="col-span-2">
            <label className="text-sm font-medium">Tên sản phẩm *</label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Tên sản phẩm" />
          </div>

          <div>
            <label className="text-sm font-medium">Barcode</label>
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Mã vạch" />
          </div>

          <div>
            <label className="text-sm font-medium">Danh mục</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.code} value={c.code}>{c.categoryName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Thương hiệu</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Thương hiệu" />
          </div>

          <div>
            <label className="text-sm font-medium">Đơn vị</label>
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="chai, cái, hộp..." />
          </div>

          <div>
            <label className="text-sm font-medium">Giá nhập</label>
            <Input type="number" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0" />
          </div>

          <div>
            <label className="text-sm font-medium">Giá bán</label>
            <Input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0" />
          </div>

          <div>
            <label className="text-sm font-medium">Giá tối thiểu</label>
            <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" />
          </div>

          <div>
            <label className="text-sm font-medium">Vị trí lưu kho</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kệ A1..." />
          </div>

          <div>
            <label className="text-sm font-medium">Tồn kho hiện tại</label>
            <Input type="number" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium">Tồn kho tối thiểu</label>
            <Input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={trackInventory}
              onChange={(e) => setTrackInventory(e.target.checked)}
              className="w-4 h-4"
            />
            <label className="text-sm">Theo dõi tồn kho</label>
          </div>

          <div className="col-span-2">
            <label className="text-sm font-medium">Mô tả</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 text-sm min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả sản phẩm..."
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
