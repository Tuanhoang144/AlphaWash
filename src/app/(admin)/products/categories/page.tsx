"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductCategoryManager } from "@/services/useProductCategoryManager";
import { ProductCategory } from "@/types/Product";
import { useEffect, useMemo, useState } from "react";
import { CategoryDialog } from "./components/CategoryDialog";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Table } from "antd";

export default function CategoriesPage() {
  const { getAll, create, update, remove } = useProductCategoryManager();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setCategories(await getAll());
    setLoading(false);
  };

  const handleSubmit = async (data: Partial<ProductCategory>) => {
    setLoading(true);
    if (editing) {
      await update(editing.code, data);
    } else {
      await create(data);
    }
    await refreshData();
    setOpenDialog(false);
    setEditing(null);
    setLoading(false);
  };

  const handleDelete = async (code: string) => {
    setLoading(true);
    await remove(code);
    await refreshData();
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return categories.filter((c) =>
      c.categoryName?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  const columns = [
    { title: "Mã", dataIndex: "code", key: "code", width: 100 },
    { title: "Tên danh mục", dataIndex: "categoryName", key: "categoryName" },
    {
      title: "Màu",
      key: "color",
      render: (_: unknown, r: ProductCategory) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded" style={{ backgroundColor: r.color || "#ccc" }} />
          <span className="text-xs">{r.color}</span>
        </div>
      ),
    },
    { title: "Thứ tự", dataIndex: "displayOrder", key: "displayOrder", width: 80 },
    {
      title: "Trạng thái",
      key: "isActive",
      render: (_: unknown, r: ProductCategory) => (
        <span className={`px-2 py-1 rounded text-xs ${r.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {r.isActive ? "Hoạt động" : "Ngừng"}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_: unknown, r: ProductCategory) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpenDialog(true); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => handleDelete(r.code)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <SidebarInset>
      <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-10">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products/categories">Danh mục</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Danh mục sản phẩm</h1>
          <Button onClick={() => { setEditing(null); setOpenDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Tìm danh mục..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Table dataSource={filtered} columns={columns} rowKey="code" loading={loading} pagination={false} size="small" />
      </div>

      <CategoryDialog open={openDialog} onOpenChange={setOpenDialog} editing={editing} onSubmit={handleSubmit} />
    </SidebarInset>
  );
}
