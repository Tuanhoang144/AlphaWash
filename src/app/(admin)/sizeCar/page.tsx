"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCarSizeManager } from "@/services/userCarSizeManager";
import { CarSize } from "@/types/CarSize";
import { useEffect, useState } from "react";
import { CarSizeDialog } from "./car-sze/CarSizeDialog";
import { CarSizeTable } from "./car-sze/CarTable";

export default function CarSizePage() {
  const { carSizes, getAllCarSizes, updateCarSize, deleteCarSize } = useCarSizeManager();
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<CarSize | null>(null);
  const [search, setSearch] = useState("");

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    getAllCarSizes();
  }, [getAllCarSizes]);

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

  // Lọc + phân trang
  const filtered = carSizes?.filter(
    (c) =>
      c.modelCode.toLowerCase().includes(search.toLowerCase()) ||
      c.brandName.toLowerCase().includes(search.toLowerCase()) ||
      c.modelName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Quản lý Size xe</h1>

      <div className="flex items-center justify-between">
        <Input
          placeholder="Tìm kiếm theo tên xe, hãng, mã..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // reset về trang 1 khi search
          }}
          className="max-w-sm"
        />
      </div>

      <CarSizeTable carSizes={paginated} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trang trước
          </Button>
          <span className="flex items-center">Trang {page} / {totalPages}</span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}

      <CarSizeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleSubmit}
        initialData={editing}
      />
    </div>
  );
}