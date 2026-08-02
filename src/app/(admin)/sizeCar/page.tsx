"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCarSizeManager } from "@/services/userCarSizeManager";
import { CarSize, CreateCarSizeRequest } from "@/types/CarSize";
import { useEffect, useState } from "react";
import { CarSizeDialog } from "./car-sze/CarSizeDialog";
import { CarSizeTable } from "./car-sze/CarTable";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Plus, Search } from "lucide-react";
import { CarSizeCreateDialog } from "./car-sze/CarSizeCreateDialog";
import { set } from "date-fns";
import { addToast } from "@heroui/toast";

export default function CarSizePage() {
  const {
    carSizes,
    getAllCarSizes,
    updateCarSize,
    deleteCarSize,
    createCarSize,
  } = useCarSizeManager();
  const [openDialogEdit, setOpenDialogEdit] = useState(false);
  const [openDialogCreate, setOpenDialogCreate] = useState(false);
  const [created, setCreated] = useState<CarSize | null>(null);
  const [editing, setEditing] = useState<CarSize | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Phân trang
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await getAllCarSizes();
    setLoading(false);
  };

  const handleEdit = (carSize: CarSize) => {
    setEditing(carSize);
    setOpenDialogEdit(true);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    await deleteCarSize(id);
    await refreshData();
    setLoading(false);
  };

  const handleSubmit = async (
    form: Omit<CarSize, "id" | "brandCode" | "brandName" | "modelName">,
    id?: number,
  ) => {
    setLoading(true);
    await updateCarSize(form); // nhớ truyền id nếu cần
    await refreshData();
    setOpenDialogEdit(false);
    setEditing(null);
    setLoading(false);
    addToast({
      title: "Thành công",
      description: "Đã cập nhật size xe.",
      color: "success",
    });
  };

  const handleCreate = async (
    form: Omit<
      CreateCarSizeRequest,
      "brandCode" | "brandName" | "modelName" | "size" | "note"
    >,
  ) => {
    try {
      setLoading(true);
      await createCarSize(form);
      await refreshData();
      setOpenDialogCreate(false);
      addToast({
        title: "Thành công",
        description: "Đã thêm loại xe.",
        color: "success",
      });
    } finally {
      setCreated(null);
      setLoading(false);
    }
  };

  const keyword = search.toLowerCase();
  // Lọc + phân trang
  const filtered = (carSizes ?? [])
    .filter((c) => {
      const text = [c.brandName, c.modelName, c.modelCode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(keyword);
    })
    .sort(
      (a, b) =>
        (a.brandName ?? "").localeCompare(b.brandName ?? "", "vi") ||
        (a.modelName ?? "").localeCompare(b.modelName ?? "", "vi"),
    );

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Quản lý Size xe</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-bold">Quản lý Size xe</h1>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo hãng, tên xe, mã xe..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <Button
            onClick={() => {
              setCreated(null);
              setOpenDialogCreate(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm xe
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <CarSizeTable
            carSizes={paginated}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

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
            <span className="flex items-center">
              Trang {page} / {totalPages}
            </span>
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
          open={openDialogEdit}
          onClose={() => {
            setOpenDialogEdit(false);
            setEditing(null);
          }}
          onSubmit={handleSubmit}
          initialData={editing}
        />

        <CarSizeCreateDialog
          open={openDialogCreate}
          onClose={() => {
            setOpenDialogCreate(false);
          }}
          brands={Array.from(
            new Map(carSizes.map((c) => [c.brandCode, c])).values(),
          ).map((c) => ({
            id: c.brandCode,
            name: c.brandName ?? c.brandCode,
          }))}
          onSubmit={handleCreate}
        />
      </div>
    </SidebarInset>
  );
}
