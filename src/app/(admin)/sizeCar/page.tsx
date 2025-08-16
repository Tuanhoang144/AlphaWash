"use client";

import { useEffect, useState } from "react";
import { CarSize } from "@/types/CarSize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarSizeTable } from "./car-sze/CarTable";
import { CarSizeDialog } from "./car-sze/CarSizeDialog";
import { useCarSizeManager } from "@/services/userCarSizeManager";

export default function CarSizePage() {
  const { carSizes, getAllCarSizes, addCarSize, updateCarSize, deleteCarSize } = useCarSizeManager();
  const [data, setData] = useState<CarSize[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<CarSize | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllCarSizes().then(setData);
  }, [carSizes, getAllCarSizes]);

  const handleAdd = () => {
    setEditing(null);
    setOpenDialog(true);
  };

  const handleEdit = (carSize: CarSize) => {
    setEditing(carSize);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCarSize(id);
  };

  const handleSubmit = async (form: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">, id?: number) => {
    if (id) {
      await updateCarSize(id, form);
    } else {
      await addCarSize(form);
    }
  };

  const filtered = data.filter(c =>
    c.modelCode.toLowerCase().includes(search.toLowerCase()) ||
    c.brandName.toLowerCase().includes(search.toLowerCase()) ||
    c.modelName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Quản lý Size xe</h1>
      <div className="flex items-center justify-between">
        <Input
          placeholder="Tìm kiếm theo tên xe, hãng, mã..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAdd}>Thêm mới</Button>
      </div>
      <CarSizeTable carSizes={filtered} onEdit={handleEdit} onDelete={handleDelete} />
      <CarSizeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  );
}