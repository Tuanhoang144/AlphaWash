"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCarSizeManager } from "@/services/userCarSizeManager";
import { CarSize } from "@/types/CarSize";
import { useEffect, useState } from "react";
import { CarSizeDialog } from "./car-sze/CarSizeDialog";
import { CarSizeTable } from "./car-sze/CarTable";

export default function CarSizePage() {
  const { carSizes, getAllCarSizes, addCarSize, updateCarSize, deleteCarSize } = useCarSizeManager();
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<CarSize | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAllCarSizes(); // load 1 lần khi mount
  }, [getAllCarSizes]);
  // const handleAdd = () => {
  //   setEditing(null);
  //   setOpenDialog(true);
  // };

  const handleEdit = (carSize: CarSize) => {
    setEditing(carSize);
    setOpenDialog(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCarSize(id);
  };

  const handleSubmit = async (
    form: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">,
    id?: number
  ) => {
      await updateCarSize(form);
  };

  const filtered = carSizes?.filter(
    (c) =>
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
        {/* <Button onClick={handleAdd}>Thêm mới</Button> */}
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